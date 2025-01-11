import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy } from "lucide-react";

export default function MarkdownComponent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Handle code blocks and inline code
        code({
          inline,
          className,
          children,
          ...props
        }: {
          inline?: boolean;
          className?: string;
          children?: React.ReactNode;
        }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";

          return !inline ? (
            <div className="group relative">
              <button
                onClick={() => navigator.clipboard.writeText(String(children))}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 hover:text-primary"
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <SyntaxHighlighter
                style={oneDark}
                language={language || "text"}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="px-1 py-0.5 rounded bg-base-300" {...props}>
              {children}
            </code>
          );
        },
        // Style other markdown elements
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        ul({ children }) {
          return <ul className="list-disc ml-6 mb-4">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal ml-6 mb-4">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-base-300 pl-4 italic">
              {children}
            </blockquote>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
