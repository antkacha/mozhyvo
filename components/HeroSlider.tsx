"use client";

// To add more photos: add files to /public/about/slides/ and add entry to the slides array below
import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  { src: "/about/slides/slide1.jpg", caption: "🌷 Нідерланди · молодіжний обмін" },
  { src: "/about/slides/slide2.jpg", caption: "🏆 Іспанія · міжнародний конкурс" },
  { src: "/about/slides/slide3.jpg", caption: "🌆 Амстердам · обмін" },
  { src: "/about/slides/slide4.jpg", caption: "🎉 Міжнародна зустріч" },
  { src: "/about/slides/slide5.jpg", caption: "🏢 Amazon · робочий візит" },
  { src: "/about/slides/slide6.jpg", caption: "🌅 Іспанія · Erasmus+ проєкт" },
  { src: "/about/slides/slide7.jpg", caption: "🏛️ Рим · культурний обмін" },
  { src: "/about/slides/slide8.jpg", caption: "✈️ Міжнародний проєкт" },
  { src: "/about/slides/slide9.jpg", caption: "🌍 Міжнародний обмін" },
  { src: "/about/slides/slide10.jpg", caption: "🎓 Навчання за кордоном" },
  { src: "/about/slides/slide11.jpg", caption: "🤝 Міжнародна співпраця" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl max-h-[480px] aspect-[3/4] w-full">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-[800ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.caption}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 0px, 50vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === current ? "#ffffff" : "rgba(255,255,255,0.4)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
