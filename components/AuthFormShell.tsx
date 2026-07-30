import Link from "next/link";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PageHeading } from "@/components/PageHeading";

type AuthFormShellProps = {
  title: string;
  error?: string | null;
  children: React.ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthFormShell({
  title,
  error,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: AuthFormShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <PageHeading centered>{title}</PageHeading>

        {error && <ErrorBanner message={error} />}

        {children}

        <p className="mt-6 text-center text-sm text-foreground/60">
          {footerText}{" "}
          <Link href={footerHref} className="text-accent hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </main>
  );
}
