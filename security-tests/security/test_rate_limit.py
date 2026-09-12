"""Per-IP rate limiting on PayPal + auth + webhook surfaces."""

import httpx


def test_create_order_rate_limit(client: httpx.Client):
    """A burst past the limit triggers 429 after the first handful of requests."""
    payload = {
        "tour_id": "00000000-0000-0000-0000-000000000000",
        "date": "2026-12-31",
        "start_time": "10:00",
        "guest_count": 1,
    }
    statuses = []
    for _ in range(30):
        r = client.post("/api/paypal/create-order", json=payload)
        # 404 means the call passed the limiter (bad tour id); 429 means limited.
        statuses.append(r.status_code)

    assert 429 in statuses, f"rate limiter never tripped: {statuses}"


def test_webhook_rate_limit(client: httpx.Client):
    """Webhook returns 201-skip once rate limited (PayPal-friendly)."""
    statuses = []
    for _ in range(50):
        r = client.post("/api/webhooks/paypal", content="{}", headers={"Content-Type": "application/json"})
        statuses.append(r.status_code)

    assert 429 not in statuses, "webhook should rate-limit via 201-skip, not 429"
    assert statuses.count(201) >= 30, f"expected mostly-201 skip responses: {statuses}"