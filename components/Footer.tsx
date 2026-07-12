import Link from "next/link";
import Image from "next/image";

const platformLinks = [
  { label: "Можливості",       href: "/opportunities" },
  { label: "Для організацій",  href: "/organizations" },
  { label: "Про нас",          href: "/about" },
  { label: "Контакти",         href: "/contacts" },
];

const resourceLinks = [
  { label: "Email розсилка",  href: "/#newsletter" },
  { label: "Увійти",          href: "/login" },
  { label: "Зареєструватись", href: "/register" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/mozhyvo",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/mozhyvo/about/",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Linktree",
    href: "https://linktr.ee/mozhyvo",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
        <path d="M13.511 5.853l4.005-4.117 2.317 2.395-4.2 4.2h5.872v3.35h-5.892l4.22 4.2-2.337 2.358-5.566-5.566-5.566 5.566-2.337-2.358 4.22-4.2H2.372v-3.35h5.872l-4.2-4.2 2.317-2.395 4.005 4.117V0h3.145v5.853zm-3.145 9.829h3.145V24h-3.145v-8.318z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary mt-20 relative overflow-hidden">
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand — spans 2 cols on lg */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href="/" className="group w-fit">
              <Image src="/logo.png" alt="Моживо" width={120} height={40} className="h-8 w-auto brightness-0 invert group-hover:opacity-80 transition-opacity" />
            </Link>

            <p className="text-sm text-white/55 leading-relaxed max-w-sm">
              Платформа можливостей для молоді України. Гранти, стипендії, стажування та програми обміну — все в одному місці, безкоштовно.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-1">
              Платформа
            </p>
            {platformLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-1">
              Ресурси
            </p>
            {resourceLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © 2026 Моживо. Зроблено в Україні 🇺🇦
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-white/35 hover:text-white/70 transition-colors">
              Конфіденційність
            </Link>
            <Link href="/terms" className="text-xs text-white/35 hover:text-white/70 transition-colors">
              Умови використання
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
