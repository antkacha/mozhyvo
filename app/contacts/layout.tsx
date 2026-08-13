import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти — МОЖUВО",
  description: "Зв'яжіться з командою МОЖUВО — відповімо на будь-які питання щодо платформи, партнерства або можливостей.",
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
