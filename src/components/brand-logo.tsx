import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative block shrink-0", className)}>
      <Image src="/logo.svg" alt="" fill priority={priority} unoptimized sizes="48px" className="object-contain" />
    </span>
  );
}
