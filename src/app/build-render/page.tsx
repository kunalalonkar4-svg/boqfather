import type { Metadata } from "next";
import { BuildRender } from "./Render";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <BuildRender />;
}
