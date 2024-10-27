"use client"

import PlanCard, { Plan } from "@/components/PlanCard"
import PlanSkeleton from "@/components/PlanSkeleton"
import { PRO_PLANS } from "@/constants"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export default function Page() {

    const { user, isLoaded } = useUser()
    const userData = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip")
    const userSubscription = useQuery(api.subscriptions.getSubscription, userData ? { userId: userData._id } : "skip")

    const isYearlySubscriptionActive = userSubscription?.status === "active" && userSubscription.planType === "year"
    const isMonthSubscriptionActive = userSubscription?.status === "active" && userSubscription.planType === "month"


    return (
        <div className=" container mx-auto px-[2vw] py-12 max-w-6xl">
            <h1 className=" text-2xl md:text-4xl font-bold text-center mb-4 text-gray-800">Choose Your Pro Journey</h1>
            <p className="  md:text-lg text-center mb-10 text-gray-600">Unlock Premium features and accelerate your learning</p>

            {isLoaded && userSubscription?.status === "active" && (
                <div className=" bg-purple-50 border-l-4 border-purple-500 p-4 mb-8 rounded-lg">
                    <p className=" text-purple-700">You Have an active <span className=" font-bold capitalize">{userSubscription.planType}</span> {" "} subscription</p>
                </div>
            )}

            {/* PLANS */}
            <div className=" grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {
                    userSubscription === undefined &&
                    <>
                        <PlanSkeleton />
                        <PlanSkeleton />
                        <PlanSkeleton />
                    </>
                }
                {
                    userSubscription !== undefined && PRO_PLANS.map((plan) => (
                        <PlanCard key={plan.id} userSubscription={userSubscription} isMonthSubscriptionActive={isMonthSubscriptionActive} isYearlySubscriptionActive={isYearlySubscriptionActive} plan={plan as Plan} />
                    ))
                }
            </div>
        </div>
    )
}
