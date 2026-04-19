import crypto from "crypto";

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID!;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "";
const IS_SANDBOX = process.env.PAYFAST_SANDBOX === "true";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const PAYFAST_URL = IS_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  custom_str1?: string;
  custom_str2?: string;
}

function generateSignature(
  data: Record<string, string>,
  passphrase: string
): string {
  let pfOutput = "";
  for (const key in data) {
    if (data[key] !== "") {
      pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove last & and add passphrase if set
  let getString = pfOutput.slice(0, -1);
  if (passphrase !== "") {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
}

export function buildPayFastTopup({
  userId,
  businessId,
  amount,
  email,
  firstName,
  reference,
}: {
  userId: string;
  businessId: string;
  amount: number;
  email: string;
  firstName: string;
  reference: string;
}): { url: string; data: PayFastPaymentData & { signature: string } } {
  const data: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `${APP_URL}/dashboard/business/wallet?success=1`,
    cancel_url: `${APP_URL}/dashboard/business/wallet?cancelled=1`,
    notify_url: `${APP_URL}/api/webhooks/payfast`,
    name_first: firstName,
    email_address: email,
    m_payment_id: reference,
    amount: amount.toFixed(2),
    item_name: "GridMoney Leads Wallet Top Up",
    custom_str1: userId,
    custom_str2: businessId,
  };

  const signature = generateSignature(data, PAYFAST_PASSPHRASE);
  return {
    url: PAYFAST_URL,
    data: { ...(data as unknown as PayFastPaymentData), signature },
  };
}

export function verifyPayFastSignature(
  data: Record<string, string>,
  receivedSignature: string
): boolean {
  const { signature: _, ...dataWithoutSignature } = data;
  const calculatedSignature = generateSignature(
    dataWithoutSignature,
    PAYFAST_PASSPHRASE
  );
  return calculatedSignature === receivedSignature;
}

export function generatePaymentReference(prefix: string = "GMWALLET"): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}
