"use client";

import Link from "next/link";
import { LanguageProvider, useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/corporate/content";
import { ja } from "@/lib/corporate/content-ja";
import { withJaName } from "@/lib/education/ja-name";

function Header() {
  const { locale, setLocale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const prefix = locale === "ja" ? "/ja" : "";

  const toggleLocale = () => {
    const newLocale = locale === "ja" ? "en" : "ja";
    const newPath = newLocale === "ja" ? `/ja/corporate` : "/corporate";
    setLocale(newLocale);
    // Keep server metadata/layout in sync (middleware also sets this on /ja/*)
    document.cookie = `edu-locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.href = newPath;
  };

  return (
    <header className="edu-header">
      <div className="edu-header-inner">
        <Link href={`${prefix}/corporate`} className="edu-brand">
          <span className="edu-brand-name">{withJaName(t.meta.siteName)}</span>
          <span className="edu-brand-tagline">{t.meta.tagline}</span>
        </Link>

        <nav className="edu-nav">
          <a href="#experience" className="edu-nav-link">
            {t.nav.experience}
          </a>
          <a href="#how-it-works" className="edu-nav-link">
            {t.nav.howItWorks}
          </a>
          <a href="#evidence" className="edu-nav-link">
            {t.nav.evidence}
          </a>
          <a href="#pricing" className="edu-nav-link">
            {t.nav.pricing}
          </a>
          <a href="#inquiry-form" className="edu-nav-link">
            {t.nav.enquire}
          </a>
        </nav>

        <div className="edu-header-actions">
          <div className="lang-toggle">
            <button
              className={locale === "en" ? "active" : ""}
              onClick={() => {
                if (locale !== "en") toggleLocale();
              }}
            >
              EN
            </button>
            <button
              className={locale === "ja" ? "active" : ""}
              onClick={() => {
                if (locale !== "ja") toggleLocale();
              }}
            >
              日本語
            </button>
          </div>
          <a href="#inquiry-form" className="edu-cta-btn">
            {t.nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { locale } = useLocale();

  return (
    <footer className="edu-footer">
      <img
        src="/images/logo.webp"
        alt="Osaka Castle Walks with Edward"
        className="edu-footer-logo"
        width={180}
        height={180}
      />
      <p>
        {locale === "ja"
          ? withJaName(
              "大阪の法人向けチームビルディング — 大阪城ウォークス with エドワード・イフトウデイ"
            )
          : "Corporate Team Building — Osaka Castle Walks with Edward"}
      </p>
      <div className="edu-footer-links">
        <a href="https://osakacastletours.com">Osaka Castle Walks</a>
        <a href="https://osakacastletours.com/aboutme">
          {locale === "ja"
            ? withJaName("エドワード・イフトウデイについて")
            : "About Edward"}
        </a>
        <a href="https://osakacastletours.com/faq">FAQ</a>
      </div>
    </footer>
  );
}

export default function ClientLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: "en" | "ja";
}) {
  return (
    <LanguageProvider initialLocale={locale}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
