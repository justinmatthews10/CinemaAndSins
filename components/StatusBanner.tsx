type StatusBannerProps = {
  message: string;
  variant?: "error" | "success";
  className?: string;
};

const VARIANT_STYLES = {
  error: "border-accent-secondary/50 bg-accent-secondary/10 text-accent-secondary",
  success: "border-green-500/30 bg-green-500/10 text-green-400",
} as const;

/**
 * Displays a success or error message banner.
 * Replaces ErrorBanner and inline success/error divs.
 */
export function StatusBanner({
  message,
  variant = "error",
  className = "mb-4",
}: StatusBannerProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANT_STYLES[variant]} ${className}`}
    >
      {message}
    </div>
  );
}
