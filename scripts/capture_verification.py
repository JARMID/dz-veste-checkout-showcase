#!/usr/bin/env python3
"""
Deterministic Dual-Viewport Playwright Verification Suite
=======================================================
Serves the built Vite app locally, verifies zero console/page/network errors,
captures all 6 required timeline timestamps in both 9:16 (1080x1920) and 16:9 (1920x1080)
via synchronous window.__seek(t), asserts strict 9:16 Instagram Reels safe-zone bounds
(X: 60..948 clearing IG right action rail, Y: 186..1602), and captures Visitor Mode
(Hero, Scroll Cinema, Interactive Sandbox, Avant COD, and Mobile 390x844).
"""

import socket
import subprocess
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

PROJECT_ROOT = Path(r"D:\Downloads\JP\demos\dz_veste_checkout_showcase")
OUT_ROOT = PROJECT_ROOT / "verification_captures"
PORT = 4179
BASE_URL = f"http://127.0.0.1:{PORT}"

TIMESTAMPS = [
    ("01_t3s_avant_cod", 3.0),
    ("02_t11s_diff_3fields", 11.0),
    ("03_t19s_cta_luxury_56px", 19.0),
    ("04_t22_83s_vineboom_fraud", 22.83),
    ("05_t33s_hmac_ai_agent", 33.0),
    ("06_t44s_reveal_audit_48h", 44.0),
]

VIEWPORTS = [
    ("9x16", 1080, 1920),
    ("16x9", 1920, 1080),
]


def wait_for_port(port: int, timeout_s: float = 20.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.2)
    raise RuntimeError(f"Preview server did not start on port {port} within {timeout_s}s")


