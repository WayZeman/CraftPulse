import { absoluteUrl } from "@/lib/utils";

export const metadata = {
  title: "Політика конфіденційності",
  alternates: { canonical: absoluteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <article className="container-x prose prose-invert prose-headings:font-display max-w-3xl py-16">
      <h1>Політика конфіденційності</h1>
      <p>Ми поважаємо твою приватність. Збираємо мінімум даних, потрібних для роботи платформи.</p>
      <h2>Які дані ми збираємо</h2>
      <ul>
        <li>OAuth-профіль (email, ім'я, аватар) з Discord чи Google</li>
        <li>Дії на сайті: голоси, відгуки, додані сервери</li>
        <li>Хешовані IP-адреси та user-agent (антифрод)</li>
      </ul>
      <h2>Як ми використовуємо дані</h2>
      <ul>
        <li>Автентифікація та робота сервісу</li>
        <li>Антифрод і безпека</li>
        <li>Сповіщення про твої сервери (за згодою)</li>
      </ul>
      <h2>Контакти</h2>
      <p>З питань конфіденційності: privacy@craftpulse.ua</p>
    </article>
  );
}
