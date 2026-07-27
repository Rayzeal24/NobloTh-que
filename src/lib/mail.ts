import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; html: string };

export async function sendMail(mail: Mail) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "NobloThèque <onboarding@resend.dev>",
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
      }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error(`[Resend] Échec ${response.status}: ${details}`);
      throw new Error("Le fournisseur d’e-mails a refusé l’envoi.");
    }
    return;
  }

  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== "production") console.info(`[mail dev] ${mail.subject} → ${mail.to}\n${mail.html}`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? "NobloThèque <noreply@example.com>",
    ...mail,
  });
}
