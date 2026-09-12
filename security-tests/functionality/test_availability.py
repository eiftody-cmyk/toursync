"""Positive-flow regression: cutoff, capacity, availability.

Runs against a local dev server (default) or a deployed BASE_URL.
These tests do not touch money — PayPal order creation is harmless (never captured),
and availability reads are read-only.
"""

import os

import httpx

TEST_TOUR_ID = os.environ.get("TEST_TOUR_ID", "6b3bc718-9754-4ed8-8746-040e1ccbb6de")


def test_health(client: httpx.Client):
    r = client.get("/api/health")
    assert r.status_code == 200


def test_available_dates_shape(client: httpx.Client):
    r = client.get("/api/book/available-dates", params={"tour_id": TEST_TOUR_ID})
    assert r.status_code == 200
    data = r.json()
    assert set(data.keys()) == {"available", "blocked", "full"}


def test_available_dates_unknown_tour(client: httpx.Client):
    r = client.get(
        "/api/book/available-dates",
        params={"tour_id": "00000000-0000-0000-0000-000000000000"},
    )
    # Service-client lookup returns empty availability for an unknown tour (no crash).
    assert r.status_code == 200
    assert r.json()["available"] == []


def test_cutoff_rejected(client: httpx.Client):
    """Same-day slot past the cutoff is rejected by create-order (no PayPal order)."""
    from datetime import date

    today = date.today().isoformat()
    r = client.post(
        "/api/paypal/create-order",
        json={
            "tour_id": TEST_TOUR_ID,
            "date": today,
            "start_time": "00:05",  # a long-past slot on today
            "guest_count": 1,
        },
    )
    # Either the rate limiter 429s, the cutoff 400s, or the tour has no today schedule.
    assert r.status_code in (400, 404, 429)


def test_capacity_enforced(client: httpx.Client):
    """A guest_count far above capacity must be rejected (no order created)."""
    from datetime import date, timedelta

    future = (date.today() + timedelta(days=60)).isoformat()
    r = client.post(
        "/api/paypal/create-order",
        json={
            "tour_id": TEST_TOUR_ID,
            "date": future,
            "start_time": "10:00",
            "guest_count": 999,
        },
    )
    assert r.status_code in (400, 404, 429)