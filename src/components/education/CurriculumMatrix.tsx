"use client";

import { useState } from "react";
import { useLocale } from "@/lib/education/language-context";
import {
  curriculumAlignment,
  jhsCurriculumAlignment,
  hsCurriculumAlignment,
  universityCurriculumAlignment,
} from "@/lib/education/curriculum-alignment";

interface CurriculumMatrixProps {
  variant?: "jhs" | "hs" | "university";
}

type FilterDef = { key: string; label: string; labelJa: string };

const jhsFilters: FilterDef[] = [
  { key: "all", label: "All", labelJa: "すべて" },
  { key: "jhsSocial", label: "JHS Social Studies", labelJa: "中学社会・歴史" },
  { key: "rekishSogo", label: "歴史総合", labelJa: "歴史総合" },
  { key: "nihonshiTankyu", label: "日本史探究", labelJa: "日本史探究" },
  { key: "tankyu", label: "探究", labelJa: "探究" },
  { key: "english", label: "English", labelJa: "English" },
  { key: "ib", label: "IB", labelJa: "IB" },
  { key: "ap", label: "AP", labelJa: "AP" },
];

const hsFilters: FilterDef[] = [
  { key: "all", label: "All", labelJa: "すべて" },
  { key: "rekishSogo", label: "歴史総合", labelJa: "歴史総合" },
  { key: "nihonshiTankyu", label: "日本史探究", labelJa: "日本史探究" },
  { key: "tankyu", label: "探究", labelJa: "探究" },
  { key: "english", label: "English", labelJa: "English" },
  { key: "ib", label: "IB", labelJa: "IB" },
  { key: "ap", label: "AP", labelJa: "AP" },
];

const uniFilters: FilterDef[] = [
  { key: "all", label: "All", labelJa: "すべて" },
  { key: "history", label: "History", labelJa: "歴史学" },
  { key: "archaeology", label: "Archaeology", labelJa: "考古学" },
  { key: "histGeo", label: "Historical Geography", labelJa: "歴史地理学" },
  { key: "poliSci", label: "Political Science", labelJa: "政治学" },
  { key: "japaneseStudies", label: "Japanese Studies", labelJa: "日本学" },
];

const legacyFilters: FilterDef[] = [
  { key: "all", label: "All", labelJa: "全て" },
  { key: "jhs", label: "JHS Social Studies", labelJa: "中学校 社会科" },
  { key: "rekish", label: "歴史総合", labelJa: "歴史総合" },
  { key: "nihonshi", label: "日本史探究", labelJa: "日本史探究" },
  { key: "tankyu", label: "探究", labelJa: "探究" },
  { key: "english", label: "English", labelJa: "英語" },
  { key: "ib", label: "IB", labelJa: "IB" },
  { key: "ap", label: "AP", labelJa: "AP" },
];

function getFieldValue(row: Record<string, unknown>, key: string): string {
  const val = row[key];
  return typeof val === "string" ? val : "";
}

export function CurriculumMatrix({ variant }: CurriculumMatrixProps) {
  const { locale } = useLocale();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const isJhs = variant === "jhs";
  const isHs = variant === "hs";
  const isUni = variant === "university";
  const isLegacy = !variant;

  const filters = isJhs
    ? jhsFilters
    : isHs
      ? hsFilters
      : isUni
        ? uniFilters
        : legacyFilters;

  const data = isJhs
    ? jhsCurriculumAlignment
    : isHs
      ? hsCurriculumAlignment
      : isUni
        ? universityCurriculumAlignment
        : curriculumAlignment;

  const visibleRows =
    activeFilter && activeFilter !== "all"
      ? data.filter((row) => {
          const val = getFieldValue(row as unknown as Record<string, unknown>, activeFilter);
          return val && val !== "—";
        })
      : data;

  const themeHeader = locale === "ja" ? "テーマ" : "Theme";

  const customizationText = isUni
    ? locale === "ja"
      ? "すべてのフィールド・セミナーは、授業内容・研究テーマ・学習目標に合わせてカスタマイズします。"
      : "Every field seminar is customized to your course objectives and academic focus."
    : locale === "ja"
      ? "すべてのフィールド・インベスティゲーションは、授業単元・学習目標・生徒のレベルに合わせてカスタマイズします。"
      : "Every investigation is customized to your curriculum unit.";

  const jhsHeaders = [
    { key: "jhsSocial", label: "中学社会・歴史" },
    { key: "rekishSogo", label: "歴史総合" },
    { key: "nihonshiTankyu", label: "日本史探究" },
    { key: "tankyu", label: "探究" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const hsHeaders = [
    { key: "rekishSogo", label: "歴史総合" },
    { key: "nihonshiTankyu", label: "日本史探究" },
    { key: "tankyu", label: "探究" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const uniHeaders = [
    { key: "history", label: "歴史学" },
    { key: "archaeology", label: "考古学" },
    { key: "histGeo", label: "歴史地理学" },
    { key: "poliSci", label: "政治学" },
    { key: "japaneseStudies", label: "日本学" },
  ];

  const legacyHeaders = [
    { key: "jhsSocial", label: "JHS" },
    { key: "hsRekish", label: "歴史総合" },
    { key: "hsNihonshi", label: "日本史探究" },
    { key: "hsTankyu", label: "探究" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const headers = isJhs
    ? jhsHeaders
    : isHs
      ? hsHeaders
      : isUni
        ? uniHeaders
        : legacyHeaders;

  return (
    <div>
      <div className="matrix-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`matrix-filter-btn ${activeFilter === f.key || (f.key === "all" && !activeFilter) ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key === "all" ? null : f.key)}
          >
            {locale === "ja" ? f.labelJa : f.label}
          </button>
        ))}
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--edu-muted)",
          fontStyle: "italic",
          marginBottom: "1rem",
        }}
      >
        {customizationText}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th>{themeHeader}</th>
              {headers.map((h) => (
                <th key={h.key}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>
                  {locale === "ja" ? row.themeJa : row.theme}
                </td>
                {headers.map((h) => (
                  <td key={h.key}>
                    {getFieldValue(row as unknown as Record<string, unknown>, h.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
