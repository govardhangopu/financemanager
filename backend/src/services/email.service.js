import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
    const { data, error } = await resend.emails.send({
        from: "Finance Manager <onboarding@resend.dev>",
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const sendTestEmail = async (to) => {
    return sendEmail({
        to,
        subject: "Finance Manager test email",
        html: "<h1>It works!</h1><p>This email was sent from Finance Manager.</p>"
    });
};