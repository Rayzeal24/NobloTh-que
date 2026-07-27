import { describe, expect, it } from "vitest";
import { createUsernameKey, passwordSchema, usernameSchema } from "./account";

describe("validation des noms d’utilisateur", () => {
  it("accepte un nom francophone normal", () => {
    expect(usernameSchema.safeParse("Éloïse_17").success).toBe(true);
  });

  it("refuse les noms réservés et leurs variantes", () => {
    expect(usernameSchema.safeParse("Administrateur").success).toBe(false);
    expect(usernameSchema.safeParse("N0bl0-Support").success).toBe(false);
  });

  it("refuse les symboles et séparateurs répétés", () => {
    expect(usernameSchema.safeParse("Jean<script>").success).toBe(false);
    expect(usernameSchema.safeParse("Jean__Dupont").success).toBe(false);
    expect(usernameSchema.safeParse("Jean Dupont").success).toBe(false);
  });

  it("produit la même clé pour les variantes de casse et d’accent", () => {
    expect(createUsernameKey("Éloïse")).toBe(createUsernameKey("eloise"));
  });
});

describe("validation des mots de passe", () => {
  it("accepte une phrase secrète robuste", () => {
    expect(passwordSchema.safeParse("Roman!Solaire2026").success).toBe(true);
  });

  it("refuse les mots de passe faibles", () => {
    expect(passwordSchema.safeParse("motdepasse123").success).toBe(false);
    expect(passwordSchema.safeParse("UniquementDesLettres").success).toBe(false);
  });
});
