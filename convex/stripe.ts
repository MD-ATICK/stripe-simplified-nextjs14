import { ConvexError, v } from "convex/values";
import rateLimit from "../src/lib/ratelimit";
import stripe from "../src/lib/stripe";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const createCheckoutSession = action({
    args: { courseId: v.id('courses') },
    handler: async (ctx, args): Promise<{ checkoutUrl: string | null }> => {
        const identify = await ctx.auth.getUserIdentity()

        if (!identify) {
            throw new ConvexError("Unauthorized")
        }

        const user = await ctx.runQuery(api.users.getUserByClerkId, {
            clerkId: identify.subject
        })

        if (!user) {
            throw new ConvexError("User not found")
        }

        // todo : implement rate limiting
        const rateLimitKey = `checkout-rate-limit:${user._id}`
        const { success } = await rateLimit.limit(rateLimitKey)

        if (!success) {
            throw new ConvexError(`Rate limit exceeded`)
        }

        const course = await ctx.runQuery(api.courses.getCourseById, {
            courseId: args.courseId
        })

        if (!course) {
            throw new ConvexError("Course not found")
        }

        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: course.title,
                            images: [course.imageUrl]
                        },
                        unit_amount: Math.round(course.price * 100)
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${args.courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${args.courseId}`,
            metadata: {
                courseId: course._id,
                userId: user._id,
                courseTitle: course.title,
                courseImage: course.imageUrl
            }
        })

        console.log("metadata", session.metadata)

        return { checkoutUrl: session.url }
    },
})


export const createProPlanCheckoutSession = action({
    args: { planId: v.union(v.literal("month"), v.literal("year"), v.literal("day")) },
    handler: async (ctx, args): Promise<{ checkoutUrl: string | null }> => {
        const identify = await ctx.auth.getUserIdentity()

        if (!identify) {
            throw new ConvexError("Unauthorized")
        }

        const user = await ctx.runQuery(api.users.getUserByClerkId, { clerkId: identify.subject })
        if (!user) {
            throw new ConvexError("User not found")
        }

        //  **** Rate limit ****
        const rateLimitKey = `pro-plan-rate-limit:${user._id}`
        const { success } = await rateLimit.limit(rateLimitKey)
        if (!success) {
            throw new ConvexError(`Rate limit exceeded`)
        }

        //  ***** month or year ****

        let priceId;

        if (args.planId === "day") {
            priceId = process.env.STRIPE_DAILY_PRICE_ID
        } else if (args.planId === "month") {
            priceId = process.env.STRIPE_MONTHLY_PRICE_ID
        } else {
            priceId = process.env.STRIPE_YEARLY_PRICE_ID
        }

        if (!priceId) {
            throw new ConvexError("PriceId not provided")
        }

        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            line_items: [{ price: priceId, quantity: 1, }],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}&planType=${args.planId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro`,
            metadata: {
                userId: user._id,
                planId: args.planId
            }
        })

        return { checkoutUrl: session.url }

    }
})