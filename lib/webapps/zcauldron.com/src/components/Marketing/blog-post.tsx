import { Button } from "@/components/Marketing/button";
import { Container } from "@/components/Marketing/container";
import { Footer } from "@/components/Marketing/footer";
import { GradientBackground } from "@/components/Marketing/gradient";
import { Navbar } from "@/components/Marketing/navbar";
import { Heading, Subheading } from "@/components/Marketing/text";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import MarkdownComponent from "@/components/ui/Markdown";

export default async function BlogPost({
  post,
}: {
  post: {
    title: string;
    publishedAt: string;
    body: string;
  };
}) {
  return (
    <main className="overflow-hidden">
      <GradientBackground />
      <Container>
        <Navbar />
        <Subheading className="mt-16 text-center">
          {dayjs(post.publishedAt).format("dddd, MMMM D, YYYY")}
        </Subheading>
        <Heading as="h1" className="mt-2 text-center">
          {post.title}
        </Heading>
        <div className="mt-16 grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
          <div></div>
          <div className="text-gray-700">
            <div className="max-w-2xl xl:mx-auto">
              <MarkdownComponent className="prose">
                {post.body}
              </MarkdownComponent>
              <div className="mt-10">
                <Button variant="outline" href="/blog">
                  <ChevronLeftIcon className="size-4" />
                  Back to blog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </main>
  );
}
