import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-primary/10 mb-2 leading-none">
          404
        </p>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Сторінку не знайдено
        </h1>
        <p className="text-muted mb-8 leading-relaxed">
          Схоже, ця сторінка не існує або була переміщена. Спробуй повернутись
          на головну або переглянути можливості.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200"
          >
            На головну
          </Link>
          <Link
            href="/opportunities"
            className="px-5 py-2.5 rounded-2xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all duration-200"
          >
            Переглянути можливості
          </Link>
        </div>
      </div>
    </div>
  );
}
