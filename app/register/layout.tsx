import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Реєстрація — МОЖUВО",
  description: "Приєднуйтесь до МОЖUВО — платформи міжнародних можливостей для молоді України.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
