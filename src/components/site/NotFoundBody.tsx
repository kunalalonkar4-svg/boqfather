"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The 404 message in the language of the address that was not found (Hindi under /hi/, English elsewhere). */
export function NotFoundBody() {
  const hi = /^\/hi(\/|$)/.test(usePathname() ?? "");
  const base = hi ? "/hi" : "";
  const link = "inline-flex h-12 items-center rounded-[4px] px-6 font-bold transition";
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-[34px] font-extrabold">{hi ? "यह पेज नहीं मिला" : "Page not found"}</h1>
      <p className="mt-2 text-body">
        {hi
          ? "यह पता अब मौजूद नहीं है या ग़लत लिखा गया है। नीचे से आगे बढ़ें।"
          : "This address does not exist any more, or it was typed wrongly. Pick where to go next."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={`${base}/`} className={`${link} bg-ink text-white hover:bg-[#333]`}>
          {hi ? "होम पेज" : "Home page"}
        </Link>
        <Link href={`${base}/calculators/`} className={`${link} border border-line bg-white text-ink hover:border-ink`}>
          {hi ? "सभी कैलकुलेटर" : "All calculators"}
        </Link>
        <Link href={`${base}/house-construction-guide/`} className={`${link} border border-line bg-white text-ink hover:border-ink`}>
          {hi ? "घर बनाने की गाइड" : "House building guide"}
        </Link>
      </div>
    </main>
  );
}
