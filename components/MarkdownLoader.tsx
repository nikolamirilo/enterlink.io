import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownLoaderProps = {
  children: string;
  className?: string;
};

export const MarkdownLoader: React.FC<MarkdownLoaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
};
