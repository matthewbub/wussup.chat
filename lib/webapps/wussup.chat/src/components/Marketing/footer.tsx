import {
  PlusGrid,
  PlusGridItem,
  PlusGridRow,
} from "@/components/Marketing/plus-grid";
import { Button } from "./button";
import { Container } from "./container";
import { Gradient } from "./gradient";
import { Link } from "./link";
import { Subheading } from "./text";

function CallToAction() {
  return (
    <div className="relative pt-20 pb-16 text-center sm:py-24">
      <hgroup>
        <Subheading>Try it now</Subheading>
        <p className="mt-6 text-3xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Choose your perfect AI
          <br />
          All popular models in one place
        </p>
      </hgroup>
      <p className="mx-auto mt-6 max-w-xs text-sm/6 text-gray-500">
        Access your favorite AI models from leading providers - GPT-4, Claude,
        and more, all in one convenient interface.
      </p>
      <div className="mt-6">
        <Button className="w-full sm:w-auto" href="/chat">
          Chat with AI
        </Button>
      </div>
    </div>
  );
}

function SitemapHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm/6 font-medium text-gray-950/50">{children}</h3>;
}

function SitemapLinks({ children }: { children: React.ReactNode }) {
  return <ul className="mt-6 space-y-4 text-sm/6">{children}</ul>;
}

function SitemapLink(props: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <li>
      <Link
        {...props}
        className="font-medium text-gray-950 data-hover:text-gray-950/75"
      />
    </li>
  );
}

function Sitemap() {
  return (
    <>
      {/* <div>
        <SitemapHeading>Product</SitemapHeading>
        <SitemapLinks>
          <SitemapLink href="/pricing">Pricing</SitemapLink>
          <SitemapLink href="#">Analysis</SitemapLink>
          <SitemapLink href="#">API</SitemapLink>
        </SitemapLinks>
      </div>
      <div>
        <SitemapHeading>Company</SitemapHeading>
        <SitemapLinks>
          <SitemapLink href="#">Careers</SitemapLink>
          <SitemapLink href="/blog">Blog</SitemapLink>
          <SitemapLink href="/company">Company</SitemapLink>
        </SitemapLinks>
      </div>
      <div>
        <SitemapHeading>Support</SitemapHeading>
        <SitemapLinks>
          <SitemapLink href="#">Help center</SitemapLink>
          <SitemapLink href="#">Community</SitemapLink>
        </SitemapLinks>
      </div> */}
      <div>
        <SitemapHeading>Company</SitemapHeading>
        <SitemapLinks>
          <SitemapLink href="/legal/terms">Terms of service</SitemapLink>
          <SitemapLink href="/legal/privacy">Privacy policy</SitemapLink>
          <SitemapLink href="/legal/disclaimer">Disclaimer</SitemapLink>
        </SitemapLinks>
      </div>
    </>
  );
}

function SocialLinks() {
  return (
    <>
      <Link
        href="https://bsky.app/profile/matthewbub.com"
        target="_blank"
        aria-label="Visit on BlueSky"
        className="text-gray-950 data-hover:text-gray-950/75"
      >
        <svg
          viewBox="0 0 568 501"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 fill-slate-900 dark:fill-slate-100"
        >
          <path d="M123.121 33.6637C188.241 82.5526 258.281 181.681 284 234.873C309.719 181.681 379.759 82.5526 444.879 33.6637C491.866 -1.61183 568 -28.9064 568 57.9464C568 75.2916 558.055 203.659 552.222 224.501C531.947 296.954 458.067 315.434 392.347 304.249C507.222 323.8 536.444 388.56 473.333 453.32C353.473 576.312 301.061 422.461 287.631 383.039C285.169 375.812 284.017 372.431 284 375.306C283.983 372.431 282.831 375.812 280.369 383.039C266.939 422.461 214.527 576.312 94.6667 453.32C31.5556 388.56 60.7778 323.8 175.653 304.249C109.933 315.434 36.0535 296.954 15.7778 224.501C9.94525 203.659 0 75.2916 0 57.9464C0 -28.9064 76.1345 -1.61183 123.121 33.6637Z" />
        </svg>
      </Link>
    </>
  );
}

function Copyright() {
  return (
    <div className="text-sm/6 text-gray-950">
      &copy; {new Date().getFullYear()} NineMbs Studio LLC
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20">
      <Gradient className="relative">
        <div className="absolute inset-2 rounded-[45px] bg-white/80" />
        <Container>
          <CallToAction />
          <PlusGrid className="pb-16">
            <PlusGridRow>
              <div className="grid grid-cols-2 gap-y-10 pb-6 lg:grid-cols-6 lg:gap-8">
                <div className="col-span-2 flex">
                  <PlusGridItem className="pt-6 lg:pb-6">
                    {/* <Logo className="h-9" /> */}
                    <h2 className="text-2xl font-bold">The (ninembs) Studio</h2>
                  </PlusGridItem>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-12 lg:col-span-4 lg:grid-cols-subgrid lg:pt-6">
                  <Sitemap />
                </div>
              </div>
            </PlusGridRow>
            <PlusGridRow className="flex justify-between">
              <div>
                <PlusGridItem className="py-3">
                  <Copyright />
                </PlusGridItem>
              </div>
              <div className="flex">
                <PlusGridItem className="flex items-center gap-8 py-3">
                  <SocialLinks />
                </PlusGridItem>
              </div>
            </PlusGridRow>
          </PlusGrid>
        </Container>
      </Gradient>
    </footer>
  );
}
