import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  tagline?: string;
}

export default function BrandLogo({
  compact = false,
  className,
  tagline = "Engineering Study Workspace",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand-mark.svg"
        alt="CruxPad brand mark"
        width={40}
        height={40}
        className="h-10 w-10"
      />
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-xl font-black tracking-tight text-[var(--text-primary)]">CruxPad</span>
          <span className="block text-xs text-[var(--text-muted)]">{tagline}</span>
        </span>
      )}
    </span>
  );
}
