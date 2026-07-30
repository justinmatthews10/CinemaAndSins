/** Shared CSS class strings to avoid duplication across components. */

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none";

export const primaryButtonClass =
  "w-full rounded-lg bg-accent px-4 py-3 font-medium text-background transition-colors hover:bg-accent/80 disabled:opacity-50";

export const navLinkClass = "text-foreground/70 transition-colors hover:text-foreground";

export const secondaryLinkClass =
  "rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5";

/** Score badge background+text colors by score range. */
export const SCORE_BADGE_BG: Record<string, string> = {
  gold: "bg-[#d4af37]/20 text-[#ffd700]",
  green: "bg-green-500/20 text-green-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  red: "bg-accent-secondary/20 text-accent-secondary",
};

/** Score badge text-only colors by score range (for inline text, no background). */
export const SCORE_BADGE_TEXT: Record<string, string> = {
  gold: "text-[#ffd700]",
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-accent-secondary",
};
