type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-accent-secondary/50 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary">
      {message}
    </div>
  );
}
