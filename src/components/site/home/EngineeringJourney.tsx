"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/site";
import { loadGsap, prefersReduced } from "./cine/gsap";

export interface JourneyScene {
  label: string;
  title: string;
  description: string;
  image: string;
  srcSet?: string;
  sizes?: string;
  imageFit?: "contain" | "cover";
  imagePosition?: string;
  alt: string;
  credit?: { label: string; href: string };
  facts: [string, string][];
}

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);

export function EngineeringJourney({
  lang,
  scenes,
  href,
}: {
  lang: Lang;
  scenes: JourneyScene[];
  href: string;
}) {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !section.current) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const triggers = steps.current.map((step, index) =>
            step
              ? ScrollTrigger.create({
                  trigger: step,
                  start: "top center",
                  end: "bottom center",
                  onEnter: () => setActive(index),
                  onEnterBack: () => setActive(index),
                })
              : null,
          );
          return () => triggers.forEach((trigger) => trigger?.kill());
        },
        section.current,
      );
      cleanup = () => media.revert();
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [scenes.length]);

  const scene = scenes[active];

  return (
    <section ref={section} className="premium-story premium-workflow-section">
      <div className="premium-story-inner">
        <div className="premium-section-head premium-story-heading">
          <div>
            <span className="premium-kicker">
              02 / {L(lang, "FROM PLAN TO REPORT", "प्लान से रिपोर्ट तक")}
            </span>
            <h2>{L(lang, "One clear line from drawing to quantities.", "ड्रॉइंग से मात्रा तक, एक स्पष्ट वर्कफ़्लो।")}</h2>
          </div>
          <Link className="premium-text-link" href={href}>
            {L(lang, "Explore plan to estimate", "प्लान से एस्टिमेट देखें")} ↗
          </Link>
        </div>

        <div className="premium-journey-layout">
          <figure className="premium-journey-display" aria-label={scene.title}>
            <div className="premium-journey-toolbar">
              <span>{scene.label}</span>
              <i>{String(active + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</i>
            </div>
            <div className="premium-journey-screen">
              <img
                key={scene.image}
                src={scene.image}
                srcSet={scene.srcSet}
                sizes={scene.sizes}
                alt={scene.alt}
                loading={active === 0 ? "eager" : "lazy"}
                data-fit={scene.imageFit}
                style={scene.imagePosition ? { objectPosition: scene.imagePosition } : undefined}
                className={`is-active${scene.imageFit === "cover" ? " premium-journey-photo" : ""}`}
              />
              {scene.credit && (
                <a
                  className="premium-journey-credit"
                  href={scene.credit.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {scene.credit.label}
                </a>
              )}
            </div>
            <figcaption className="premium-journey-caption">
              <div>
                <span>{scene.label}</span>
                <b>{scene.title}</b>
              </div>
              <dl>
                {scene.facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </figcaption>
          </figure>

          <ol className="premium-journey-steps">
            {scenes.map((item, index) => (
              <li
                key={item.label}
                ref={(node) => {
                  steps.current[index] = node;
                }}
                aria-current={active === index ? "step" : undefined}
                className={active === index ? "is-active" : ""}
              >
                <span className="premium-journey-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="premium-journey-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="premium-journey-mobile-preview">
                    <img
                      src={item.image}
                      srcSet={item.srcSet}
                      sizes={item.sizes}
                      alt={item.alt}
                      loading="lazy"
                      style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                      className={item.imageFit === "cover" ? "premium-journey-photo" : ""}
                    />
                    {item.credit && (
                      <a
                        className="premium-journey-mobile-credit"
                        href={item.credit.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.credit.label}
                      </a>
                    )}
                    <dl>
                      {item.facts.map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
