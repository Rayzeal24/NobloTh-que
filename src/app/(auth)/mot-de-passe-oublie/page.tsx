import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function ForgotPage() {
  return <>
    <h1 className="text-2xl font-extrabold">Mot de passe oublié</h1>
    <p className="mb-6 mt-2 text-sm text-muted">Nous vous enverrons un lien valable pendant une heure.</p>
    <Suspense><AuthForm mode="forgot" /></Suspense>
    <p className="mt-5 text-center text-sm"><Link className="font-semibold text-primary" href="/connexion">Retour à la connexion</Link></p>
  </>;
}
