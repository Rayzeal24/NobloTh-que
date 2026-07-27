import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <>
    <h1 className="text-2xl font-extrabold">Créez votre bibliothèque</h1>
    <p className="mb-6 mt-2 text-sm text-muted">Vos romans et votre progression, au même endroit.</p>
    <Suspense><AuthForm mode="register" /></Suspense>
    <p className="mt-5 text-center text-sm text-muted">Déjà membre ? <Link className="font-semibold text-primary" href="/connexion">Se connecter</Link></p>
  </>;
}
