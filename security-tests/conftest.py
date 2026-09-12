"""Shared fixtures and helpers for the toursync security/functionality test battery."""
import os
from typing import Optional

import httpx
import pytest

# Base URL: default to local dev server (next dev --webpack on :3000).
# Override with BASE_URL to test a deployed environment.
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

# Supabase project (for RLS / PII tests). Override with SUPABASE_URL + SUPABASE_ANON_KEY.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://yxqhxmurckdjiulfdvpc.supabase.co")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")


@pytest.fixture(scope="session")
def client() -> httpx.Client:
    return httpx.Client(base_url=BASE_URL, timeout=20.0)


@pytest.fixture(scope="session")
def supabase_client() -> Optional[httpx.Client]:
    if not SUPABASE_ANON_KEY:
        pytest.skip("SUPABASE_ANON_KEY not set")
    return httpx.Client(
        base_url=SUPABASE_URL,
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        },
        timeout=20.0,
    )


# A valid tour id in the dev/staging DB for positive-flow tests.
TEST_TOUR_ID = os.environ.get("TEST_TOUR_ID", "6b3bc718-9754-4ed8-8746-040e1ccbb6de")


def bootstrap():
    """Attempt to start a local next dev server if BASE_URL is the default and unreachable."""
    if BASE_URL != "http://localhost:3000":
        return
    try:
        httpx.get(BASE_URL + "/api/health", timeout=3)
        return
    except Exception:
        import subprocess
        import time

        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        subprocess.Popen(
            ["npx", "next", "dev", "--webpack", "-p", "3000"],
            cwd=root,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(60):
            try:
                httpx.get(BASE_URL + "/api/health", timeout=2)
                return
            except Exception:
                time.sleep(1)
        raise RuntimeError("Local dev server did not come up in 60s")


@pytest.fixture(scope="session", autouse=True)
def _ensure_server():
    bootstrap()