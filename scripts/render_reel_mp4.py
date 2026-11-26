#!/usr/bin/env python3
"""
Parallel Deterministic 60fps Playwright -> FFmpeg 8.1 MP4 Reel Renderer
=======================================================================
Renders lossless-quality 60fps deterministic frames from `?capture=1&viewport=9x16`
(1080x1920) or `16x9` (1920x1080) using 4 parallel Playwright workers piped directly
into FFmpeg (zero pipe deadlocks, zero 3,000-file disk bloat), then concatenates and
muxes Khalef Abdelmadjid's mastered WAV (`hyper_master_with_vineboom.wav`, 49.43s,
-14.5 LUFS, Vine Boom peak @ 22.83s).
"""

import argparse
import concurrent.futures
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

PROJECT_ROOT = Path(r"D:\Downloads\JP\demos\dz_veste_checkout_showcase")
AUDIO_WAV = Path(r"D:\Downloads\JP\audio\final_reel_mixes\hyper_full_mix.wav")
OUT_DIR = PROJECT_ROOT / "exports"
REELS_READY_DIR = Path(r"D:\Downloads\JP\exports\instagram\reels_ready")
PORT = 4183


def wait_for_port(port: int, timeout_s: float = 20.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.2)
    raise RuntimeError(f"Preview server did not start on port {port}")


def probe_nvenc_runtime() -> bool:
    """Verify h264_nvenc actually initializes on the host GPU (not merely compiled in)."""
    try:
        res = subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error",
                "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.05",
                "-c:v", "h264_nvenc", "-f", "null", "-",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=8,
        )
        return res.returncode == 0
    except Exception:
        return False


def render_slice(task: tuple[int, int, int, int, int, int, str, str, int, bool, str]) -> str:
    worker_id, start_frame, end_frame, width, height, fps, viewport, theme, port, use_nvenc, tmp_dir = task
    seg_path = Path(tmp_dir) / f"seg_{worker_id:02d}.mp4"
    log_path = Path(tmp_dir) / f"seg_{worker_id:02d}.log"

    vcodec_args = (
        ["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "17", "-b:v", "0"]
        if use_nvenc
        else ["-c:v", "libx264", "-preset", "fast", "-crf", "16"]
    )

    ffmpeg_cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "warning",
        "-protocol_whitelist", "file,pipe,fd",
        "-f", "image2pipe", "-vcodec", "mjpeg", "-framerate", str(fps), "-i", "-",
        "-vf", "scale=in_range=full:out_range=tv,format=yuv420p",
        *vcodec_args,
        "-profile:v", "high", "-level:v", "4.2",
        "-pix_fmt", "yuv420p", "-color_range", "tv",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        "-an",
        str(seg_path),
    ]

    with open(log_path, "wb") as log_fh:
        ff = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=log_fh,
        )
        assert ff.stdin is not None
        t0 = time.time()
        count = end_frame - start_frame
        ok_frames = False
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        "--use-gl=angle",
                        "--use-angle=swiftshader",
                        "--enable-webgl",
                        "--ignore-gpu-blocklist",
                    ],
                )
                try:
                    context = browser.new_context(
                        viewport={"width": width, "height": height},
                        device_scale_factor=1,
                    )
                    page = context.new_page()
                    page.route(
                        "**/*",
                        lambda route: route.continue_()
                        if route.request.url.startswith(f"http://127.0.0.1:{port}/")
                        else route.abort(),
                    )
                    cdp = context.new_cdp_session(page)
                    url = f"http://127.0.0.1:{port}/?capture=1&viewport={viewport}&theme={theme}"
                    page.goto(url, wait_until="networkidle")
                    page.wait_for_function("window.__seekReady === true", timeout=20000)

                    import base64

                    for local_i, frame_idx in enumerate(range(start_frame, end_frame)):
                        t_sec = frame_idx / fps
                        page.evaluate("(t) => window.__seek(t)", t_sec)
                        shot = cdp.send(
                            "Page.captureScreenshot",
                            {"format": "jpeg", "quality": 95, "fromSurface": True},
                        )
                        ff.stdin.write(base64.b64decode(shot["data"]))
                        if (local_i + 1) % 150 == 0 or local_i == count - 1:
                            elapsed = time.time() - t0
                            fps_eff = (local_i + 1) / max(0.001, elapsed)
                            print(
                                f"    [W{worker_id}] {local_i + 1}/{count} frames ({fps_eff:.1f} fps)",
                                flush=True,
                            )
                    ok_frames = True
                finally:
                    browser.close()
        finally:
            try:
                ff.stdin.close()
            except Exception:
                pass
            if not ok_frames and ff.poll() is None:
                ff.terminate()
                try:
                    ff.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    ff.kill()
                    ff.wait()

        rc = ff.wait()
        if rc != 0:
            err_txt = log_path.read_text(encoding="utf-8", errors="ignore")
            raise RuntimeError(f"Worker {worker_id} FFmpeg failed ({rc}): {err_txt[-500:]}")

    return str(seg_path)


