import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function ResetPage() {
  return <>
    <h1 className="text-2xl font-extrabold">Nouveau mot de passe</h1>
    <p className="mb-6 mt-2 text-sm text-muted">Choisissez un mot de passe unique et robuste.</p>
    <Suspense><AuthForm mode="reset" /></Suspense>
  </>;
}
