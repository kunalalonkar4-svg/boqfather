// Single-page preview of the BOQFather site for sharing as one link.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalculatorPage } from "@/components/site/CalculatorPage";
import { CalculatorsIndex, HomePage } from "@/components/site/HomePage";
import { CALCULATORS, CalcSlug } from "@/content/calculators";
import type { Lang } from "@/lib/site";

type Route = { lang: Lang; page: "home" | "calculators" | CalcSlug };

function parse(hash: string): Route {
  let h = hash.replace(/^#/, "");
  let lang: Lang = "en";
  if (h === "hi") return { lang: "hi", page: "home" };
  if (h.startsWith("hi-")) {
    lang = "hi";
    h = h.slice(3);
  }
  if (h === "calculators") return { lang, page: "calculators" };
  const c = CALCULATORS.find((x) => x.slug === h);
  return c ? { lang, page: c.slug } : { lang, page: "home" };
}

function App() {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parse(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => {
    document.documentElement.lang = route.lang;
  }, [route.lang]);
  const key = `${route.lang}-${route.page}`;
  if (route.page === "home") return <HomePage key={key} lang={route.lang} />;
  if (route.page === "calculators") return <CalculatorsIndex key={key} lang={route.lang} />;
  return <CalculatorPage key={key} lang={route.lang} slug={route.page} />;
}

createRoot(document.getElementById("root")!).render(<App />);
