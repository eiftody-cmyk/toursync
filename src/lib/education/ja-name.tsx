import { Fragment, type ReactNode } from "react";

export const JA_PERSON_NAME = "イフトウデイ　エドワード";

/**
 * Wraps every occurrence of イフトウデイ　エドワード in a nowrap span so the
 * name never breaks across lines on Japanese pages. EN strings pass through.
 */
export function withJaName(text: string): ReactNode {
  if (!text.includes(JA_PERSON_NAME)) return text;

  const parts = text.split(JA_PERSON_NAME);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <span className="ja-name">{JA_PERSON_NAME}</span>}
    </Fragment>
  ));
}
