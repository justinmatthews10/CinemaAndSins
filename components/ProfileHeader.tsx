import { formatDate, formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";

type ProfileHeaderProps = {
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  averageScore: number;
  clubAverage: number;
  graderBadge: "harsh" | "easy" | null;
};

export function ProfileHeader({
  name,
  avatarUrl,
  createdAt,
  averageScore,
  clubAverage,
  graderBadge,
}: ProfileHeaderProps) {
  const initial = name.charAt(0).toUpperCase();
  const badgeColor = scoreBadgeColor(averageScore);

  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
          {initial}
        </div>
      )}

      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          {name}
        </h1>
        <p className="text-sm text-foreground/50">Member since {formatDate(createdAt)}</p>
      </div>

      {averageScore > 0 && (
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-foreground/50">Average</p>
            <p className={`text-2xl font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}>
              {formatScore(averageScore)}
            </p>
          </div>
          {graderBadge && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                graderBadge === "easy"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-accent-secondary/20 text-accent-secondary"
              }`}
            >
              {graderBadge === "easy" ? "Easy Grader" : "Harsh Critic"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
