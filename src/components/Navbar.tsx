"use client"
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { BookOpenIcon, CreditCardIcon, GraduationCap, LogOutIcon, User, ZapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {

    const { user } = useUser()

    return (
        <nav className=" h-16 w-full z-50 sticky top-0 bg-[#ffffff]">
            <div className=" flex justify-between items-center container px-2 gap-x-2 mx-auto h-full ">
                <Link href={'/'} className=" text-xl md:text-2xl font-extrabold text-primary flex items-center gap-1 sm:gap-2">
                    MasterClass <GraduationCap />
                </Link>
                <div className=" flex items-center space-x-1 sm:space-x-5">
                    <Link href={'/courses'} className=" flex items-center gap-2 py-2 rounded-md hover:text-primary">
                        <Button className=" w-4 sm:w-auto" variant={'ghost'}>
                            <BookOpenIcon className=" size-4" />
                            <span className=" hidden sm:inline">Courses</span>
                        </Button>
                    </Link>
                    <Link href={'/pro'} className=" flex items-center gap-2 py-2 rounded-md hover:text-primary">
                        <Button className=" w-4 sm:w-auto" variant={'ghost'}>
                            <ZapIcon className=" size-4" />
                            <span className=" hidden sm:inline">Pro</span>
                        </Button>
                    </Link>

                    {/* <UserButton /> */}

                    {
                        user &&
                        <SignedIn>
                            <Link href={'/billing'}>
                                <Button variant={'outline'} className="flex w-4 sm:w-auto items-center gap-2 py-2 rounded-md hover:text-primary">
                                    <CreditCardIcon className="size-4" />
                                    <span className="hidden sm:inline">Billing</span>
                                </Button>
                            </Link>
                            <UserButton />
                            <SignOutButton>
                                <Button variant={'outline'} className="flex w-4 sm:w-auto items-center gap-2 py-2 rounded-md hover:text-primary">
                                    <LogOutIcon className="size-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </SignOutButton>
                        </SignedIn>
                    }

                    {!user &&
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant={'outline'} className="flex items-center gap-2 py-2 rounded-md hover:text-primary">
                                    <User className="size-4" />
                                    <span className="hidden sm:inline">Log In</span>
                                </Button>
                            </SignInButton>
                            {/* <SignUpButton mode="modal">
                                <Button variant={'outline'} className="flex items-center gap-2 py-2 rounded-md hover:text-primary">
                                    <User className="size-4" />
                                    <span className="hidden sm:inline">Sign Up</span>
                                </Button>
                            </SignUpButton> */}
                        </SignedOut>
                    }

                </div>
            </div>
        </nav>
    )
}
