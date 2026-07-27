import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return <>
    <h1 className="text-2xl font-extrabold">Bon retour parmi nous</h1>
    <p className="mb-6 mt-2 text-sm text-muted">Reprenez votre lecture là où vous l’avez laissée.</p>
    <Suspense><AuthForm mode="login" /></Suspense>
    <div className="mt-5 flex justify-between text-sm"><Link className="text-muted hover:text-primary" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link><Link className="font-semibold text-primary" href="/inscription">S’inscrire</Link></div>
  </>;
}
