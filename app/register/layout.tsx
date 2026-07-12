import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Реєстрація — Моживо",
  description: "Приєднуйтесь до Моживо — платформи міжнародних можливостей для молоді України.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
