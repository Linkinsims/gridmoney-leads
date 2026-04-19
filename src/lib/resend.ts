import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@gridmoneyleads.co.za";

export async function sendNewLeadNotification({
  businessEmail,
  businessName,
  campaignTitle,
  leadId,
}: {
  businessEmail: string;
  businessName: string;
  campaignTitle: string;
  leadId: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: businessEmail,
    subject: `New lead submitted for "${campaignTitle}"`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #F5A623; font-size: 24px; font-weight: 700;">GridMoney Leads</span>
        </div>
        <h1 style="color: #fff; font-size: 22px; margin-bottom: 16px;">New Lead Submitted! 🎯</h1>
        <p style="color: #A0A0A0;">Hi ${businessName},</p>
        <p style="color: #A0A0A0;">A new lead has been submitted for your campaign <strong style="color: #fff;">"${campaignTitle}"</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/business/leads" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Review Lead Now →
        </a>
        <p style="color: #606060; font-size: 12px; margin-top: 32px;">You have 48 hours to review this lead before it expires automatically.</p>
      </div>
    `,
  });
}

export async function sendLeadAcceptedNotification({
  hustlerEmail,
  hustlerName,
  campaignTitle,
  payoutAmount,
}: {
  hustlerEmail: string;
  hustlerName: string;
  campaignTitle: string;
  payoutAmount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: hustlerEmail,
    subject: `💰 Lead accepted — R${payoutAmount.toFixed(2)} earned!`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #F5A623; font-size: 24px; font-weight: 700;">GridMoney Leads</span>
        </div>
        <h1 style="color: #22C55E; font-size: 22px; margin-bottom: 16px;">Lead Accepted! 🎉</h1>
        <p style="color: #A0A0A0;">Hi ${hustlerName},</p>
        <p style="color: #A0A0A0;">Your lead for <strong style="color: #fff;">"${campaignTitle}"</strong> has been accepted!</p>
        <div style="background: #141414; border: 1px solid #242424; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: #A0A0A0; margin: 0; font-size: 14px;">Amount Earned</p>
          <p style="color: #F5A623; font-size: 36px; font-weight: 700; margin: 8px 0;">R${payoutAmount.toFixed(2)}</p>
          <p style="color: #A0A0A0; margin: 0; font-size: 12px;">Added to your pending earnings</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hustler/earnings" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Earnings →
        </a>
      </div>
    `,
  });
}

export async function sendLeadRejectedNotification({
  hustlerEmail,
  hustlerName,
  campaignTitle,
  rejectionReason,
}: {
  hustlerEmail: string;
  hustlerName: string;
  campaignTitle: string;
  rejectionReason: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: hustlerEmail,
    subject: `Lead rejected for "${campaignTitle}"`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #F5A623; font-size: 24px; font-weight: 700;">GridMoney Leads</span>
        </div>
        <h1 style="color: #EF4444; font-size: 22px; margin-bottom: 16px;">Lead Not Accepted</h1>
        <p style="color: #A0A0A0;">Hi ${hustlerName},</p>
        <p style="color: #A0A0A0;">Your lead for <strong style="color: #fff;">"${campaignTitle}"</strong> was not accepted.</p>
        <div style="background: #EF444410; border: 1px solid #EF4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #A0A0A0; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reason</p>
          <p style="color: #fff; margin: 0;">${rejectionReason}</p>
        </div>
        <p style="color: #A0A0A0;">Don't give up! Use this feedback to improve your next submissions.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hustler/campaigns" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
          Browse More Campaigns →
        </a>
      </div>
    `,
  });
}

export async function sendWithdrawalProcessedNotification({
  hustlerEmail,
  hustlerName,
  amount,
}: {
  hustlerEmail: string;
  hustlerName: string;
  amount: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: hustlerEmail,
    subject: `✅ Withdrawal of R${amount.toFixed(2)} processed`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #F5A623; font-size: 24px; font-weight: 700;">GridMoney Leads</span>
        </div>
        <h1 style="color: #22C55E; font-size: 22px; margin-bottom: 16px;">Withdrawal Processed! 💸</h1>
        <p style="color: #A0A0A0;">Hi ${hustlerName},</p>
        <p style="color: #A0A0A0;">Your withdrawal of <strong style="color: #F5A623;">R${amount.toFixed(2)}</strong> has been processed and should reflect in your bank account within 3-5 business days.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hustler/earnings" 
           style="display: inline-block; background: #F5A623; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          View Earnings →
        </a>
      </div>
    `,
  });
}
