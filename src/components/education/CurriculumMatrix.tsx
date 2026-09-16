"use client";

import { useState } from "react";
import { useLocale } from "@/lib/education/language-context";
import { curriculumAlignment } from "@/lib/education/curriculum-alignment";

interface CurriculumMatrixProps {
  filters?: string[];
}

export function CurriculumMatrix({ filters }: CurriculumMatrixProps) {
  const { locale } = useLocale();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    { key: "all", label: "All", labelJa: "全て" },
    { key: "jhs", label: "JHS Social Studies", labelJa: "中学校 社会科" },
    { key: "rekish", label: "歴史総合", labelJa: "歴史総合" },
    { key: "nihonshi", label: "日本史探究", labelJa: "日本史探究" },
    { key: "tankyu", label: "探究", labelJa: "探究" },
    { key: "english", label: "English", labelJa: "英語" },
    { key: "ib", label: "IB", labelJa: "IB" },
    { key: "ap", label: "AP", labelJa: "AP" },
  ];

  const visibleRows =
    activeFilter && activeFilter !== "all"
      ? curriculumAlignment.filter((row) => {
          const key = activeFilter;
          const val =
            key === "jhs"
              ? row.jhsSocial
              : key === "rekish"
                ? row.hsRekish
                : key === "nihonshi"
                  ? row.hsNihonshi
                  : key === "tankyu"
                    ? row.hsTankyu
                    : key === "english"
                      ? row.english
                      : key === "ib"
                        ? row.ib
                        : row.ap;
          return val && val !== "—";
        })
      : curriculumAlignment;

  return (
    <div>
      <div className="matrix-filters">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            className={`matrix-filter-btn ${activeFilter === f.key || (f.key === "all" && !activeFilter) ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key === "all" ? null : f.key)}
          >
            {locale === "ja" ? f.labelJa : f.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th>{locale === "ja" ? "テーマ" : "Theme"}</th>
              <th>JHS</th>
              <th>歴史総合</th>
              <th>日本史探究</th>
              <th>探究</th>
              <th>English</th>
              <th>IB</th>
              <th>AP</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>
                  {locale === "ja" ? row.themeJa : row.theme}
                </td>
                <td>{row.jhsSocial}</td>
                <td>{row.hsRekish}</td>
                <td>{row.hsNihonshi}</td>
                <td>{row.hsTankyu}</td>
                <td>{row.english}</td>
                <td>{row.ib}</td>
                <td>{row.ap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
