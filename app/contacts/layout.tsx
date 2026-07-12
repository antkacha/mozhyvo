import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти — Моживо",
  description: "Зв'яжіться з командою Моживо — відповімо на будь-які питання щодо платформи, партнерства або можливостей.",
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
