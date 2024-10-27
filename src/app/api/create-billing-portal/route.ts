import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";


const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
export async function POST() {

    const { userId: clerkId } = await auth()
    if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await convex.query(api.users.getUserByClerkId, { clerkId })

        if (!user || !user.stripeCustomerId) {
            return NextResponse.json({ error: 'User not found or No stripe customer id' }, { status: 404 })
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.log(`Error processing billing portal : ${(error as Error).message}`)
        return NextResponse.json({ error: (error as Error).message || "Something wrong to billing portal!" })
    }

}