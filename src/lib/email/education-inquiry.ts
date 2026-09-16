interface EducationInquiryEmailParams {
  schoolName: string;
  contactName: string;
  email: string;
  phone?: string;
  subject?: string;
  angle?: string;
  schoolType: string;
  classSize: string;
  language: string;
  materials: string[];
  preferredDates?: string;
  notes?: string;
  locale: string;
}

export function educationInquiryEmail(
  params: EducationInquiryEmailParams
): { subject: string; html: string } {
  const subject = `New Education Inquiry — ${params.schoolName}`;

  const materialsList =
    params.materials.length > 0
      ? params.materials.map((m) => `<li>${m}</li>`).join("")
      : "<li>None selected</li>";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1510;">
  <h2 style="color: #2c3e6b; border-bottom: 2px solid #e2ddd5; padding-bottom: 10px;">
    New Education Inquiry
  </h2>
  
  <p style="font-size: 16px; line-height: 1.6;">
    <strong>${params.contactName}</strong> from <strong>${params.schoolName}</strong> has submitted an inquiry through the education pages.
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600; width: 140px;">School</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.schoolName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Contact</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.contactName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Email</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;"><a href="mailto:${params.email}">${params.email}</a></td>
    </tr>
    ${
      params.phone
        ? `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Phone</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.phone}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">School Type</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.schoolType}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5; font-weight: 600;">Class Size</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2ddd5;">${params.classSize}</td>
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
    params.subject
      ? `<h3 style="color: #2c3e6b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Subject / Course</h3>
  <p style="font-size: 15px; line-height: 1.5; background: #f5f2ed; padding: 12px; border-radius: 4px;">${params.subject}</p>`
      : ""
  }

  ${
    params.angle
      ? `<h3 style="color: #2c3e6b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Angle / Question</h3>
  <p style="font-size: 15px; line-height: 1.5; background: #f5f2ed; padding: 12px; border-radius: 4px; font-style: italic;">${params.angle}</p>`
      : ""
  }

  <h3 style="color: #2c3e6b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Follow-up Materials</h3>
  <ul style="font-size: 15px; line-height: 1.5; background: #f5f2ed; padding: 12px 12px 12px 32px; border-radius: 4px;">
    ${materialsList}
  </ul>

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
    Submitted via osakacastletours.com/education · ${new Date().toISOString()}
  </p>
</body>
</html>`;

  return { subject, html };
}
