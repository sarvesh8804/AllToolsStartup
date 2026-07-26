import Link from "next/link";
import { cn } from "@/lib/cn";

/** Prefer this over raw <a> for internal navigation + consistent styling. */
export function InternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[var(--copper-bright)] underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}
