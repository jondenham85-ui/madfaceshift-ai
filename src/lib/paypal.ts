const PAYPAL_BASE = "https://api-m.paypal.com";

export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function createSubscription(planId: string, email: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: { email_address: email },
      application_context: {
        brand_name: "MADFaceShift AI",
        return_url: `${process.env.NEXTAUTH_URL}/dashboard?subscribed=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
      },
    }),
  });
  return res.json();
}

export async function verifyWebhookSignature(headers: Record<string, string>, body: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      transmission_id: headers["paypal-transmission-id"],
      transmission_time: headers["paypal-transmission-time"],
      cert_url: headers["paypal-cert-url"],
      auth_algo: headers["paypal-auth-algo"],
      transmission_sig: headers["paypal-transmission-sig"],
      webhook_event: JSON.parse(body),
    }),
  });
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
