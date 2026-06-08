import { Resend } from "resend";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const data = await resend.emails.send({
      from: "Business Health Reporter <noreply@businesshealthreporter.com>",
      to,
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export const sendPaymentFailedEmail = async (to: string, subscriptionId: string) => {
  const subject = "Payment Failed for Your Business Health Reporter Subscription";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">Payment Failed</h2>
      <p>We regret to inform you that your recent payment for subscription ${subscriptionId} has failed.</p>
      <p>Your subscription is now in a grace period and will be canceled in 3 days if the payment is not updated.</p>
      <p>Please log in to your account and update your payment method to avoid service interruption.</p>
      <p>Thank you,<br/>The Business Health Reporter Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};

export const sendSubscriptionCancelledEmail = async (to: string, subscriptionId: string) => {
  const subject = "Your Business Health Reporter Subscription Has Been Cancelled";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Subscription Cancelled</h2>
      <p>Your subscription ${subscriptionId} has been successfully cancelled.</p>
      <p>Your access will continue until the end of the current billing period.</p>
      <p>We're sorry to see you go. If you change your mind, you can resubscribe at any time.</p>
      <p>Thank you for using Business Health Reporter.<br/>The Business Health Reporter Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};