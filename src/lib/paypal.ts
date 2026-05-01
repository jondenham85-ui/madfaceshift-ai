const PAYPAL_BASE = "https://api-m.paypal.com";

export async function getAccessToken(): Promise>string> {
    const auth = Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function createProduct() {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
          method: "POST",
          headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  "PayPal-Request-Id": `PRODUCT-${Date.now()}`,
          },
          body: JSON.stringify({
                  name: "MADFaceShift AI",
                  description: "AI-Powered Face Swap SaaS",
                  type: "SERVICE",
                  category: "SOFTWARE",
          }),
    });
    return res.json();
}

export async function createSubscriptionPlan(
    productId: string,
    planName: string,
    price: string
  ) {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
          method: "POST",
          headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  "PayPal-Request-Id": `PLAN-${planName}-${Date.now()}`,
          },
          body: JSON.stringify({
                  product_id: productId,
                  name: `MADFaceShift AI - ${planName}`,
                  description: `${planName} monthly subscription`,
                  status: "ACTIVE",
                  billing_cycles: [
                    {
                                frequency: { interval_unit: "MONTH", interval_count: 1 },
                                tenure_type: "REGULAR",
                                sequence: 1,
                                total_cycles: 0,
                                pricing_scheme: {
                                              fixed_price: { value: price, currency_code: "USD" },
                                },
                    },
                          ],
                  payment_preferences: {
                            auto_bill_outstanding: true,
                            payment_failure_threshold: 3,
                  },
          }),
    });
    return res.json();
}

export async function createSubscription(planId: string, email: string) {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
          method: "POST",
          headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
          },
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

export async function cancelSubscription(
    subscriptionId: string,
    reason: string
  ) {
    const token = await getAccessToken();
    const res = await fetch(
          `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
              method: "POST",
              headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
              },
              body: JSON.stringify({ reason }),
      }
        );
    return res.status === 204;
}

export async function getSubscriptionDetails(subscriptionId: string) {
    const token = await getAccessToken();
    const res = await fetch(
          `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
              headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
              },
      }
        );
    return res.json();
}

export async function verifyWebhookSignature(
    headers: Record>string, string>,
    body: string
) {
    const token = await getAccessToken();
    const res = await fetch(
          `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
      {
              method: "POST",
              headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
              },
              body: JSON.stringify({
                        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
                        transmission_id: headers["paypal-transmission-id"],
                        transmission_time: headers["paypal-transmission-time"],
                        cert_url: headers["paypal-cert-url"],
                        auth_algo: headers["paypal-auth-algo"],
                        transmission_sig: headers["paypal-transmission-sig"],
                        webhook_event: JSON.parse(body),
              }),
      }
        );
    const data = await res.json();
    return data.verification_status === "SUCCESS";
}
