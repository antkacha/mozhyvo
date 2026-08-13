// Continuous-line-art globe + paper airplane — hand-drawn-style SVG, no
// filled shapes, uniform brand-blue stroke throughout. Original artwork
// (not a licensed asset) so it can scale/recolor freely.
export default function GlobeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 545"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#2436E0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Small orbiting circle, top-left */}
        <circle cx="192" cy="133" r="21" />

        {/* Big orbit circle, mostly hidden behind the globe */}
        <circle cx="195" cy="218" r="148" />

        {/* Globe outline — deep overlap with the orbit circle */}
        <circle cx="300" cy="225" r="125" />

        {/* Continent doodles inside the globe */}
        <path d="M210 155 C202 168 192 180 194 196 C195 208 206 214 212 205 C216 198 210 192 206 198 C203 204 210 214 220 210 C228 207 226 198 232 192 C238 186 248 190 244 200 C241 208 230 212 234 222 C237 230 248 228 252 236" />
        <path d="M262 145 C270 138 268 128 258 130 C250 132 252 142 260 140 C268 138 266 126 276 126 C284 126 284 136 292 138 C300 140 304 130 298 124 C294 120 288 124 290 132 C292 140 304 144 310 136 C314 130 310 122 318 124 C326 126 324 138 332 140 C338 142 342 134 338 128" />
        <path d="M325 150 C332 156 342 152 342 162 C342 170 332 172 334 180 C336 188 348 186 352 178 C356 170 366 174 368 184 C370 192 362 198 368 206 C373 213 383 206 380 197" />
        <path d="M380 200 C390 206 398 200 394 192" />
        <path d="M252 240 C265 232 280 236 282 250 C283 258 275 262 270 256 C266 251 272 246 278 250 C286 255 286 268 276 272 C268 275 264 266 258 270 C252 274 256 284 264 286 C272 288 276 280 284 284 C290 287 288 296 280 298 C272 300 266 292 258 296 C250 300 252 310 260 314 C266 317 272 312 270 320" />

        {/* Flight trail from the paper airplane, hugging the orbit circle's left rim up to the small circle */}
        <path d="M145 396 C95 340 75 270 85 200 C92 150 125 105 160 90" strokeDasharray="1 10" />

        {/* Paper airplane */}
        <path d="M78 362 L250 390 L145 425 Z" />
        <path d="M145 425 L250 390" />
        <path d="M145 425 L115 368" />
        <path d="M145 425 L165 495 L138 430 Z" />
      </g>
    </svg>
  );
}
