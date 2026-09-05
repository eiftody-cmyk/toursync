interface OperatorNotificationEmailParams {
  operatorEmail: string;
  tourName: string;
  date: string;
  startTime: string | null;
  guestCount: number;
  customerEmail: string | null;
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

export function operatorNotificationEmail(params: OperatorNotificationEmailParams): {
  to: string;
  subject: string;
  html: string;
} {
  const {
    operatorEmail,
    tourName,
    date,
    startTime,
    guestCount,
    customerEmail,
    baseUrl,
  } = params;

  return {
    to: operatorEmail,
    subject: `New Booking — ${tourName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 20px; margin-bottom: 24px;">New Booking</h1>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>${tourName}</strong></p>
    <p style="margin: 0 0 4px 0;">Date: ${formatDate(date)}</p>
    ${startTime ? `<p style="margin: 0 0 4px 0;">Time: ${startTime}</p>` : ""}
    <p style="margin: 0 0 4px 0;">Guests: ${guestCount}</p>
    ${customerEmail ? `<p style="margin: 0;">Customer: ${customerEmail}</p>` : ""}
  </div>

  <a href="${baseUrl}/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View in Dashboard</a>
</body>
</html>`,
  };
}
