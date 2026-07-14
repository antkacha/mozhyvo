import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Умови використання — Моживо",
  description: "Умови використання платформи Моживо",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
          ← На головну
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-2">Умови використання</h1>
      <p className="text-sm text-muted mb-10">Останнє оновлення: 14 липня 2026 р.</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-lg font-bold mb-3">1. Прийняття умов</h2>
          <p className="text-muted leading-relaxed">
            Реєструючись або використовуючи платформу МОЖUВО (<strong>mozhyvo.com.ua</strong>), ви погоджуєтесь дотримуватись цих Умов використання. Якщо ви не погоджуєтесь, будь ласка, не використовуйте платформу.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. Опис платформи</h2>
          <p className="text-muted leading-relaxed">
            МОЖUВО — це безкоштовна інформаційна платформа, яка агрегує міжнародні можливості (стипендії, стажування, волонтерство, обміни) та дозволяє організаціям публікувати свої програми. МОЖUВО не є роботодавцем, організатором програм або грантодавцем і не несе відповідальності за рішення, прийняті організаціями щодо заявників.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. Реєстрація та акаунт</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Для реєстрації необхідно вказати достовірні дані.</li>
            <li>Ви несете відповідальність за збереження пароля та будь-які дії у вашому акаунті.</li>
            <li>Один акаунт — одна особа. Заборонено реєструватись від імені іншої людини.</li>
            <li>Ми залишаємо за собою право заблокувати акаунт, який порушує ці умови.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. Правила використання</h2>
          <p className="text-muted leading-relaxed mb-3">На платформі заборонено:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Публікувати неправдиву, оманливу або шахрайську інформацію.</li>
            <li>Розміщувати контент, що пропагує насильство, дискримінацію або незаконну діяльність.</li>
            <li>Використовувати платформу для збору персональних даних користувачів без їхньої згоди.</li>
            <li>Здійснювати автоматизований збір даних (scraping) без дозволу.</li>
            <li>Перешкоджати нормальній роботі платформи.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. Правила для організацій</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
            <li>Організації проходять верифікацію перед публікацією програм.</li>
            <li>Опубліковані можливості повинні відповідати дійсності на момент публікації.</li>
            <li>Організація зобов&apos;язана відповідати заявникам та повідомляти про зміни статусу їхніх заявок.</li>
            <li>МОЖUВО залишає за собою право видалити будь-яку публікацію без пояснень.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">6. Обмеження відповідальності</h2>
          <p className="text-muted leading-relaxed">
            МОЖUВО надає платформу «як є» і не гарантує точність інформації, опублікованої організаціями. Ми не несемо відповідальності за будь-які збитки, що виникли внаслідок використання платформи або результатів розгляду заявок.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">7. Інтелектуальна власність</h2>
          <p className="text-muted leading-relaxed">
            Весь контент платформи (дизайн, тексти, логотипи) є власністю МОЖUВО. Контент організацій та користувачів залишається їхньою власністю — розміщуючи його, вони надають МОЖUВО невиключну ліцензію на відображення.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">8. Зміни умов</h2>
          <p className="text-muted leading-relaxed">
            Ми можемо оновлювати ці Умови. Про суттєві зміни повідомлятимемо на email або через сповіщення на платформі. Продовження використання після змін означає їх прийняття.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">9. Контакти</h2>
          <p className="text-muted leading-relaxed">
            Питання щодо умов:{" "}
            <a href="mailto:mozhyvo@gmail.com" className="text-primary hover:underline">
              mozhyvo@gmail.com
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex gap-4 text-sm text-muted">
        <Link href="/privacy" className="hover:text-primary transition-colors">Політика конфіденційності</Link>
        <Link href="/contacts" className="hover:text-primary transition-colors">Контакти</Link>
      </div>
    </div>
  );
}
