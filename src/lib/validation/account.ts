import { z } from "zod";

const forbiddenUsernameTerms = new Set([
  "admin", "administrateur", "administrator", "moderateur", "moderator", "modo",
  "system", "systeme", "root", "support", "staff", "webmaster", "official", "officiel",
  "noblotheque", "noblo", "api", "null", "undefined", "anonymous", "anonyme",
  "connard", "connasse", "salope", "pute", "encule", "enculee", "fdp",
  "nazi", "hitler", "terroriste", "pedophile",
]);

const commonPasswords = new Set([
  "password", "password123", "motdepasse", "motdepasse123", "azerty123",
  "qwerty123", "123456789", "1234567890", "noblotheque", "noblotheque123",
]);

function normalizeForModeration(value: string) {
  return value
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll("@", "a")
    .replaceAll("$", "s")
    .replaceAll("0", "o")
    .replaceAll("1", "i")
    .replaceAll("3", "e")
    .replaceAll("4", "a")
    .replaceAll("5", "s")
    .replaceAll("7", "t")
    .replaceAll(/[^a-z0-9]/g, "");
}

export function sanitizeUsername(value: string) {
  return value.normalize("NFKC").trim().replaceAll(/\s+/g, " ");
}

export function createUsernameKey(value: string) {
  return sanitizeUsername(value)
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");
}

export function isForbiddenUsername(value: string) {
  const normalized = normalizeForModeration(value);
  return [...forbiddenUsernameTerms].some((term) => normalized.includes(term));
}

export const usernameSchema = z
  .string()
  .transform(sanitizeUsername)
  .pipe(
    z.string()
      .min(3, "Le nom doit contenir au moins 3 caractères.")
      .max(24, "Le nom ne peut pas dépasser 24 caractères.")
      .regex(
        /^[\p{L}\p{N}](?:[\p{L}\p{N}_.-]*[\p{L}\p{N}])?$/u,
        "Le nom d’utilisateur doit être écrit sans espace.",
      )
      .refine((value) => !/[_.-]{2,}/.test(value), "Les séparateurs ne peuvent pas se répéter.")
      .refine((value) => !isForbiddenUsername(value), "Ce nom d’utilisateur n’est pas autorisé."),
  );

export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères.")
  .regex(/[a-z]/, "Ajoutez au moins une lettre minuscule.")
  .regex(/[A-Z]/, "Ajoutez au moins une lettre majuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Ajoutez au moins un caractère spécial.")
  .refine(
    (value) => !commonPasswords.has(normalizeForModeration(value)),
    "Ce mot de passe est trop courant.",
  );

export const registrationSchema = z
  .object({
    name: usernameSchema,
    email: z.string().email("L’adresse e-mail est invalide.").transform((value) => value.toLowerCase()),
    password: passwordSchema,
  })
  .superRefine((data, context) => {
    const password = normalizeForModeration(data.password);
    const username = normalizeForModeration(data.name);
    const emailName = normalizeForModeration(data.email.split("@")[0] ?? "");
    if ((username.length >= 3 && password.includes(username)) || (emailName.length >= 4 && password.includes(emailName))) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: "Le mot de passe ne doit pas contenir votre nom ou votre adresse e-mail.",
      });
    }
  });
