interface CustomTimeNotificationParams {
  tourName: string;
  date: string;
  startTime: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
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

export function customTimeNotificationEmail(params: CustomTimeNotificationParams): {
  to: string;
  subject: string;
  html: string;
} {
  const {
    tourName,
    date,
    startTime,
    guestCount,
    customerName,
    customerEmail,
    customerPhone,
    baseUrl,
  } = params;

  const guestWord = guestCount === 1 ? "guest" : "guests";

  return {
    to: customerEmail, // Will be overridden by caller with operator email
    subject: `Custom Time Request — ${tourName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 20px; margin-bottom: 24px;">Custom Time Request</h1>

  <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>${tourName}</strong></p>
    <p style="margin: 0 0 4px 0;">Requested: ${formatDate(date)} at ${startTime}</p>
    <p style="margin: 0 0 4px 0;">${guestCount} ${guestWord}</p>
  </div>

  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h2 style="font-size: 16px; margin: 0 0 12px 0;">Customer Details</h2>
    <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ${customerName}</p>
    <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${customerEmail}</p>
    ${customerPhone ? `<p style="margin: 0 0 4px 0;"><strong>Phone:</strong> ${customerPhone}</p>` : ""}
  </div>

  <div style="margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>Next steps:</strong></p>
    <ol style="margin: 0; padding-left: 20px;">
      <li>Check your calendar for ${formatDate(date)} at ${startTime}</li>
      <li>Reply to ${customerName} to confirm or suggest an alternative time</li>
      <li>Block the time slot on Google Calendar once confirmed</li>
    </ol>
  </div>

  <a href="${baseUrl}/calendar" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Open Calendar</a>
</body>
</html>`,
  };
}
