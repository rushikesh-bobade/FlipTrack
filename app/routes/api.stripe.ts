import type { Route } from "./+types/api.stripe";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });

export async function action({ request }: Route.ActionArgs) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Simplistic handling: find user by stripeCustomerId and update plan based on price ID
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
    
    if (user) {
      let plan = "FREE";
      const priceId = subscription.items.data[0].price.id;
      if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "PRO";
      if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) plan = "BUSINESS";

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: plan as any, stripeSubId: subscription.id },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
