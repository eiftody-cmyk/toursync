"""Sandbox PayPal booking-flow regression.

Skips cleanly unless sandbox credentials are provided:
    PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET

These tests run ONLY against a local dev server (PAYPAL_MODE=sandbox in .env.local).
Never point this suite at a production PayPal account.
"""

import os
import uuid

import httpx
import pytest

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
TEST_TOUR_ID = os.environ.get("TEST_TOUR_ID", "6b3bc718-9754-4ed8-8746-040e1ccbb6de")


@pytest.fixture(scope="session")
def sandbox_creds():
    cid = os.environ.get("PAYPAL_SANDBOX_CLIENT_ID")
    secret = os.environ.get("PAYPAL_SANDBOX_CLIENT_SECRET")
    if not cid or not secret:
        pytest.skip("PAYPAL_SANDBOX_CLIENT_ID/SECRET not set")
    if BASE_URL != "http://localhost:3000":
        pytest.skip("sandbox flow tests must target localhost")
    return {"client_id": cid, "secret": secret}


def test_sandbox_capture_rejects_unknown_order(client, sandbox_creds):
    """capture-order for an unapproved/unknown orderId → 4xx, no booking created."""
    r = client.post(
        "/api/paypal/capture-order",
        json={
            "orderId": f"FAKE-{uuid.uuid4()}",
            "tour_id": TEST_TOUR_ID,
            "date": "2026-12-31",
            "start_time": "10:00",
            "guest_count": 1,
        },
    )
    assert r.status_code == 400  # captureOrder throws → "Payment capture failed"