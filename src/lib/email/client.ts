import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = `Osaka Castle Walks with Edward <noreply@send.osakacastletours.com>`;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log("[Email] Sent:", result.data?.id, "->", to);
    return { ok: true, id: result.data?.id };
  } catch (e) {
    const err = e instanceof Error ? e.message : JSON.stringify(e);
    console.error("[Email] Failed to send to", to, ":", err);
    return { ok: false, error: err };
  }
}
