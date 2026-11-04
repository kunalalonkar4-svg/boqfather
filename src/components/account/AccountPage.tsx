"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PLANS } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { langPath, type Lang } from "@/lib/site";
import { alertBox, useAccount } from "./Account";

type ProjectRow = { id: string; name: string; pro: boolean; updated_at: string; kind: string };
type Order = { id: string; status: string; created_at: string; details: Record<string, string> };
const L = (lang: Lang, en: string, hi: string) => lang === "hi" ? hi : en;
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const workspaceLinks = (lang: Lang) => [
  { icon: "⌂", label: L(lang, "Overview", "ओवरव्यू"), href: "account" },
  { icon: "▦", label: L(lang, "My projects", "मेरे प्रोजेक्ट"), href: "account#projects" },
  { icon: "⌁", label: L(lang, "House cost estimator", "घर लागत एस्टिमेट"), href: "house-construction-cost-calculator" },
  { icon: "▤", label: L(lang, "BOQ generator", "BOQ जनरेटर"), href: "house-boq-estimate" },
  { icon: "≡", label: L(lang, "Measurement book", "मेज़रमेंट बुक"), href: "house-boq-estimate#measurement-book" },
  { icon: "⌇", label: L(lang, "Steel BBS", "स्टील BBS"), href: "house-boq-estimate#bbs" },
  { icon: "↥", label: L(lang, "Drawing upload", "ड्रॉइंग अपलोड"), href: "plan-to-estimate" },
  { icon: "⌗", label: L(lang, "2D / 3D planner", "2D / 3D प्लानर"), href: "naksha" },
  { icon: "∑", label: L(lang, "Calculators", "कैलकुलेटर"), href: "calculators" },
  { icon: "⇄", label: L(lang, "Quote checker", "कोटेशन चेकर"), href: "contractor-quote-checker" },
  { icon: "▧", label: L(lang, "Reports & exports", "रिपोर्ट और एक्सपोर्ट"), href: "house-boq-estimate" },
];

