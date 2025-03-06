"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/_store/auth";
import { useRouter } from "next/navigation";

export function HeaderHero({ setActiveModal }: { setActiveModal: (modal: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

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
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {/* {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white">
                {item.name}
              </a>
            ))} */}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {isLoggedIn ? (
              <Button variant="outline" asChild onClick={() => router.push("/~")}>
                <span>
                  Dashboard <span aria-hidden="true">&rarr;</span>
                </span>
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setActiveModal("auth")}>
                <span>
                  Log in <span aria-hidden="true">&rarr;</span>
                </span>
              </Button>
            )}
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Wussup Chat</span>
                <Image alt="" src="/wussup.png" className="h-8 w-auto" width={32} height={32} />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                {/* <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-gray-800"
                    >
                      {item.name}
                    </a>
                  ))}
                </div> */}
                <div className="py-6">
                  {isLoggedIn ? (
                    <Button variant="outline" asChild onClick={() => router.push("/~")}>
                      Dashboard
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setActiveModal("auth")}>
                      Log in
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
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
              src="/demo.png"
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