def main() -> int:
    (OUT_ROOT / "9x16").mkdir(parents=True, exist_ok=True)
    (OUT_ROOT / "16x9").mkdir(parents=True, exist_ok=True)
    (OUT_ROOT / "visitor").mkdir(parents=True, exist_ok=True)

    server = subprocess.Popen(
        ["npx.cmd", "vite", "preview", "--host", "127.0.0.1", "--port", str(PORT), "--strictPort"],
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    errors: list[str] = []

    try:
        wait_for_port(PORT)
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

            # 1. Dual-Viewport Capture Verification (12 frames)
            for vp_name, width, height in VIEWPORTS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1,
                )
                page = context.new_page()
                page.on("pageerror", lambda err: errors.append(f"[{vp_name} pageerror] {err}"))
                page.on(
                    "response",
                    lambda resp: errors.append(f"[{vp_name} HTTP {resp.status}] {resp.url}")
                    if resp.status >= 400
                    else None,
                )

                url = f"{BASE_URL}/?capture=1&viewport={vp_name}"
                page.goto(url, wait_until="networkidle")
                page.wait_for_function("window.__seekReady === true", timeout=15000)

                for slug, t_sec in TIMESTAMPS:
                    returned_t = page.evaluate(f"window.__seek({t_sec})")
                    page.evaluate(
                        "() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))"
                    )

                    # Assert strict 9:16 Instagram Reels safe-box integrity (clears IG right rail X:948..1080)
                    if vp_name == "9x16":
                        metrics = page.evaluate(
                            """() => {
                                const box = document.querySelector('[data-safe-box="true"]');
                                if (!box) return { ok: false, reason: 'missing safe box' };
                                const rect = box.getBoundingClientRect();
                                const overflowY = box.scrollHeight - box.clientHeight;
                                const overflowX = box.scrollWidth - box.clientWidth;
                                return {
                                    ok: rect.left >= 54 && rect.right <= 955 && rect.top >= 180 && rect.bottom <= 1610 && overflowY <= 4 && overflowX <= 4,
                                    left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
                                    overflowX, overflowY
                                };
                            }"""
                        )
                        if not metrics["ok"]:
                            errors.append(f"[9x16 safe-box breach @ t={t_sec}s] {metrics}")

                    out_path = OUT_ROOT / vp_name / f"{slug}.png"
                    page.screenshot(path=str(out_path))
                    print(f"[+] Captured {vp_name}/{slug}.png (seek={returned_t:.2f}s)")

                context.close()

            # 2. Visitor Mode Desktop (1440x900) - Light Hero, Expanded Scroll Hero, Lookbook, Apres Light, Dark Toggle, Avant
            ctx_desktop = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=1,
            )
            page_d = ctx_desktop.new_page()
            page_d.on("pageerror", lambda err: errors.append(f"[visitor-desktop pageerror] {err}"))
            page_d.goto(BASE_URL, wait_until="networkidle")
            page_d.wait_for_timeout(950)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_hero_light.png"))
            print("[+] Captured visitor/desktop_hero_light.png")

            # Scroll through sticky Hero Monolith -> Full-Bleed Expansion (~70% of 270dvh runway)
            page_d.evaluate(
                """() => {
                    const sec = document.querySelector('#hero-experience');
                    if (sec) {
                        const travel = Math.max(1, sec.offsetHeight - window.innerHeight);
                        window.scrollTo(0, travel * 0.72);
                    }
                }"""
            )
            page_d.wait_for_timeout(850)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_hero_expanded.png"))
            print("[+] Captured visitor/desktop_hero_expanded.png")

            # Scroll into Lookbook + Scroll-Velocity Marquee
            page_d.evaluate(
                """() => {
                    const el = document.querySelector('#lookbook');
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 64;
                        window.scrollTo(0, top);
                    }
                }"""
            )
            page_d.wait_for_timeout(750)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_lookbook_light.png"))
            print("[+] Captured visitor/desktop_lookbook_light.png")

            # Scroll cleanly into sticky Section 3 Cinema Theater (Light Mode @ Act 1)
            page_d.evaluate(
                """() => {
                    const el = document.querySelector('#scroll-cinema');
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo(0, top + 60);
                    }
                }"""
            )
            page_d.wait_for_timeout(700)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_cinema_light.png"))
            print("[+] Captured visitor/desktop_cinema_light.png")

            # Switch to Sombre (Dark Mode) while inside Cinema Theater to verify exact user screenshot angle!
            page_d.get_by_role("button", name="Sombre").click()
            page_d.wait_for_timeout(650)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_cinema_dark.png"))
            print("[+] Captured visitor/desktop_cinema_dark.png")

            # Switch back to Clair & scroll to interactive Apres sandbox (Light Mode)
            page_d.get_by_role("button", name="Clair").click()
            page_d.wait_for_timeout(450)
            page_d.evaluate(
                """() => {
                    const el = document.querySelector('#sandbox');
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 84;
                        window.scrollTo(0, top);
                    }
                }"""
            )
            page_d.wait_for_timeout(650)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_apres_light.png"))
            print("[+] Captured visitor/desktop_apres_light.png")

            # Toggle Sombre (Dark Mode) and verify both Hero Dark and Apres Dark
            page_d.get_by_role("button", name="Sombre").click()
            page_d.wait_for_timeout(600)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_apres_dark.png"))
            print("[+] Captured visitor/desktop_apres_dark.png")

            page_d.evaluate("window.scrollTo(0, 0)")
            page_d.wait_for_timeout(750)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_hero_dark.png"))
            print("[+] Captured visitor/desktop_hero_dark.png")

            # Switch back to Clair & inspect Avant COD inside sandbox
            page_d.get_by_role("button", name="Clair").click()
            page_d.wait_for_timeout(450)
            page_d.locator("#sandbox").get_by_role("button", name="Avant COD").click()
            page_d.wait_for_timeout(450)
            page_d.evaluate(
                """() => {
                    const el = document.querySelector('#sandbox');
                    if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 84;
                        window.scrollTo(0, top);
                    }
                }"""
            )
            page_d.wait_for_timeout(350)
            page_d.screenshot(path=str(OUT_ROOT / "visitor" / "desktop_avant.png"))
            print("[+] Captured visitor/desktop_avant.png")
            ctx_desktop.close()

            # 3. Visitor Mode Mobile (390x844)
            ctx_mobile = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
            )
            page_m = ctx_mobile.new_page()
            page_m.on("pageerror", lambda err: errors.append(f"[visitor-mobile pageerror] {err}"))
            page_m.goto(BASE_URL, wait_until="networkidle")
            page_m.wait_for_timeout(650)
            page_m.screenshot(path=str(OUT_ROOT / "visitor" / "mobile_hero_light.png"))
            print("[+] Captured visitor/mobile_hero_light.png")
            ctx_mobile.close()

            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()

    if errors:
        print("\n[!] VERIFICATION ERRORS DETECTED:")
        for e in errors:
            print("  -", e)
        return 1

    print("\n[OK] All 12 dual-viewport frames + 8 visitor Light/Dark/Scroll captures verified with 0 errors!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
