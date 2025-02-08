import { FC } from "react";
import MarkdownComponent from "@/components/ui/Markdown";

interface BlogPostProps {
  post: {
    title: string;
    body: string;
    publishedAt: string;
  };
}

const BlogPost: FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="container max-w-4xl py-12 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <time
          dateTime={post.publishedAt}
          className="text-sm text-muted-foreground"
        >
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>

      <div className="prose dark:prose-invert prose-slate max-w-none">
        <MarkdownComponent>{post.body}</MarkdownComponent>
      </div>
    </article>
  );
};

export default BlogPost;