def render_mp4(viewport: str, fps: int, workers: int, out_path: Path, theme: str = "dark") -> None:
    if viewport not in {"9x16", "16x9"}:
        raise ValueError(f"Invalid --viewport ({viewport!r}); expected '9x16' or '16x9'")
    if theme not in {"dark", "light"}:
        raise ValueError(f"Invalid --theme ({theme!r}); expected 'dark' or 'light'")
    if not (1 <= fps <= 120) or not (1 <= workers <= 16):
        raise ValueError(f"Invalid --fps ({fps}) or --workers ({workers}); expected fps 1..120, workers 1..16")
    width, height = (1080, 1920) if viewport == "9x16" else (1920, 1080)
    duration_sec = 49.43
    total_frames = int(round(duration_sec * fps))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tmp_dir = tempfile.mkdtemp(prefix="atlas_reel_render_")

    vite_js = PROJECT_ROOT / "node_modules" / "vite" / "bin" / "vite.js"
    if not vite_js.is_file():
        raise FileNotFoundError(f"Local vite entrypoint not found: {vite_js}")
    server = subprocess.Popen(
        ["node", str(vite_js), "preview", "--host", "127.0.0.1", "--port", str(PORT), "--strictPort"],
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    t_start = time.time()
    try:
        wait_for_port(PORT)
        use_nvenc = probe_nvenc_runtime()
        encoder_label = "NVENC (GPU)" if use_nvenc else "libx264 (CPU fast)"
        print(
            f"[*] Rendering {viewport} ({theme}, {width}x{height}) @ {fps}fps ({total_frames} frames) "
            f"using {workers} parallel workers + {encoder_label}...",
            flush=True,
        )

        # Partition frames evenly across workers
        tasks = []
        base = total_frames // workers
        rem = total_frames % workers
        cursor = 0
        for w in range(workers):
            span = base + (1 if w < rem else 0)
            tasks.append((w, cursor, cursor + span, width, height, fps, viewport, theme, PORT, use_nvenc, tmp_dir))
            cursor += span

        with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as ex:
            seg_files = list(ex.map(render_slice, tasks))

        # Concatenate segments safely (relative basenames + -safe 1 + protocol_whitelist) and mux audio
        concat_list = Path(tmp_dir) / "concat.txt"
        concat_list.write_text(
            "\n".join(f"file '{Path(sf).name}'" for sf in seg_files),
            encoding="utf-8",
        )
        mux_cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "warning",
            "-protocol_whitelist", "file,pipe",
            "-f", "concat", "-safe", "1", "-i", str(concat_list),
            "-protocol_whitelist", "file,pipe",
            "-i", str(AUDIO_WAV),
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-movflags", "+faststart",
            "-shortest",
            str(out_path),
        ]
        res = subprocess.run(mux_cmd, capture_output=True, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg mux failed: {res.stderr}")

        size_mb = out_path.stat().st_size / (1024 * 1024)
        REELS_READY_DIR.mkdir(parents=True, exist_ok=True)
        suffix = "_LIGHT" if theme == "light" else ""
        ready_dst = REELS_READY_DIR / f"01_hyper_jarmid{suffix}_{viewport}_{fps}fps.mp4"
        shutil.copy2(out_path, ready_dst)
        print(
            f"[OK] Rendered {out_path} ({size_mb:.2f} MB) & copied -> {ready_dst} in {time.time() - t_start:.1f}s!",
            flush=True,
        )
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--viewport", choices=["9x16", "16x9"], default="9x16")
    parser.add_argument("--theme", choices=["dark", "light"], default="dark")
    parser.add_argument("--fps", type=int, default=60)
    parser.add_argument("--workers", type=int, default=min(4, max(2, (os.cpu_count() or 4) // 2)))
    args = parser.parse_args()
    suffix = "_light" if args.theme == "light" else ""
    out_file = OUT_DIR / f"atlas_hyperplexed{suffix}_{args.viewport}_{args.fps}fps.mp4"
    render_mp4(args.viewport, args.fps, args.workers, out_file, theme=args.theme)
    return 0


if __name__ == "__main__":
    sys.exit(main())
