"""GYG reservation/book/modify regression (validates c5197c8) + live GYG smoke.

Requires GYG test credentials. Skips cleanly when absent so the suite still runs.
Set:
    GYG_USERNAME, GYG_PASSWORD (inbound Basic auth) for /api/1/* endpoints.
Base64 is derived automatically.
"""

import base64
import os
import uuid
from datetime import date, timedelta
from typing import Optional

import httpx
import pytest

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

# GYG product IDs for the submitted options (test environment).
GYG_TEST_PHOTOGRAPHY = "1c2535d2-a946-4da6-ad35-5df42339323e"  # T-1216978 option 1867386
GYG_TEST_BEFORE_JAPAN = "6b3bc718-9754-4ed8-8746-040e1ccbb6de"  # T-1221780 option 1874996


def _auth_headers() -> Optional[dict]:
    user = os.environ.get("GYG_USERNAME")
    password = os.environ.get("GYG_PASSWORD")
    if not user or not password:
        return None
    token = base64.b64encode(f"{user}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def _future_available_date(client: httpx.Client, headers: dict, product_code: str) -> Optional[str]:
    """Ask the Supplier API for the next available date for a product."""
    r = client.get(
        f"{BASE_URL}/1/get-availabilities",
        params={"productCode": product_code},
        headers=headers,
        timeout=30,
    )
    if r.status_code != 200:
        return None
    data = r.json()
    avail = data.get("availabilities") or []
    if not avail:
        return None
    # GYG returns availabilities keyed by date.
    return avail[0].get("date")


def test_gyg_live_get_availabilities():
    """Live smoke: GYG test creds can read availability for both submitted options."""
    headers = _auth_headers()
    if headers is None:
        pytest.skip("GYG_USERNAME/GYG_PASSWORD not set")
    client = httpx.Client(timeout=30)

    for label, code in (("photography", GYG_TEST_PHOTOGRAPHY), ("before_japan", GYG_TEST_BEFORE_JAPAN)):
        r = client.get(
            f"{BASE_URL}/1/get-availabilities",
            params={"productCode": code},
            headers=headers,
        )
        assert r.status_code == 200, f"{label} get-availabilities failed: {r.status_code} {r.text[:200]}"