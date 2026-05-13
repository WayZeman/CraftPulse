import { PrismaClient, TagCategory, ServerStatus, ServerEdition, Role } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  { slug: "survival", name: "Survival", color: "#22c55e", category: TagCategory.MODE, icon: "🌲" },
  { slug: "pvp", name: "PvP", color: "#ef4444", category: TagCategory.MODE, icon: "⚔️" },
  { slug: "vanilla", name: "Vanilla", color: "#a3a3a3", category: TagCategory.MODE, icon: "🧊" },
  { slug: "modded", name: "Modded", color: "#8b5cf6", category: TagCategory.MODE, icon: "🧪" },
  { slug: "anarchy", name: "Anarchy", color: "#f97316", category: TagCategory.MODE, icon: "🔥" },
  { slug: "no-donate", name: "No Donate", color: "#06b6d4", category: TagCategory.ECONOMY, icon: "🛡️" },
  { slug: "whitelist", name: "Whitelist", color: "#eab308", category: TagCategory.COMMUNITY, icon: "🔒" },
  { slug: "mini-games", name: "Mini Games", color: "#ec4899", category: TagCategory.GAMEPLAY, icon: "🎮" },
  { slug: "skyblock", name: "SkyBlock", color: "#3b82f6", category: TagCategory.GAMEPLAY, icon: "☁️" },
  { slug: "creative", name: "Creative", color: "#10b981", category: TagCategory.MODE, icon: "🎨" },
  { slug: "roleplay", name: "RolePlay", color: "#f43f5e", category: TagCategory.GAMEPLAY, icon: "🎭" },
  { slug: "economy", name: "Economy", color: "#84cc16", category: TagCategory.ECONOMY, icon: "💰" },
  { slug: "java", name: "Java Edition", color: "#dc2626", category: TagCategory.VERSION, icon: "☕" },
  { slug: "bedrock", name: "Bedrock", color: "#0ea5e9", category: TagCategory.VERSION, icon: "🪨" },
  { slug: "1-21", name: "1.21+", color: "#22c55e", category: TagCategory.VERSION, icon: "🆕" },
  { slug: "1-20", name: "1.20", color: "#16a34a", category: TagCategory.VERSION, icon: "🟢" },
  { slug: "ukrainian", name: "Українські", color: "#FFD700", category: TagCategory.COMMUNITY, icon: "🇺🇦" },
];

const BADGES = [
  { slug: "founder", name: "Founder", description: "One of the first 100 users of CraftPulse", icon: "🌟", color: "#FFD700", rarity: 5 },
  { slug: "verified-owner", name: "Verified Owner", description: "Verified server owner", icon: "✓", color: "#22c55e", rarity: 3 },
  { slug: "top-voter", name: "Top Voter", description: "Cast 100+ votes", icon: "🗳️", color: "#3b82f6", rarity: 2 },
  { slug: "reviewer", name: "Trusted Reviewer", description: "Posted 25+ helpful reviews", icon: "📝", color: "#8b5cf6", rarity: 3 },
  { slug: "patriot", name: "UA Patriot", description: "Supporting Ukrainian Minecraft community", icon: "🇺🇦", color: "#FFD700", rarity: 4 },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log(`✓ ${TAGS.length} tags`);

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }
  console.log(`✓ ${BADGES.length} badges`);

  const owner = await prisma.user.upsert({
    where: { email: "owner@craftpulse.ua" },
    update: { role: Role.OWNER },
    create: {
      email: "owner@craftpulse.ua",
      name: "CraftPulse Team",
      username: "craftpulse",
      role: Role.OWNER,
      bio: "Платформа моніторингу українських Minecraft серверів",
      image: "https://mc-heads.net/avatar/MHF_Steve/128",
    },
  });
  console.log(`✓ Owner user: ${owner.email}`);

  const demoServers = [
    {
      slug: "kozak-craft",
      name: "KozakCraft",
      shortDesc: "Найкращий український survival з економікою та квестами",
      description: "Класичний survival з елементами RPG, унікальною економікою та активною спільнотою. Сервер працює з 2021 року.",
      host: "play.kozakcraft.ua",
      port: 25565,
      logo: "https://mc-heads.net/avatar/MHF_Steve/128",
      tags: ["survival", "ukrainian", "no-donate", "1-21"],
    },
    {
      slug: "trident-ua",
      name: "Trident UA",
      shortDesc: "PvP арена з турнірами та призами",
      description: "Жорсткий PvP сервер з рейтинговою системою, турнірами та клановими війнами.",
      host: "trident-ua.net",
      port: 25565,
      tags: ["pvp", "ukrainian", "1-21"],
    },
    {
      slug: "vanilla-house",
      name: "Vanilla House",
      shortDesc: "Чиста ванілла без донату",
      description: "Чистий ванільний досвід для справжніх поціновувачів. Whitelist та активна спільнота.",
      host: "vh.mc-host.pro",
      port: 25565,
      tags: ["vanilla", "whitelist", "ukrainian", "no-donate"],
    },
    {
      slug: "sky-empires",
      name: "Sky Empires",
      shortDesc: "SkyBlock із унікальними механіками",
      description: "Розвивайте свій острів, торгуйте та підкорюйте небесні землі.",
      host: "skyempires.fun",
      port: 25565,
      tags: ["skyblock", "economy", "1-20"],
    },
    {
      slug: "modded-fortress",
      name: "Modded Fortress",
      shortDesc: "Modded survival з 200+ модами",
      description: "Технологічний modded survival на основі Forge з кастомним модпаком.",
      host: "modded.fortress.gg",
      port: 25565,
      tags: ["modded", "survival", "1-20"],
    },
  ];

  for (const data of demoServers) {
    const { tags: tagSlugs, ...serverData } = data;
    const server = await prisma.server.upsert({
      where: { slug: serverData.slug },
      update: {},
      create: {
        ...serverData,
        ownerId: owner.id,
        status: ServerStatus.APPROVED,
        edition: ServerEdition.JAVA,
        onlinePlayers: Math.floor(Math.random() * 200),
        maxPlayers: 500,
        peakPlayers: Math.floor(Math.random() * 400),
        version: "1.21.4",
        voteCount: Math.floor(Math.random() * 5000),
        reviewCount: Math.floor(Math.random() * 50),
        averageRating: 3.5 + Math.random() * 1.5,
        isOnline: Math.random() > 0.2,
        lastPing: new Date(),
        motd: `§a${serverData.name} §7| §fвітає тебе!\n§eГрай зараз §6→ §c${serverData.host}`,
      },
    });

    for (const slug of tagSlugs) {
      const tag = await prisma.tag.findUnique({ where: { slug } });
      if (tag) {
        await prisma.serverTag.upsert({
          where: { serverId_tagId: { serverId: server.id, tagId: tag.id } },
          update: {},
          create: { serverId: server.id, tagId: tag.id },
        });
      }
    }
  }
  console.log(`✓ ${demoServers.length} demo servers`);

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
