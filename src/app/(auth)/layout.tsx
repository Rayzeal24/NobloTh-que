import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_45%)]" />
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center gap-2 text-lg font-bold">
          <BrandLogo className="size-9" priority />
          <span className="self-center">NobloThèque</span>
        </Link>
        <section className="rounded-3xl border bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">{children}</section>
      </div>
    </main>
  );
}
