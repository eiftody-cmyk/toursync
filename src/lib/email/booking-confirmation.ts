interface BookingConfirmationEmailParams {
  tourName: string;
  date: string;
  startTime: string | null;
  guestCount: number;
  currency: string;
  pricePerGuest: number;
  bookingId: string;
  baseUrl: string;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function bookingConfirmationEmail(params: BookingConfirmationEmailParams): {
  subject: string;
  html: string;
} {
  const {
    tourName,
    date,
    startTime,
    guestCount,
    currency,
    pricePerGuest,
    bookingId,
    baseUrl,
  } = params;

  const currencySymbol = currency === "JPY" ? "¥" : currency + " ";
  const total = pricePerGuest * guestCount;
  const manageUrl = `${baseUrl}/book/manage?id=${bookingId}`;

  return {
    subject: `Booking Confirmed — ${tourName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 20px; margin-bottom: 24px;">Booking Confirmed</h1>

  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>${tourName}</strong></p>
    <p style="margin: 0 0 4px 0;">Date: ${formatDate(date)}</p>
    ${startTime ? `<p style="margin: 0 0 4px 0;">Time: ${startTime}</p>` : ""}
    <p style="margin: 0 0 4px 0;">Guests: ${guestCount}</p>
    <p style="margin: 0; font-size: 16px;">Total: ${currencySymbol}${total.toLocaleString()}</p>
  </div>

  <p style="margin-bottom: 24px;">Your booking has been confirmed. Save this email for your records.</p>

  <a href="${manageUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Manage Booking</a>

  <p style="margin-top: 32px; font-size: 13px; color: #666;">
    You can view or cancel your booking (up to 24 hours before the tour) using the link above.
  </p>
</body>
</html>`,
  };
}
