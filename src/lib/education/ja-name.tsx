import { Fragment, type ReactNode } from "react";

export const JA_PERSON_NAME = "イフトウデイ　エドワード";

const JA_PERSON_NAMES = [JA_PERSON_NAME, "エドワード・イフトウデイ"];

/**
 * Wraps every occurrence of the Japanese person name in a nowrap span so it
 * never breaks across lines on Japanese pages. EN strings pass through.
 */
export function withJaName(text: string): ReactNode {
  if (!JA_PERSON_NAMES.some((name) => text.includes(name))) return text;

  const pattern = JA_PERSON_NAMES.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "g"));

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="ja-name">{part}</span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
