import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export default function BrandLogo({
  compact = false,
  className,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={compact ? "/brand-mark.svg" : "/brand-logo.svg"}
        alt={compact ? "CruxPad brand mark" : "CruxPad logo"}
        width={compact ? 40 : 260}
        height={compact ? 40 : 64}
        className={compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-8 w-auto sm:h-9"}
      />
    </span>
  );
}
