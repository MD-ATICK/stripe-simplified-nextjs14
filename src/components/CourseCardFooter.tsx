
"use client"

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { Id } from "../../convex/_generated/dataModel"
import PurchaseButton from "./PurchaseButton"
import { Button } from "./ui/button"


export default function CourseCardFooter({courseId}: {courseId: Id<"courses">}) {

    const {user} = useUser()


  return (
    <div>
        {
            user &&
            <SignedIn>
                <PurchaseButton courseId={courseId} />
            </SignedIn>
        }
        {
            !user &&
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant={'outline'}>Login</Button>
                </SignInButton>
            </SignedOut>
        }
    </div>
  )
}
