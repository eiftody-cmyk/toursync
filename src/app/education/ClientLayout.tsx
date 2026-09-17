"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageProvider, useLocale } from "@/lib/education/language-context";
import { en } from "@/lib/education/content";
import { ja } from "@/lib/education/content-ja";

function Header() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const t = locale === "ja" ? ja : en;
  const prefix = locale === "ja" ? "/ja" : "";

  const isActive = (path: string) =>
    pathname === `${prefix}${path}` || pathname === path;

  const toggleLocale = () => {
    const newLocale = locale === "ja" ? "en" : "ja";
    const newPath =
      newLocale === "ja"
        ? `/ja${pathname}`
        : pathname.replace(/^\/ja/, "") || "/education";
    setLocale(newLocale);
    window.location.href = newPath;
  };

  return (
    <header className="edu-header">
      <div className="edu-header-inner">
        <Link href={`${prefix}/education`} className="edu-brand">
          <span className="edu-brand-name">{t.meta.siteName}</span>
          <span className="edu-brand-tagline">{t.meta.tagline}</span>
        </Link>

        <nav className="edu-nav">
          <Link
            href={`${prefix}/education`}
            className={`edu-nav-link ${isActive("/education") ? "active" : ""}`}
          >
            {t.nav.hub}
          </Link>
          <Link
            href={`${prefix}/education/junior-high`}
            className={`edu-nav-link ${isActive("/education/junior-high") ? "active" : ""}`}
          >
            {t.nav.juniorHigh}
          </Link>
          <Link
            href={`${prefix}/education/high-school`}
            className={`edu-nav-link ${isActive("/education/high-school") ? "active" : ""}`}
          >
            {t.nav.highSchool}
          </Link>
          <Link
            href={`${prefix}/education/university`}
            className={`edu-nav-link ${isActive("/education/university") ? "active" : ""}`}
          >
            {t.nav.university}
          </Link>
          <Link
            href={`${prefix}/education/teacher-pack`}
            className={`edu-nav-link ${isActive("/education/teacher-pack") ? "active" : ""}`}
          >
            {t.nav.teacherPack}
          </Link>
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
      <p>
        {locale === "ja"
          ? "大阪歴史フィールド探究 — 大阪城ウォークス with Edward の一部門"
          : "The Osaka History Investigation — A division of Osaka Castle Walks with Edward"}
      </p>
      <div className="edu-footer-links">
        <a href="https://osakacastletours.com">Osaka Castle Walks</a>
        <a href="https://osakacastletours.com/aboutme">
          {locale === "ja" ? "エドワードについて" : "About Edward"}
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
