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
  { key: "rekishSogo", label: "Historical Studies", labelJa: "歴史総合" },
  { key: "nihonshiTankyu", label: "Japanese History Studies", labelJa: "日本史探究" },
  { key: "tankyu", label: "Inquiry", labelJa: "探究" },
  { key: "english", label: "English", labelJa: "英語" },
  { key: "ib", label: "IB", labelJa: "IB" },
  { key: "ap", label: "AP", labelJa: "AP" },
];

const hsFilters: FilterDef[] = [
  { key: "all", label: "All", labelJa: "すべて" },
  { key: "rekishSogo", label: "Historical Studies", labelJa: "歴史総合" },
  { key: "nihonshiTankyu", label: "Japanese History Studies", labelJa: "日本史探究" },
  { key: "tankyu", label: "Inquiry", labelJa: "探究" },
  { key: "english", label: "English", labelJa: "英語" },
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
  { key: "rekish", label: "Historical Studies", labelJa: "歴史総合" },
  { key: "nihonshi", label: "Japanese History Studies", labelJa: "日本史探究" },
  { key: "tankyu", label: "Inquiry", labelJa: "探究" },
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

  const isEn = locale === "en";
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

  const themeHeader = isEn ? "Theme" : "テーマ";

  const customizationText = isUni
    ? isEn
      ? "Every field seminar is customized to your course objectives and academic focus."
      : "すべてのフィールド・セミナーは、授業内容・研究テーマ・学習目標に合わせてカスタマイズします。"
    : isEn
      ? "Every investigation is customized to your curriculum unit."
      : "すべてのフィールド探究は、授業単元・学習目標・生徒のレベルに合わせてカスタマイズします。";

  const jhsHeadersEn = [
    { key: "jhsSocialEn", label: "JHS Social Studies" },
    { key: "rekishSogoEn", label: "Historical Studies" },
    { key: "nihonshiTankyuEn", label: "Japanese History Studies" },
    { key: "tankyuEn", label: "Inquiry" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const jhsHeadersJa = [
    { key: "jhsSocial", label: "中学社会・歴史" },
    { key: "rekishSogo", label: "歴史総合" },
    { key: "nihonshiTankyu", label: "日本史探究" },
    { key: "tankyu", label: "探究" },
    { key: "english", label: "英語" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const hsHeadersEn = [
    { key: "rekishSogoEn", label: "Historical Studies" },
    { key: "nihonshiTankyuEn", label: "Japanese History Studies" },
    { key: "tankyuEn", label: "Inquiry" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const hsHeadersJa = [
    { key: "rekishSogo", label: "歴史総合" },
    { key: "nihonshiTankyu", label: "日本史探究" },
    { key: "tankyu", label: "探究" },
    { key: "english", label: "英語" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const uniHeadersEn = [
    { key: "historyEn", label: "History" },
    { key: "archaeologyEn", label: "Archaeology" },
    { key: "histGeoEn", label: "Historical Geography" },
    { key: "poliSciEn", label: "Political Science" },
    { key: "japaneseStudiesEn", label: "Japanese Studies" },
  ];

  const uniHeadersJa = [
    { key: "history", label: "歴史学" },
    { key: "archaeology", label: "考古学" },
    { key: "histGeo", label: "歴史地理学" },
    { key: "poliSci", label: "政治学" },
    { key: "japaneseStudies", label: "日本学" },
  ];

  const legacyHeadersEn = [
    { key: "jhsSocial", label: "JHS" },
    { key: "hsRekish", label: "Historical Studies" },
    { key: "hsNihonshi", label: "Japanese History Studies" },
    { key: "hsTankyu", label: "Inquiry" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const legacyHeadersJa = [
    { key: "jhsSocial", label: "JHS" },
    { key: "hsRekish", label: "歴史総合" },
    { key: "hsNihonshi", label: "日本史探究" },
    { key: "hsTankyu", label: "探究" },
    { key: "english", label: "English" },
    { key: "ib", label: "IB" },
    { key: "ap", label: "AP" },
  ];

  const headers = isJhs
    ? isEn ? jhsHeadersEn : jhsHeadersJa
    : isHs
      ? isEn ? hsHeadersEn : hsHeadersJa
      : isUni
        ? isEn ? uniHeadersEn : uniHeadersJa
        : isEn ? legacyHeadersEn : legacyHeadersJa;

  return (
    <div>
      <div className="matrix-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`matrix-filter-btn ${activeFilter === f.key || (f.key === "all" && !activeFilter) ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key === "all" ? null : f.key)}
          >
            {isEn ? f.label : f.labelJa}
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
                  {isEn ? row.theme : row.themeJa}
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
