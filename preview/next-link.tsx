// Preview-only stand-in for next/link: turns site paths into #hash routes.
import type { AnchorHTMLAttributes, ReactNode } from "react";

export function pathToHash(path: string): string {
  const clean = path.replace(/^\/|\/$/g, "");
  if (clean === "") return "#home";
  if (clean === "hi") return "#hi";
  return "#" + clean.replace(/\//g, "-");
}

export default function Link({ href, children, hrefLang: _h, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a href={href.startsWith("/") ? pathToHash(href) : href} {...rest}>
      {children}
    </a>
  );
}
