/**
 * Standard full-page loading spinner.
 * Used by client pages while fetching auth state or data.
 */
export function LoadingState() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <p className="text-foreground/60">Loading...</p>
    </main>
  );
}
