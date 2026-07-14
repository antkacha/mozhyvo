import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Політика конфіденційності — МОЖUВО",
  description: "Політика конфіденційності платформи МОЖUВО",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
          ← На головну
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-2">Політика конфіденційності</h1>
      <p className="text-sm text-muted mb-10">Останнє оновлення: 14 липня 2026 р.</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-lg font-bold mb-3">1. Загальні положення</h2>
          <p className="text-muted leading-relaxed">
            Платформа МОЖUВО (<strong>mozhyvo.com.ua</strong>) збирає та обробляє персональні дані відповідно до чинного законодавства України та Загального регламенту про захист даних (GDPR). Реєструючись на платформі, ви погоджуєтесь з умовами цієї Політики.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. Які дані ми збираємо</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li><strong>Реєстраційні дані:</strong> ім&apos;я, прізвище, email-адреса, країна, місто.</li>
            <li><strong>Дані профілю:</strong> освіта, мови, навички, інтереси — заповнюються добровільно.</li>
            <li><strong>Дані заявок:</strong> відповіді на форми організацій, CV та портфоліо, якщо ви їх надаєте.</li>
            <li><strong>Технічні дані:</strong> IP-адреса, браузер, дата і час відвідувань — для безпеки та аналітики.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. Як ми використовуємо дані</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Для надання доступу до платформи та персоналізованих рекомендацій.</li>
            <li>Для передачі ваших заявок організаціям, яким ви подаєтесь.</li>
            <li>Для надсилання сповіщень про статус заявок та нові можливості (за вашим вибором).</li>
            <li>Для покращення роботи платформи та усунення технічних проблем.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. Передача даних третім особам</h2>
          <p className="text-muted leading-relaxed">
            Ми не продаємо та не передаємо ваші персональні дані третім особам без вашої згоди, за винятком:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed mt-3">
            <li>Організацій, до яких ви подали заявку — вони отримують лише дані, що ви вказали у формі.</li>
            <li>Технічних підрядників (Supabase для зберігання даних, Resend для email) — виключно для надання послуг платформи.</li>
            <li>Державних органів — лише на вимогу закону.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. Ваші права</h2>
          <p className="text-muted leading-relaxed mb-3">Відповідно до GDPR та законодавства України, ви маєте право:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Переглядати та редагувати свої дані в особистому кабінеті.</li>
            <li>Видалити свій акаунт і всі пов&apos;язані дані — у розділі «Налаштування».</li>
            <li>Відписатися від email-розсилок у будь-який час.</li>
            <li>Надіслати запит на отримання копії своїх даних або їх видалення — на <strong>mozhyvo@gmail.com</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">6. Зберігання та безпека</h2>
          <p className="text-muted leading-relaxed">
            Дані зберігаються на захищених серверах Supabase (EU region). Ми використовуємо шифрування HTTPS, хешування паролів та контроль доступу. Дані видаленого акаунту знищуються протягом 30 днів.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">7. Cookies</h2>
          <p className="text-muted leading-relaxed">
            Платформа використовує технічно необхідні cookies для авторизації. Аналітичні cookies не використовуються.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">8. Контакти</h2>
          <p className="text-muted leading-relaxed">
            З питань захисту даних звертайтесь: <a href="mailto:mozhyvo@gmail.com" className="text-primary hover:underline">mozhyvo@gmail.com</a>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex gap-4 text-sm text-muted">
        <Link href="/terms" className="hover:text-primary transition-colors">Умови використання</Link>
        <Link href="/contacts" className="hover:text-primary transition-colors">Контакти</Link>
      </div>
    </div>
  );
}
