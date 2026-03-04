export const BASE_RATE_KG_PER_S = 0.0000025;

type IntensityBucket = "low" | "medium" | "high" | "streaming";

type DomainRule = {
  domain: string;
  multiplier: number;
  bucket: IntensityBucket;
};

const DOMAIN_RULES: DomainRule[] = [
  { domain: "wikipedia.org", multiplier: 1.0, bucket: "low" },
  { domain: "google.com", multiplier: 1.0, bucket: "low" },
  { domain: "docs.google.com", multiplier: 1.0, bucket: "low" },
  { domain: "slack.com", multiplier: 1.6, bucket: "medium" },
  { domain: "github.com", multiplier: 1.6, bucket: "medium" },
  { domain: "notion.so", multiplier: 1.6, bucket: "medium" },
  { domain: "figma.com", multiplier: 2.4, bucket: "high" },
  { domain: "aws.amazon.com", multiplier: 2.4, bucket: "high" },
  { domain: "canva.com", multiplier: 2.4, bucket: "high" },
  { domain: "youtube.com", multiplier: 4.0, bucket: "streaming" },
  { domain: "netflix.com", multiplier: 6.0, bucket: "streaming" },
  { domain: "primevideo.com", multiplier: 5.0, bucket: "streaming" }
];

const normalizeInput = (domainOrUrl: string): string => {
  const raw = domainOrUrl.trim().toLowerCase();
  try {
    if (raw.includes("://")) {
      const u = new URL(raw);
      return `${u.hostname}${u.pathname || ""}`;
    }
  } catch {
    return raw;
  }
  return raw;
};

export const getMultiplier = (domainOrUrl: string): number => {
  const input = normalizeInput(domainOrUrl);
  let best = 1.0;
  for (const rule of DOMAIN_RULES) {
    const d = rule.domain;
    const matches =
      input === d ||
      input.startsWith(`${d}/`) ||
      input.includes(d) ||
      input.endsWith(`.${d}`) ||
      input.includes(`.${d}/`);
    if (matches) best = Math.max(best, rule.multiplier);
  }
  return best;
};

export const getIntensityBucket = (domainOrUrl: string): IntensityBucket => {
  const m = getMultiplier(domainOrUrl);
  if (m >= 4) return "streaming";
  if (m >= 2.4) return "high";
  if (m >= 1.6) return "medium";
  return "low";
};

export const carbonRateGPerS = (domainOrUrl: string): number => {
  const m = getMultiplier(domainOrUrl);
  return BASE_RATE_KG_PER_S * m * 1000;
};

export const formatCarbonRateGPerS = (domainOrUrl: string): string => {
  return `${carbonRateGPerS(domainOrUrl).toFixed(5)}g/s`;
};
