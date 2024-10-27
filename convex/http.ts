import { WebhookEvent } from '@clerk/nextjs/server';
import { httpRouter } from "convex/server";
import { Webhook } from 'svix';
import WelcomeEmail from './../src/emails/WelcomeEmail';
import resend from './../src/lib/resend';
import stripe from './../src/lib/stripe';
import { api } from './_generated/api';
import { httpAction } from './_generated/server';

const http = httpRouter()

const clerkWebhook = httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
        throw new Error("Missing clerk webhook secret in convex environment variable")
    }

    const svix_id = request.headers.get("svix-id")
    const svix_signature = request.headers.get('svix-signature')
    const svix_timestamp = request.headers.get('svix-timestamp')

    if (!svix_id || !svix_signature || !svix_timestamp) {
        return new Response("Error occurred - no svix headers found", { status: 400 })
    }

    const payload = await request.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(webhookSecret)
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-signature': svix_signature,
            'svix-timestamp': svix_timestamp
        }) as WebhookEvent
    } catch (error) {
        console.log(error)
        return new Response("Error occurred -", { status: 400 })
    }

    const eventType = evt.type

    if (eventType === 'user.created') {

        const { id, email_addresses, first_name, last_name } = evt.data
        const email = email_addresses[0].email_address
        const name = `${first_name || ""} ${last_name || ""}`.trim()

        try {


            // * stripe customer creating
            const customer = await stripe.customers.create({
                email,
                name,
                metadata: {
                    clerkId: id
                }
            })

            await ctx.runMutation(api.users.createUser, {
                email,
                name,
                clerkId: id,
                stripeCustomerId: customer.id
            })


            if (process.env.NODE_ENV === "development") {
                // TODO: SEND A WELCOME EMAIL
                await resend.emails.send({
                    from: "Master Class <onboarding@resend.dev>",
                    to: email,
                    subject: "Welcome to MasterClass",
                    react: WelcomeEmail({ name, url: process.env.NEXT_PUBLIC_APP_URL! })
                })
            }



        } catch (error) {
            console.log(error)
            return new Response("Error occurred - could not create user", { status: 500 })
        }
    }


    return new Response("User created successfully", { status: 200 })

})

http.route({
    path: '/clerk-webhook',
    method: "POST",
    handler: clerkWebhook
})

export default http;