import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/Chrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader lang="en" altPath="/hi/" />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-[34px] font-extrabold">
          Page not found
        </h1>
        <p className="mt-2 text-body">
          यह पेज नहीं मिला। Try the calculators instead.
        </p>
        <Link
          href="/calculators/"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-ink px-6 font-bold text-white"
        >
          All calculators
        </Link>
      </main>
      <SiteFooter lang="en" />
    </>
  );
}
