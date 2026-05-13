export const APP_NAME = "CraftPulse";
export const APP_TAGLINE = "Український Minecraft Server Hub";
export const APP_DESCRIPTION =
  "Платформа моніторингу українських Minecraft серверів. Знаходь, голосуй, додавай свій сервер. Реальний онлайн, статистика, рейтинги.";

export const KEYWORDS = [
  "minecraft сервери",
  "моніторинг minecraft",
  "українські сервери minecraft",
  "minecraft ua",
  "minecraft monitoring",
  "топ minecraft серверів",
  "craftpulse",
];

export const NAV_LINKS = [
  { href: "/", label: "Головна" },
  { href: "/servers", label: "Каталог" },
  { href: "/leaderboard", label: "Рейтинг" },
  { href: "/tags", label: "Категорії" },
  { href: "/about", label: "Про нас" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/servers", label: "Каталог серверів" },
    { href: "/leaderboard", label: "Топ сервери" },
    { href: "/tags", label: "Категорії" },
    { href: "/servers/add", label: "Додати сервер" },
  ],
  resources: [
    { href: "/help", label: "Центр допомоги" },
    { href: "/docs", label: "Документація" },
    { href: "/blog", label: "Блог" },
    { href: "/api", label: "API" },
  ],
  legal: [
    { href: "/terms", label: "Умови" },
    { href: "/privacy", label: "Конфіденційність" },
    { href: "/dmca", label: "DMCA" },
    { href: "/contact", label: "Контакти" },
  ],
};

export const MC_VERSIONS = [
  "1.21.4", "1.21.3", "1.21.1", "1.21",
  "1.20.6", "1.20.4", "1.20.2", "1.20.1", "1.20",
  "1.19.4", "1.19.3", "1.19.2",
  "1.18.2", "1.17.1", "1.16.5", "1.12.2", "1.8.9",
];

export const SORT_OPTIONS = [
  { value: "votes", label: "Топ голосів" },
  { value: "online", label: "Найбільший онлайн" },
  { value: "new", label: "Найновіші" },
  { value: "trending", label: "У тренді" },
  { value: "rating", label: "Найкращий рейтинг" },
] as const;
