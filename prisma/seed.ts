import { PrismaClient, PublicationStatus, Role } from "@prisma/client";
import argon2 from "argon2";

const db = new PrismaClient();

const novels = [
  { title: "Lord of the Mysteries", slug: "lord-of-the-mysteries", author: "Cuttlefish That Loves Diving", country: "Chine", language: "Chinois", chapters: 1432, status: PublicationStatus.COMPLETED, genres: ["Mystère", "Fantasy", "Aventure"], cover: "photo-1518709268805-4e9042af9f23", synopsis: "Dans un monde de vapeur et d'occultisme, Klein Moretti gravit les séquences d'un pouvoir aussi fascinant que dangereux." },
  { title: "Omniscient Reader's Viewpoint", slug: "omniscient-readers-viewpoint", author: "Sing Shong", country: "Corée du Sud", language: "Coréen", chapters: 551, status: PublicationStatus.COMPLETED, genres: ["Action", "Fantasy", "Apocalypse"], cover: "photo-1519608487953-e999c86e7455", synopsis: "Le roman que Dokja est seul à avoir terminé devient soudain la réalité." },
  { title: "The Beginning After the End", slug: "the-beginning-after-the-end", author: "TurtleMe", country: "États-Unis", language: "Anglais", chapters: 520, status: PublicationStatus.ONGOING, genres: ["Action", "Réincarnation", "Fantasy"], cover: "photo-1518709594023-6eab9bab7b23", synopsis: "Un roi renaît dans un monde de magie et tente de vivre une seconde vie plus humaine." },
  { title: "Shadow Slave", slug: "shadow-slave", author: "Guiltythree", country: "Russie", language: "Anglais", chapters: 2480, status: PublicationStatus.ONGOING, genres: ["Dark Fantasy", "Action", "Survie"], cover: "photo-1500530855697-b586d89ba3ee", synopsis: "Sunny reçoit un pouvoir divin accompagné d'un défaut potentiellement mortel." },
  { title: "Re:Zero", slug: "re-zero", author: "Tappei Nagatsuki", country: "Japon", language: "Japonais", chapters: 720, status: PublicationStatus.ONGOING, genres: ["Isekai", "Drame", "Fantasy"], cover: "photo-1497250681960-ef046c08a56e", synopsis: "Transporté dans un autre monde, Subaru découvre qu'il peut revenir après la mort." },
  { title: "The Legendary Mechanic", slug: "the-legendary-mechanic", author: "Chocolion", country: "Chine", language: "Chinois", chapters: 1463, status: PublicationStatus.COMPLETED, genres: ["Science-fiction", "Action", "Jeu"], cover: "photo-1518770660439-4636190af475", synopsis: "Un joueur se réveille dans son jeu favori, des années avant son lancement public." },
];

async function main() {
  for (const item of novels) {
    const author = await db.author.upsert({
      where: { slug: item.author.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-") },
      update: {},
      create: { name: item.author, slug: item.author.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-") },
    });
    const genres = await Promise.all(item.genres.map((name) => {
      const slug = name.toLowerCase().normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(/[^a-z0-9]+/g, "-");
      return db.genre.upsert({ where: { slug }, update: {}, create: { name, slug } });
    }));
    await db.novel.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title, slug: item.slug, authorId: author.id, country: item.country,
        language: item.language, chapterCount: item.chapters, publicationStatus: item.status,
        synopsis: item.synopsis, alternativeTitles: [],
        coverUrl: `https://images.unsplash.com/${item.cover}?auto=format&fit=crop&w=600&q=80`,
        genres: { connect: genres.map(({ id }) => ({ id })) },
      },
    });
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: { role: Role.ADMIN, usernameKey: "administrateur" },
      create: {
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        name: "Administrateur",
        usernameKey: "administrateur",
        role: Role.ADMIN,
        emailVerified: new Date(),
        passwordHash: await argon2.hash(process.env.ADMIN_PASSWORD, { type: argon2.argon2id }),
      },
    });
  }
}

main().finally(() => db.$disconnect());
