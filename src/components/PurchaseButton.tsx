"use client"

import Loading from "@/app/loading"
import { SignInButton, useUser } from "@clerk/nextjs"
import { useAction, useQuery } from "convex/react"
import { MoveRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { Button } from "./ui/button"

interface props {
    courseId: Id<"courses">
}
export default function PurchaseButton({ courseId }: props) {


    const [isPending, setIsPending] = useState(false);

    const { user } = useUser()
    const userData = useQuery(api.users.getUserByClerkId, user ? { clerkId: user?.id } : "skip")
    const userAccess = useQuery(api.users.getUserAccess, userData ? {
        userId: userData._id,
        courseId: courseId
    } : 'skip') || { hasAccess: false }

    const createCheckoutSession = useAction(api.stripe.createCheckoutSession)

    const handlePurchase = async () => {

        if (!user) return toast('Unauthorized')

        setIsPending(true)
        try {
            const { checkoutUrl } = await createCheckoutSession({ courseId })
            if (checkoutUrl) {
                window.location.href = checkoutUrl
            } else {
                throw new Error(`Cannot create checkout session`)
            }
        } catch (err) {
            if ((err as Error).message.includes('Rate limit exceeded')) {
                toast.error("Too many requests. please try again later")
            } else {
                toast.error("something went wrong")
            }
        } finally {
            setIsPending(false)
        }
    }


    if (!userAccess || !userData) {
        return <Button variant={'outline'} > <Loading /> </Button>
    }

    if (userAccess && !userAccess.hasAccess) {
        return <SignInButton mode="modal">
            <Button variant={'outline'} disabled={isPending} onClick={handlePurchase}>{isPending ? <Loading /> : 'Enroll Now'}</Button>
        </SignInButton>
    }

    if (userAccess && userAccess.hasAccess) {
        return <Link href={`/courses/${courseId}`}>
            <Button disabled={isPending} className=" bg-green-600" variant={'default'}>Accessed <MoveRight /> </Button>
        </Link>
    }

    if (isPending) {
        return <Loading />
    }

    return;

}