export function AccountView({ lang }: { lang: Lang }) {
  const account = useAccount();
  const sb = supabase();
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brand, setBrand] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!sb || !account.user) return;
    sb.from("projects").select("id,name,pro,updated_at,kind").order("updated_at", { ascending: false })
      .then(({ data }) => setRows((data as ProjectRow[]) ?? []));
    sb.from("custom_orders").select("id,status,created_at,details").order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [sb, account.user]);
  useEffect(() => setBrand(account.profile?.brand_name ?? ""), [account.profile]);

  if (!account.enabled) return <p className="text-[15px]">{L(lang, "Accounts open very soon.", "अकाउंट बहुत जल्द शुरू होंगे।")}</p>;
  if (!account.ready) return <div className="bf-dashboard-loading" aria-label={L(lang, "Loading account", "अकाउंट लोड हो रहा है")}> <span /> <span /> <span /></div>;
  if (!account.user) return <div className="bf-login-card"><div className="bf-login-mark">BF</div><span className="premium-kicker">BOQFATHER WORKSPACE</span><h2>{L(lang, "Your projects, in one place.", "आपके प्रोजेक्ट, एक ही जगह।")}</h2><p>{L(lang, "Sign in to see saved projects and manage your Pro plan.", "सेव किए गए प्रोजेक्ट देखने और Pro प्लान मैनेज करने के लिए साइन इन करें।")}</p><button type="button" className="premium-button premium-button-blue" onClick={() => account.openLogin()}>{L(lang, "Sign in to workspace", "वर्कस्पेस में साइन इन करें")} <span>↗</span></button></div>;

  const links = workspaceLinks(lang);
  const activeUntil = account.profile?.pro_until ? new Date(account.profile.pro_until) : null;
  const projects = rows ?? [];
  const activeCount = projects.filter((x) => Date.now() - new Date(x.updated_at).getTime() < 30 * 86400000).length;
  const overviewStats = useMemo(() => [
    { label: L(lang, "Saved projects", "सेव प्रोजेक्ट"), value: rows === null ? "—" : String(rows.length), icon: "▦", note: L(lang, "In your workspace", "आपके वर्कस्पेस में") },
    { label: L(lang, "Recently active", "हाल ही में सक्रिय"), value: rows === null ? "—" : String(activeCount), icon: "↗", note: L(lang, "Updated in 30 days", "30 दिनों में अपडेट") },
    { label: L(lang, "Plan", "प्लान"), value: account.pro ? "Pro" : L(lang, "Free", "फ़्री"), icon: "✦", note: activeUntil && account.pro ? `${L(lang, "Active until", "तक सक्रिय")} ${dateLabel(activeUntil.toISOString())}` : L(lang, "Upgrade when you need more", "जरूरत पर अपग्रेड करें") },
  ], [rows, activeCount, account.pro, activeUntil, lang]);
  const firstName = account.user.user_metadata?.full_name?.split(" ")[0] ?? account.user.email?.split("@")[0] ?? L(lang, "there", "नमस्ते");
  const sectionClass = "bf-dashboard-card";

  return <div className="bf-dashboard">
    <aside className={`bf-sidebar ${menuOpen ? "is-open" : ""}`}>
      <Link href={langPath(lang)} className="bf-sidebar-brand"><span>BF</span><b>BOQFather<small>ENGINEERING WORKSPACE</small></b></Link>
      <div className="bf-sidebar-label">{L(lang, "WORKSPACE", "वर्कस्पेस")}</div>
      <nav aria-label={L(lang, "Workspace navigation", "वर्कस्पेस नेविगेशन")} className="bf-side-nav">
        {links.map((link, index) => <Link key={link.href} href={langPath(lang, link.href.replace(/^account#/, "account#"))} onClick={() => setMenuOpen(false)} className={index === 0 ? "is-active" : ""}><span className="bf-side-icon">{link.icon}</span>{link.label}</Link>)}
      </nav>
      <div className="bf-sidebar-spacer" />
      <Link href={langPath(lang, "pro")} className="bf-sidebar-upgrade"><span>✦</span><b>{L(lang, "Unlock Pro", "Pro अनलॉक करें")}<small>{L(lang, "Branded reports & more", "ब्रांडेड रिपोर्ट और अधिक")}</small></b><span>↗</span></Link>
      <div className="bf-sidebar-user"><span className="bf-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span><b>{firstName}</b><small>{account.user.email}</small></span><button aria-label={L(lang, "Sign out", "साइन आउट")} onClick={() => void account.signOut()}>⋯</button></div>
    </aside>
    <div className="bf-dashboard-main">
      <header className="bf-dashboard-topbar"><button className="bf-mobile-menu" type="button" onClick={() => setMenuOpen((x) => !x)} aria-label={L(lang, "Toggle navigation", "नेविगेशन टॉगल करें")}>☰</button><div className="bf-breadcrumb">{L(lang, "Workspace", "वर्कस्पेस")} <span>/</span> <b>{L(lang, "Overview", "ओवरव्यू")}</b></div><div className="bf-topbar-actions"><span className="bf-status-chip"><i />{account.pro ? "PRO" : L(lang, "FREE PLAN", "फ़्री प्लान")}</span><Link href={langPath(lang, "house-boq-estimate")} className="bf-topbar-cta">＋ {L(lang, "New estimate", "नया एस्टिमेट")}</Link><span className="bf-avatar bf-topbar-avatar">{firstName.slice(0, 1).toUpperCase()}</span></div></header>
      <main className="bf-dashboard-content">
        <section className="bf-dashboard-welcome"><div><span className="premium-kicker">{L(lang, "YOUR ENGINEERING WORKSPACE", "आपका इंजीनियरिंग वर्कस्पेस")}</span><h1>{L(lang, `Good to see you, ${firstName}.`, `नमस्ते, ${firstName}।`)}</h1><p>{L(lang, "A clear overview of your projects, estimates and engineering tools.", "आपके प्रोजेक्ट, एस्टिमेट और इंजीनियरिंग टूल का स्पष्ट ओवरव्यू।")}</p></div><Link href={langPath(lang, "house-boq-estimate")} className="premium-button premium-button-blue">＋ {L(lang, "Create estimate", "एस्टिमेट बनाएं")}</Link></section>
        <section className="bf-stat-grid" aria-label={L(lang, "Workspace statistics", "वर्कस्पेस आंकड़े")}>{overviewStats.map((stat) => <article className="bf-stat-card" key={stat.label}><div className="bf-stat-top"><span>{stat.label}</span><i>{stat.icon}</i></div><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</section>
        <section className="bf-quick-section"><div className="bf-section-heading"><div><span className="premium-kicker">01 / {L(lang, "QUICK ACTIONS", "क्विक एक्शन")}</span><h2>{L(lang, "Pick up where you need to.", "जरूरत के काम को जल्दी शुरू करें।")}</h2></div></div><div className="bf-quick-grid">
          {[
            ["▤", L(lang, "Start a BOQ", "BOQ शुरू करें"), L(lang, "Create an item-wise estimate", "आइटम-वार एस्टिमेट बनाएं"), "house-boq-estimate"],
            ["↥", L(lang, "Upload a drawing", "ड्रॉइंग अपलोड करें"), L(lang, "Read a plan and verify rooms", "नक्शा पढ़ें और कमरे जांचें"), "plan-to-estimate"],
            ["⌗", L(lang, "Explore house plans", "घर के नक्शे देखें"), L(lang, "Browse 2D and 3D plans", "2D और 3D नक्शे देखें"), "naksha"],
            ["∑", L(lang, "Open calculators", "कैलकुलेटर खोलें"), L(lang, "Estimate key quantities", "जरूरी मात्रा का अनुमान लगाएं"), "calculators"],
          ].map(([icon, title, sub, href]) => <Link href={langPath(lang, href)} className="bf-quick-card" key={href}><span className="bf-quick-icon">{icon}</span><span><b>{title}</b><small>{sub}</small></span><i>↗</i></Link>)}
        </div></section>
        <div className="bf-dashboard-columns">
          <section id="projects" className={sectionClass}><div className="bf-card-heading"><div><span className="premium-kicker">02 / {L(lang, "PROJECTS", "प्रोजेक्ट")}</span><h2>{L(lang, "Recent projects", "हाल के प्रोजेक्ट")}</h2></div><Link href={langPath(lang, "house-boq-estimate")}>{L(lang, "New estimate", "नया एस्टिमेट")} ↗</Link></div>
            {rows === null ? <div className="bf-project-skeleton"><span /><span /><span /></div> : projects.length === 0 ? <div className="bf-empty-projects"><span>▦</span><b>{L(lang, "Your first project starts here.", "आपका पहला प्रोजेक्ट यहां शुरू होता है।")}</b><p>{L(lang, "Create an estimate, then save it to keep project details in your workspace.", "एस्टिमेट बनाएं और जानकारी वर्कस्पेस में रखने के लिए उसे सेव करें।")}</p><Link className="premium-button premium-button-blue" href={langPath(lang, "house-boq-estimate")}>{L(lang, "Create an estimate", "एस्टिमेट बनाएं")} <span>↗</span></Link></div> : <div className="bf-project-list">{projects.slice(0, 6).map((project) => <div className="bf-project-row" key={project.id}><span className="bf-project-icon">{project.kind === "plan" ? "⌗" : "▤"}</span><Link href={`${langPath(lang, "house-boq-estimate")}?project=${project.id}`} className="bf-project-name"><b>{project.name}</b><small>{L(lang, "Estimate", "एस्टिमेट")} · {dateLabel(project.updated_at)}</small></Link>{project.pro && <span className="bf-project-pro">PRO</span>}<button type="button" className="bf-delete-project" aria-label={`${L(lang, "Delete", "हटाएं")} ${project.name}`} onClick={async () => { if (!sb || !window.confirm(L(lang, `Delete “${project.name}”?`, `“${project.name}” हटाएं?`))) return; const { error } = await sb.from("projects").delete().eq("id", project.id); if (error) alertBox(error.message); else setRows((current) => (current ?? []).filter((row) => row.id !== project.id)); }}>⋯</button></div>)}{projects.length > 6 && <p className="bf-list-note">{L(lang, `Showing 6 of ${projects.length} projects`, `${projects.length} में से 6 प्रोजेक्ट दिखाए जा रहे हैं`)}</p>}</div>}
          </section>
          <div className="bf-dashboard-right">
            <section className={sectionClass}><div className="bf-card-heading"><div><span className="premium-kicker">03 / {L(lang, "ACCOUNT", "अकाउंट")}</span><h2>{L(lang, "Your plan", "आपका प्लान")}</h2></div><span className={`bf-plan-icon ${account.pro ? "is-pro" : ""}`}>✦</span></div><div className="bf-plan-summary"><b>{account.pro ? "BOQFather Pro" : L(lang, "Free plan", "फ़्री प्लान")}</b><span>{account.pro && activeUntil ? `${L(lang, "Active until", "तक सक्रिय")} ${dateLabel(activeUntil.toISOString())}` : L(lang, "Core calculators and estimates", "मुख्य कैलकुलेटर और एस्टिमेट")}</span></div>{account.payReady && <button className="bf-plan-button" onClick={async () => { const ok = await account.buy("month").catch((error) => { alertBox(error instanceof Error ? error.message : "Payment failed"); return false; }); if (ok) alertBox(L(lang, "Pro is on. Thank you!", "Pro चालू हो गया। धन्यवाद!")); }}>{account.pro ? L(lang, `Extend 30 days · ₹${PLANS.month.inr}`, `30 दिन बढ़ाएं · ₹${PLANS.month.inr}`) : L(lang, `Explore Pro · ₹${PLANS.month.inr}/month`, `Pro देखें · ₹${PLANS.month.inr}/महीना`)} ↗</button>}<Link className="bf-subtle-link" href={langPath(lang, "pro")}>{L(lang, "Compare plans and features", "प्लान और सुविधाएं तुलना करें")} →</Link></section>
            <section className={sectionClass}><div className="bf-card-heading"><div><span className="premium-kicker">04 / {L(lang, "SETTINGS", "सेटिंग्स")}</span><h2>{L(lang, "Report branding", "रिपोर्ट ब्रांडिंग")}</h2></div></div><p className="bf-settings-copy">{L(lang, "Add a firm name to your Pro reports.", "अपनी Pro रिपोर्ट में फर्म का नाम जोड़ें।")}</p><form className="bf-brand-form" onSubmit={async (event) => { event.preventDefault(); if (!sb || !account.user) return; const { error } = await sb.from("profiles").update({ brand_name: brand.trim() }).eq("id", account.user.id); if (error) alertBox(error.message); else { await account.refresh(); alertBox(L(lang, "Saved", "सेव हो गया")); } }}><label className="sr-only" htmlFor="report-brand">{L(lang, "Firm name", "फर्म का नाम")}</label><input id="report-brand" value={brand} onChange={(event) => setBrand(event.target.value)} maxLength={60} placeholder={L(lang, "e.g. Sharma Construction", "जैसे शर्मा कंस्ट्रक्शन")} /><button type="submit">{L(lang, "Save", "सेव करें")}</button></form></section>
          </div>
        </div>
        {orders.length > 0 && <section className={sectionClass}><div className="bf-card-heading"><div><span className="premium-kicker">05 / {L(lang, "CUSTOM PROJECTS", "कस्टम प्रोजेक्ट")}</span><h2>{L(lang, "Custom plan orders", "कस्टम नक्शा ऑर्डर")}</h2></div></div><div className="bf-project-list">{orders.map((order) => <div key={order.id} className="bf-project-row"><span className="bf-project-icon">⌗</span><span className="bf-project-name"><b>{order.details?.size} {order.details?.facing}</b><small>{dateLabel(order.created_at)}</small></span><span className="bf-order-status">{order.status === "delivered" ? L(lang, "Delivered", "डिलीवर") : order.status === "in_progress" ? L(lang, "In progress", "काम जारी") : L(lang, "Received", "प्राप्त")}</span></div>)}</div></section>}
        <section className="bf-activity-note"><span>↗</span><p><b>{L(lang, "Recent activity", "हाल की गतिविधि")}</b><small>{projects.length ? L(lang, `Your workspace has ${projects.length} saved project${projects.length === 1 ? "" : "s"}. The list above is ordered by most recently updated.`, `आपके वर्कस्पेस में ${projects.length} सेव प्रोजेक्ट हैं। सूची सबसे हाल ही में अपडेट किए गए प्रोजेक्ट से शुरू होती है।`) : L(lang, "Saved estimates and project updates will appear here when available.", "सेव किए गए एस्टिमेट और प्रोजेक्ट अपडेट यहां दिखाई देंगे।")}</small></p></section>
      </main>
    </div>
  </div>;
}
