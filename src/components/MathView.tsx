"use client";

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathViewProps {
  content: string;
  className?: string;
}

/**
 * Parses and renders text with inline ($...$) and block ($$...$$) LaTeX formulas.
 */
export const MathView: React.FC<MathViewProps> = ({ content, className = "" }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // 1. Replace block formulas $$ ... $$
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return `$$${math}$$`;
      }
    });

    // 2. Replace inline formulas $ ... $
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `$${math}$`;
      }
    });

    // 3. Convert remaining newlines to <br/>
    text = text.replace(/\n/g, "<br/>");

    return text;
  }, [content]);

  return (
    <div
      className={`prose max-w-none text-slate-800 dark:text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
