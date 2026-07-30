type PageHeadingProps = {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
};

/**
 * Standard page heading using the Playfair display font.
 * Used across schedule, add-movie, pending, and auth pages.
 */
export function PageHeading({
  children,
  className = "mb-8",
  centered = false,
}: PageHeadingProps) {
  return (
    <h1
      className={`font-[family-name:var(--font-playfair)] text-3xl font-bold ${centered ? "text-center " : ""}${className}`}
    >
      {children}
    </h1>
  );
}
