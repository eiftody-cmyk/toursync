interface CancellationConfirmationParams {
  tourName: string;
  date: string;
  startTime: string | null;
  guestCount: number;
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

export function cancellationConfirmationEmail(params: CancellationConfirmationParams): {
  subject: string;
  html: string;
} {
  const { tourName, date, startTime, guestCount, baseUrl } = params;

  return {
    subject: `Booking Cancelled — ${tourName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 20px; margin-bottom: 24px;">Booking Cancelled</h1>

  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>${tourName}</strong></p>
    <p style="margin: 0 0 4px 0;">Date: ${formatDate(date)}</p>
    ${startTime ? `<p style="margin: 0 0 4px 0;">Time: ${startTime.slice(0, 5)}</p>` : ""}
    <p style="margin: 0 0 4px 0;">Guests: ${guestCount}</p>
  </div>

  <p style="margin-bottom: 24px;">Your booking has been cancelled. No further action is required.</p>

  <p style="margin-bottom: 24px;">If this was a mistake, you can rebook your tour anytime.</p>

  <a href="${baseUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Rebook Tour</a>
</body>
</html>`,
  };
}
