// Continuous-line-art globe + paper airplane — hand-drawn-style SVG, no
// filled shapes, uniform brand-blue stroke throughout. Original artwork
// (not a licensed asset) so it can scale/recolor freely.
export default function GlobeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 340"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#3B4FE8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Small orbiting circle, overlapping the globe's top-left rim */}
        <circle cx="210" cy="95" r="24" />

        {/* Globe outline */}
        <circle cx="305" cy="175" r="100" />

        {/* Continent doodles inside the globe */}
        <path d="M250 120 C258 105 270 100 280 112 C286 120 278 126 272 120 C280 130 296 122 300 135 C304 146 292 150 286 142 C296 148 312 140 320 128 C326 118 318 108 326 100 C334 94 344 100 340 112 C337 122 348 130 358 122 C366 116 362 104 372 102" />
        <path d="M275 165 C288 158 300 166 296 178 C308 174 320 182 316 194 C328 192 336 204 326 212 C332 222 322 232 310 226 C308 236 294 240 288 230 C276 234 266 224 272 214 C260 214 254 202 264 196 C258 188 264 176 276 178 C272 170 268 168 275 165 Z" />
        <path d="M345 195 C352 188 364 190 362 200 C370 202 376 212 368 218 C374 226 364 234 356 228 C350 236 338 230 342 220 C334 218 332 206 342 202" />

        {/* Flight trail from the paper airplane, arcing up past the globe */}
        <path d="M188 248 C165 210 175 150 170 100 C168 80 178 65 195 60" strokeDasharray="1 9" />

        {/* Paper airplane */}
        <path d="M60 270 L190 245 L65 330 L100 310 Z" />
        <path d="M100 310 L190 245" />

        {/* Motion lines trailing the airplane */}
        <path d="M30 275 C20 273 12 271 4 269" />
        <path d="M35 295 C24 294 14 293 5 292" />
        <path d="M40 315 C30 316 20 317 10 318" />
      </g>
    </svg>
  );
}
