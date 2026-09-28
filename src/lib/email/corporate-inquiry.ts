interface CorporateInquiryEmailParams {
  companyName: string;
  contactName: string;
  email: string;
  groupSize: string;
  language: string;
  preferredDates?: string;
  notes?: string;
  locale: string;
}

export function corporateInquiryEmail(
  params: CorporateInquiryEmailParams
): { subject: string; html: string } {
  const subject = `New Corporate Team-Building Inquiry — ${params.companyName}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1510;">
  <h2 style="color: #2c3e6b; border-bottom: 2px solid #e2ddd5; padding-bottom: 10px;">
    New Corporate Team-Building Inquiry
  </h2>

  <p style="font-size: 16px; line-height: 1.6;">
    <strong>${params.contactName}</strong> from <strong>${params.companyName}</strong> has submitted an inquiry through the corporate pages.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600; width: 140px;">Company</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.companyName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Contact</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.contactName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Email</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;"><a href="mailto:${params.email}">${params.email}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Group Size</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.groupSize}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Language</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.language}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Locale</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.locale}</td>
    </tr>
  </table>

  ${
    params.preferredDates
      ? `<h3 style="color: #2c3e6b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Preferred Dates</h3>
  <p style="font-size: 15px; line-height: 1.5;">${params.preferredDates}</p>`
      : ""
  }

  ${
    params.notes
      ? `<h3 style="color: #2c3e6b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Additional Notes</h3>
  <p style="font-size: 15px; line-height: 1.5; background: #f5f2ed; padding: 12px; border-radius: 4px;">${params.notes}</p>`
      : ""
  }

  <hr style="border: none; border-top: 1px solid #e2ddd5; margin: 24px 0;">

  <p style="font-size: 13px; color: #8a8078;">
    Submitted via osakacastletours.com/corporate · ${new Date().toISOString()}
  </p>
</body>
</html>`;

  return { subject, html };
}
