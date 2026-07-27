"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error("E-mail, mot de passe ou validation incorrect.");
        router.push("/app"); router.refresh();
        return;
      }
      const endpoints = {
        register: "/api/auth/register",
        forgot: "/api/auth/forgot-password",
        reset: "/api/auth/reset-password",
      };
      const body = mode === "register"
        ? { name: form.get("name"), email, password }
        : mode === "forgot"
          ? { email }
          : { token: search.get("token"), password };
      const response = await fetch(endpoints[mode], {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const responseBody = await response.text();
      let data: { error?: string } = {};
      if (responseBody) {
        try {
          data = JSON.parse(responseBody) as { error?: string };
        } catch {
          data = {};
        }
      }
      if (!response.ok) throw new Error(data.error ?? "Le service est momentanément indisponible. Réessayez plus tard.");
      if (mode === "reset") router.push("/connexion?reset=1");
      else setMessage(mode === "register" ? "Compte créé. Consultez votre e-mail pour le confirmer." : "Si cette adresse correspond à un compte, vous recevrez les instructions par e-mail.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally { setLoading(false); }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {mode === "register" && <Input name="name" placeholder="Votre nom d’utilisateur" autoComplete="username" required minLength={3} maxLength={24} />}
      {mode !== "reset" && <Input name="email" type="email" placeholder="Adresse e-mail" autoComplete="email" required />}
      {(mode === "login" || mode === "register" || mode === "reset") && (
        <div className="relative">
          <Input name="password" type={showPassword ? "text" : "password"} placeholder="Mot de passe" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? 8 : 12} maxLength={128} className="pr-12" />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-1 top-0 grid size-11 place-items-center text-muted" aria-label="Afficher le mot de passe">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}
      {mode === "register" && <p className="text-xs leading-5 text-muted">12 caractères minimum, avec minuscule, majuscule, chiffre et caractère spécial.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
      {message && <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{message}</p>}
      <Button className="w-full" size="lg" disabled={loading}>
        {loading && <LoaderCircle size={18} className="animate-spin" />}
        {{ login: "Se connecter", register: "Créer mon compte", forgot: "Envoyer le lien", reset: "Modifier le mot de passe" }[mode]}
      </Button>
      {mode === "login" && process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" && (
        <Button type="button" variant="secondary" className="w-full" onClick={() => signIn("google", { callbackUrl: "/app" })}>Continuer avec Google</Button>
      )}
    </form>
  );
}
