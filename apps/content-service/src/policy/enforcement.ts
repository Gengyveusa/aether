import type { BrandPolicy, CanonicalContent } from "@aether/shared-types";

export type PolicyViolation = {
  field: string;
  phrase: string;
  reason: string;
};

function replaceAllCaseInsensitive(input: string, needle: string, replacement: string): { output: string; count: number } {
  if (!needle) return { output: input, count: 0 };
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let count = 0;
  const output = input.replace(re, () => {
    count += 1;
    return replacement;
  });
  return { output, count };
}

const DEFAULT_BANNED_SUPERLATIVES = ["best", "best ever", "#1", "number one", "world-class", "leading", "top"]; // minimal starter

function enforceOnText(field: string, text: string, policy: BrandPolicy): { text: string; violations: PolicyViolation[] } {
  let current = text;
  const violations: PolicyViolation[] = [];

  for (const phrase of policy.forbiddenPhrases ?? []) {
    const trimmed = String(phrase).trim();
    if (!trimmed) continue;

    const r = replaceAllCaseInsensitive(current, trimmed, "[redacted]");
    if (r.count > 0) {
      violations.push({ field, phrase: trimmed, reason: "forbidden_phrase" });
      current = r.output;
    }
  }

  const canUseSuperlatives = policy.allowedClaims?.canUseSuperlatives ?? false;
  if (!canUseSuperlatives) {
    for (const s of DEFAULT_BANNED_SUPERLATIVES) {
      const r = replaceAllCaseInsensitive(current, s, "strong");
      if (r.count > 0) {
        violations.push({ field, phrase: s, reason: "superlative_not_allowed" });
        current = r.output;
      }
    }
  } else {
    const allowed = new Set((policy.allowedClaims?.allowedSuperlatives ?? []).map((x) => x.toLowerCase()));
    if (allowed.size > 0) {
      for (const s of DEFAULT_BANNED_SUPERLATIVES) {
        if (allowed.has(s.toLowerCase())) continue;
        const replacement = policy.allowedClaims.allowedSuperlatives[0] ?? "strong";
        const r = replaceAllCaseInsensitive(current, s, replacement);
        if (r.count > 0) {
          violations.push({ field, phrase: s, reason: "superlative_rewritten_to_allowed" });
          current = r.output;
        }
      }
    }
  }

  return { text: current, violations };
}

export function enforcePolicyOnCanonicalContent(
  canonical: CanonicalContent,
  policy: BrandPolicy
): { canonicalContent: CanonicalContent; policyViolations: PolicyViolation[] } {
  const violations: PolicyViolation[] = [];

  const aboutShort = enforceOnText("aboutShort", canonical.aboutShort, policy);
  violations.push(...aboutShort.violations);

  const aboutLong = enforceOnText("aboutLong", canonical.aboutLong, policy);
  violations.push(...aboutLong.violations);

  const faq = canonical.faq.map((item, idx) => {
    const a = enforceOnText(`faq[${idx}].answer`, item.answer, policy);
    violations.push(...a.violations);
    return { ...item, answer: a.text };
  });

  return {
    canonicalContent: {
      ...canonical,
      aboutShort: aboutShort.text,
      aboutLong: aboutLong.text,
      faq
    },
    policyViolations: violations
  };
}
