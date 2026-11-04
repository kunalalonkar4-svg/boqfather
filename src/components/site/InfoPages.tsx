export function AccountShell({ lang }: { lang: Lang }) {
  return (
    <>
      <SiteHeader lang={lang} altPath={langPath(lang === "en" ? "hi" : "en", "account")} />
      <main lang={lang} className="bf-account-page">
        <AccountView lang={lang} />
      </main>
    </>
  );
}
