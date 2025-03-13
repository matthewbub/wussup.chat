"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/_store/auth";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { SignUpButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function HeaderHero() {
  return (
    <div className="">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Wussup Chat</span>
              <Image alt="" src="/wussup.png" className="h-8 w-auto" width={32} height={32} />
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {/* {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white">
                {item.name}
              </a>
            ))} */}
          </div>
          <div className="flex flex-1 justify-end gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="default">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" asChild>
                <Link href="/~">Chat</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
      </header>

      <div className="relative isolate pt-14">
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
                Your Unified AI Assistant
              </h1>
              <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
                Experience the power of AI chatbots in one place. Chat naturally, get instant answers, and seamlessly
                switch between different AI models to find the perfect assistant for your needs.
              </p>
            </div>
            <Image
              alt="App screenshot"
              src="/ABWussupDemo.gif"
              width={2432}
              height={1442}
              className="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
