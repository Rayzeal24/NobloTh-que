import { PrismaClient, PublicationStatus } from "@prisma/client";

const db = new PrismaClient();

const novels = [
  {
    title: "The Perfect Run",
    slug: "the-perfect-run",
    author: "Maxime J. Durand",
    country: "France",
    language: "Anglais",
    chapterCount: 131,
    coverUrl: "/the-perfect-run.jpg",
    genres: ["Science-fiction", "Super-héros", "Boucle temporelle", "Comédie"],
    synopsis: "Ryan Romano, surnommé Quicksave, peut créer un point de sauvegarde dans le temps et revenir à la vie après sa mort. À New Rome, il recommence encore et encore jusqu’à obtenir enfin la boucle parfaite.",
  },
  {
    title: "Omniscient Reader's Viewpoint",
    slug: "omniscient-readers-viewpoint",
    author: "Sing Shong",
    country: "Corée du Sud",
    language: "Coréen",
    chapterCount: 551,
    coverUrl: "/omniscient-readers-viewpoint.jpg",
    genres: ["Action", "Fantasy", "Apocalypse", "Métafiction"],
    synopsis: "Kim Dokja est le seul lecteur à avoir terminé un roman obscur. Lorsque son intrigue devient soudainement la réalité, sa connaissance de l’histoire devient sa meilleure chance de survie.",
  },
  {
    title: "The Legendary Mechanic",
    slug: "the-legendary-mechanic",
    author: "Qi Peijia",
    country: "Chine",
    language: "Chinois",
    chapterCount: 1463,
    coverUrl: "/the-legendary-mechanic.jpg",
    genres: ["Science-fiction", "Action", "Jeu", "Réincarnation"],
    synopsis: "Han Xiao se réveille dans le monde de son jeu favori avant son lancement public. Devenu un PNJ doté de l’interface des joueurs, il choisit la voie du mécanicien et prépare l’arrivée des véritables joueurs.",
  },
  {
    title: "Warlock of the Magus World",
    slug: "warlock-of-the-magus-world",
    author: "The Plagiarist",
    country: "Chine",
    language: "Chinois",
    chapterCount: 1200,
    coverUrl: "/warlock-magus-world.jpg",
    genres: ["Dark Fantasy", "Aventure", "Magie", "Réincarnation"],
    synopsis: "Un scientifique renaît dans un monde de magie avec une puce d’intelligence artificielle fusionnée à son âme. Froid et méthodique, Leylin poursuit la connaissance et le pouvoir jusqu’aux limites du monde des mages.",
  },
  {
    title: "Throne of Magical Arcana",
    slug: "throne-of-magical-arcana",
    author: "Cuttlefish That Loves Diving",
    country: "Chine",
    language: "Chinois",
    chapterCount: 910,
    coverUrl: "/throne-magical-arcana.jpg",
    genres: ["Fantasy", "Mystère", "Magie", "Science"],
    synopsis: "Transporté dans un monde où l’Église combat les sorciers, Lucien utilise les connaissances scientifiques de son ancienne vie pour explorer les lois de la magie et bouleverser l’Arcane.",
  },
  {
    title: "Release That Witch",
    slug: "release-that-witch",
    author: "Er Mu",
    country: "Chine",
    language: "Chinois",
    chapterCount: 1498,
    coverUrl: "/release-that-witch.jpg",
    genres: ["Fantasy", "Isekai", "Construction de royaume", "Magie"],
    synopsis: "Un ingénieur moderne se réveille dans le corps du prince Roland. Avec l’aide de femmes considérées comme des sorcières, il transforme un territoire pauvre grâce à la science et défie l’ordre médiéval.",
  },
  {
    title: "Coiling Dragon",
    slug: "coiling-dragon",
    author: "I Eat Tomatoes",
    country: "Chine",
    language: "Chinois",
    chapterCount: 807,
    coverUrl: "/coiling-dragon.webp",
    genres: ["Xianxia", "Fantasy", "Aventure", "Cultivation"],
    synopsis: "Linley Baruch, héritier d’un clan déchu de Guerriers Dragonblood, découvre un anneau mystérieux et entreprend un long voyage de magie, de cultivation et de conquête à travers les plans de l’univers.",
  },
] as const;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
}

async function main() {
  for (const item of novels) {
    const authorSlug = slugify(item.author);
    const author = await db.author.upsert({
      where: { slug: authorSlug },
      update: { name: item.author },
      create: { name: item.author, slug: authorSlug },
    });
    const genres = await Promise.all(item.genres.map((name) => {
      const slug = slugify(name);
      return db.genre.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    }));
    await db.novel.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        coverUrl: item.coverUrl,
        synopsis: item.synopsis,
        country: item.country,
        language: item.language,
        chapterCount: item.chapterCount,
        publicationStatus: PublicationStatus.COMPLETED,
        authorId: author.id,
        genres: { set: genres.map(({ id }) => ({ id })) },
      },
      create: {
        title: item.title,
        slug: item.slug,
        alternativeTitles: [],
        coverUrl: item.coverUrl,
        synopsis: item.synopsis,
        country: item.country,
        language: item.language,
        chapterCount: item.chapterCount,
        publicationStatus: PublicationStatus.COMPLETED,
        authorId: author.id,
        genres: { connect: genres.map(({ id }) => ({ id })) },
      },
    });
  }
  console.log(`${novels.length} romans ajoutés ou mis à jour.`);
}

main().finally(() => db.$disconnect());
