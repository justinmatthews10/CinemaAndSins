type PosterImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

/**
 * Displays a movie poster with a "No poster" fallback.
 * Used by MovieHero, TmdbSearch, and the add-movie page.
 */
export function PosterImage({
  src,
  alt,
  className = "h-48 w-32 rounded object-cover",
  fallbackClassName = "flex h-48 w-32 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40",
}: PosterImageProps) {
  if (!src) {
    return <div className={fallbackClassName}>No poster</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
