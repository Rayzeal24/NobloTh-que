"use client";

import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileSettings({ name, email }: { name: string; email: string }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name") }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(data.error ?? "Impossible d’enregistrer ce nom.");
    else setSaved(true);
  }
  return <div className="space-y-5">
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-surface p-5">
      <h2 className="font-bold">Informations personnelles</h2>
      <div><label className="mb-2 block text-xs text-muted">Nom affiché</label><Input name="name" defaultValue={name} required minLength={3} maxLength={24} /></div>
      <div><label className="mb-2 block text-xs text-muted">Adresse e-mail</label><Input value={email} disabled /></div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-3"><Button size="sm">Enregistrer</Button>{saved && <span className="text-xs text-success">Modifications enregistrées</span>}</div>
    </form>
    <Button variant="danger" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={18} />Se déconnecter</Button>
  </div>;
}
