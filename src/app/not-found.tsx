import { SiteFooter, SiteHeader } from "@/components/site/Chrome";
import { NotFoundBody } from "@/components/site/NotFoundBody";

export default function NotFound() {
  return (
    <>
      <SiteHeader lang="en" altPath="/hi/" />
      <NotFoundBody />
      <SiteFooter lang="en" />
    </>
  );
}
