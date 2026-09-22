interface WeeklyReportHit {
  lang: "JA" | "EN";
  query: string;
  page: string;
  rank?: string;
  note?: string;
}

interface WeeklyReportEmailParams {
  roundName: string;
  runDate: string;
  hits: WeeklyReportHit[];
  verdict: string;
}

export function weeklyReportEmail(params: WeeklyReportEmailParams): {
  subject: string;
  html: string;
} {
  const { roundName, runDate, hits, verdict } = params;

  const hitsHtml =
    hits.length === 0
      ? `<p style="margin: 0; font-size: 14px; line-height: 1.6;">No education-page hits this round. The full 35-query results are recorded in <code>AGENTIC_MATRIX.md</code>.</p>`
      : `<table style="width: 100%; border-collapse: collapse; margin: 0; font-size: 13px;">
           <thead>
             <tr style="text-align: left; border-bottom: 2px solid #e5e5e5;">
               <th style="padding: 6px 8px;">Lang</th>
               <th style="padding: 6px 8px;">Query</th>
               <th style="padding: 6px 8px;">Education page</th>
               <th style="padding: 6px 8px;">Rank</th>
             </tr>
           </thead>
           <tbody>
             ${hits
               .map(
                 (h) => `<tr style="border-bottom: 1px solid #f0f0f0;">
                   <td style="padding: 6px 8px;">${h.lang}</td>
                   <td style="padding: 6px 8px;">${h.query}</td>
                   <td style="padding: 6px 8px;"><a href="https://osakacastletours.com${h.page}" style="color: #1a6bb5;">${h.page}</a></td>
                   <td style="padding: 6px 8px;">${h.rank ?? "—"}</td>
                 </tr>`
               )
               .join("\n             ")}
           </tbody>
         </table>`;

  return {
    subject: `Agentic Discovery Check — ${roundName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">Agentic Discovery Check</h1>
  <p style="margin: 0 0 24px 0; font-size: 13px; color: #666;">${roundName} · run ${runDate} · 35 frozen queries · JA + EN kept separate</p>

  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    ${hitsHtml}
  </div>

  <h2 style="font-size: 16px; margin: 0 0 8px 0;">What it means</h2>
  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6;">${verdict}</p>

  <p style="margin: 0; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px;">
    Full per-query table lives in AGENTIC_MATRIX.md at the repo root. Query set is frozen;
    deep chat-model spot-checks happen at the 2/4/8-week marks.
  </p>
</body>
</html>`,
  };
}