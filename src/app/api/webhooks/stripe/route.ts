import ProPlanActivateEmail from '@/emails/ProPlanActivateEmail';
import PurchaseConfirmationEmail from '@/emails/PurchaseConfirmationEmail';
import resend from '@/lib/resend';
import stripe from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        console.log(`Webhook signature verification failed. ${(error as Error).message} - signature=${signature}`)
        return new Response("Webhook signature verification failed" + 'signarture' + signature, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionUpsert(event.data.object as Stripe.Subscription, event.type)
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break;
        }
    } catch (error) {
        console.log(`Error processing webhook event: ${(error as Error).message}`)
        return new Response("Webhook failed", { status: 400 })
    }

    return new Response("Webhook processed", { status: 200 })

}




// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------



const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    try {

        await convex.mutation(api.subscriptions.removeSubscription, {
            stripeSubscriptionId: subscription.id
        })

    } catch (error) {
        console.log(`Error deleting subscription ${subscription.id}: ${(error as Error).message}`)
    }
}

const handleSubscriptionUpsert = async (subscription: Stripe.Subscription, eventType: string) => {

    console.log('subscription', subscription)
    if (subscription.status !== "active" || !subscription.latest_invoice) {
        console.log(`Skipping subscription ${subscription.id} - Status : ${subscription.status}`)
        return;
    }

    const stripeCustomerId = subscription.customer as string
    const user = await convex.query(api.users.getUserByStripeCustomerId, { stripeCustomerId })
    if (!user) {
        throw new Error("User not found")
    }

    try {
        await convex.mutation(api.subscriptions.upsertSubscription, {
            userId: user._id,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            planType: subscription.items.data[0].plan.interval as "month" | "year" | "day",
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
        })

        console.log(`Successfully upsert a ${eventType} plan for subscription ${subscription.id}`)
        const isCreation = eventType === "customer.subscription.created"

        if (isCreation && process.env.NODE_ENV === "development") {
            // TODO: SEND A WELCOME EMAIL
            await resend.emails.send({
                from: "Master Class <onboarding@resend.dev>",
                to: user.email,
                subject: "Welcome to MasterClass Pro!",
                react: ProPlanActivateEmail({
                    url: process.env.NEXT_PUBLIC_APP_URL!,
                    currentPeriodEnd: subscription.current_period_end,
                    currentPeriodStart: subscription.current_period_start,
                    name: user.name,
                    planType: subscription.items.data[0].plan.interval
                })
            })
        }

    } catch (error) {
        console.log(`Error processing subscription event: ${(error as Error).message}`)
        throw (error as Error).message
    }

}

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    const courseId = session.metadata?.courseId;
    const stripeCustomerId = session.customer as string;

    console.log({ metadata: session.metadata })

    if (!courseId || !stripeCustomerId) {
        return new Error("Missing  Course ID and Customer ID");
    }

    const user = await convex.query(api.users.getUserByStripeCustomerId, { stripeCustomerId })

    if (!user) {
        throw new Error("User not found")
    }

    await convex.mutation(api.purchases.recordPurchase, {
        userId: user._id,
        courseId: courseId as Id<"courses">,
        amount: session.amount_total as number,
        stripePurchaseId: session.id
    })

    if (process.env.NODE_ENV === "development" && session.metadata?.courseTitle && session.metadata?.courseImage) {
        // TODO: SEND A WELCOME EMAIL
        await resend.emails.send({
            from: "Master Class <onboarding@resend.dev>",
            to: user.email,
            subject: "Purchased Confirm",
            react: PurchaseConfirmationEmail({
                customerName: user.name,
                courseTitle: session.metadata?.courseTitle,
                courseImage: session.metadata?.courseImage,
                purchaseAmount: session.amount_total! / 100,
                courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`
            })
        })
    }

}

