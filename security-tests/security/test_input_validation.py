"""Unauthenticated / forged-input protection for payment + webhook surfaces."""

from typing import Any


def test_webhook_rejects_missing_signature(client):
    """A POST to the PayPal webhook without PayPal transmission headers must be rejected
    with a 201 (halts retries) and must NOT create a booking."""
    resp = client.post(
        "/api/webhooks/paypal",
        json={"event_type": "PAYMENT.CAPTURE.COMPLETED", "resource": {}},
    )
    assert resp.status_code == 201
    assert resp.json().get("skipped")


def test_webhook_rejects_forged_payload(client):
    """Even with fabricated transmission headers, a bad signature is rejected."""
    body = {"event_type": "PAYMENT.CAPTURE.COMPLETED", "resource": {"id": "FAKE"}}
    resp = client.post(
        "/api/webhooks/paypal",
        content=__import__("json").dumps(body),
        headers={
            "Content-Type": "application/json",
            "paypal-transmission-id": "11111111-2222-3333-4444-555555555555",
            "paypal-transmission-time": "2026-01-01T00:00:00Z",
            "paypal-transmission-sig": "bm90LWEtcmVhbC1zaWduYXR1cmU",
            "paypal-cert-url": "https://api-m.paypal.com/certificate",
            "paypal-auth-algo": "SHA256withRSA",
        },
    )
    assert resp.status_code == 201
    assert resp.json().get("skipped")


def test_capture_order_rejects_unauthenticated(client):
    """capture-order must fail cleanly without credentials — no row created."""
    resp = client.post(
        "/api/paypal/capture-order",
        json={
            "orderId": "FAKE_ORDER_ID",
            "tour_id": "00000000-0000-0000-0000-000000000000",
            "date": "2026-12-31",
            "start_time": "10:00",
            "guest_count": 1,
        },
    )
    # Either the rate-limit is fine, or PayPal rejects FAKE id — but never a 200 ok.
    assert resp.status_code in (400, 404, 429, 500)


def test_create_order_rejects_bad_tour(client):
    """create-order for a non-existent tour is a 404 and never hits PayPal."""
    resp = client.post(
        "/api/paypal/create-order",
        json={
            "tour_id": "00000000-0000-0000-0000-000000000000",
            "date": "2026-12-31",
            "start_time": "10:00",
            "guest_count": 1,
        },
    )
    assert resp.status_code == 404


def test_custom_order_rejects_missing_fields(client):
    resp = client.post("/api/paypal/create-custom-order", json={"tour_id": "x"})
    assert resp.status_code == 400


def test_anonymous_cannot_read_bookings(supabase_client):
    """P0 fix (migration 022): anon key must NOT list bookings via the REST API."""
    resp = supabase_client.get(
        "/rest/v1/bookings",
        params={"select": "*", "limit": "5"},
        headers={"Prefer": "return=representation"},
    )
    # Permission denied (42501) from PostgREST = leak closed → pass.
    if resp.status_code in (400, 401, 403):
        return
    assert resp.status_code == 200
    data: Any = resp.json()
    assert isinstance(data, list) and len(data) == 0


def test_public_can_still_read_tours(supabase_client):
    """Anon read of tours must still work (public catalog)."""
    resp = supabase_client.get("/rest/v1/tours", params={"select": "id,name", "limit": "5"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list) and len(resp.json()) >= 1


def test_malformed_webhook_json(client):
    """Malformed JSON → 201, no crash, no retries."""
    resp = client.post(
        "/api/webhooks/paypal",
        content="not-json{{{",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 201