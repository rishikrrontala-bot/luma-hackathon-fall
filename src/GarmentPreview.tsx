import { useRef, type PointerEvent } from 'react';
import './garment-preview.css';

/** An illustrated sample garment. It does not imply a photo has been analysed. */
export default function GarmentPreview() {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const node = stage.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.setProperty('--garment-ry', `${Math.max(-1, Math.min(1, x)) * 8}deg`);
      node.style.setProperty('--garment-rx', `${Math.max(-1, Math.min(1, -y)) * 5}deg`);
      frame.current = null;
    });
  }

  function onPointerLeave() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    stage.current?.style.setProperty('--garment-rx', '0deg');
    stage.current?.style.setProperty('--garment-ry', '0deg');
  }

  return (
    <div
      ref={stage}
      className="muslin-garment-preview"
      role="img"
      aria-label="Illustrated charcoal hoodie with fine pit-to-pit and length guides. This is a seeded preview, not an analysed photo."
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="muslin-preview-meta" aria-hidden="true">
        <span>FAVOURITE HOODIE / SAMPLE GARMENT</span>
        <span>ILLUSTRATED PREVIEW</span>
      </div>

      <div className="muslin-garment-float" aria-hidden="true">
        <div className="muslin-garment-model">
          <svg className="muslin-garment-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="gp-left-sleeve" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#616b6d" />
                <stop offset=".27" stopColor="#394447" />
                <stop offset=".68" stopColor="#323b3e" />
                <stop offset="1" stopColor="#596365" />
              </linearGradient>
              <linearGradient id="gp-right-sleeve" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#586366" />
                <stop offset=".32" stopColor="#394346" />
                <stop offset=".73" stopColor="#2c3639" />
                <stop offset="1" stopColor="#515c5f" />
              </linearGradient>
              <linearGradient id="gp-body" x1="0" x2="1" y1="0" y2=".45">
                <stop offset="0" stopColor="#596365" />
                <stop offset=".13" stopColor="#424c4f" />
                <stop offset=".5" stopColor="#343e41" />
                <stop offset=".82" stopColor="#3d474a" />
                <stop offset="1" stopColor="#596265" />
              </linearGradient>
              <linearGradient id="gp-hood" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#707a7b" />
                <stop offset=".45" stopColor="#424c4f" />
                <stop offset="1" stopColor="#252e31" />
              </linearGradient>
              <linearGradient id="gp-pocket" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#515c5e" />
                <stop offset=".35" stopColor="#3b4548" />
                <stop offset="1" stopColor="#303a3d" />
              </linearGradient>
              <linearGradient id="gp-rib" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#485255" />
                <stop offset="1" stopColor="#242d30" />
              </linearGradient>
              <radialGradient id="gp-body-light" cx=".42" cy=".2" r=".75">
                <stop offset="0" stopColor="#a4ada9" stopOpacity=".18" />
                <stop offset=".5" stopColor="#ffffff" stopOpacity=".02" />
                <stop offset="1" stopColor="#11191b" stopOpacity=".16" />
              </radialGradient>
              <filter id="gp-shadow" x="-35%" y="-35%" width="170%" height="190%">
                <feDropShadow dx="1" dy="18" stdDeviation="17" floodColor="#26302f" floodOpacity=".22" />
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#162021" floodOpacity=".25" />
              </filter>
              <filter id="gp-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <pattern id="gp-knit" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M0 0 L4 4 M-2 2 L2 6" stroke="#d7dfda" strokeOpacity=".09" strokeWidth=".35" />
              </pattern>
              <clipPath id="gp-body-clip">
                <path d="M272 152 Q303 139 341 137 L459 137 Q497 139 528 152 L541 210 Q537 258 549 395 Q404 418 251 395 Q263 259 259 210 Z" />
              </clipPath>
            </defs>

            <g filter="url(#gp-shadow)">
              {/* A dark underlay gives the hem, sleeves and hood visible thickness as the model tilts. */}
              <path d="M262 157 L188 176 Q149 209 82 281 L116 317 Q167 277 215 249 L261 234 Z" fill="#202a2d" transform="translate(0 6)" />
              <path d="M538 157 L612 176 Q651 209 718 281 L684 317 Q633 277 585 249 L539 234 Z" fill="#202a2d" transform="translate(0 6)" />
              <path d="M263 158 L190 176 Q158 201 96 268 L126 305 Q172 271 216 239 L263 225 Z" fill="url(#gp-left-sleeve)" stroke="#384346" strokeWidth="2" />
              <path d="M537 158 L610 176 Q642 201 704 268 L674 305 Q628 271 584 239 L537 225 Z" fill="url(#gp-right-sleeve)" stroke="#303b3e" strokeWidth="2" />
              <path d="M108 280 Q119 295 134 303 L117 322 Q104 313 91 298 Z" fill="url(#gp-rib)" stroke="#2d383a" strokeWidth="2" />
              <path d="M692 280 Q681 295 666 303 L683 322 Q696 313 709 298 Z" fill="url(#gp-rib)" stroke="#2d383a" strokeWidth="2" />
              <path d="M107 294 L123 312 M112 290 L129 307 M688 294 L677 310 M693 291 L682 306" stroke="#b9c3be" strokeOpacity=".16" strokeWidth="1" />
              <path d="M212 189 Q186 225 134 274 M227 203 Q204 236 159 270 M587 188 Q615 227 667 274 M573 205 Q594 236 643 270" fill="none" stroke="#a6b0ad" strokeOpacity=".18" strokeWidth="3" />
              <path d="M177 205 Q201 221 216 239 M623 204 Q600 221 584 239" fill="none" stroke="#171f21" strokeOpacity=".2" strokeWidth="6" filter="url(#gp-soft)" />

              <path d="M314 150 Q313 99 347 73 Q371 55 399 61 Q431 56 454 73 Q486 99 486 151 L455 172 L345 172 Z" fill="url(#gp-hood)" stroke="#2e383b" strokeWidth="2" />
              <path d="M337 141 Q336 93 366 80 Q382 71 400 76 Q419 70 435 81 Q465 96 463 141 Q445 159 400 165 Q355 159 337 141 Z" fill="#1d272a" stroke="#657072" strokeOpacity=".72" strokeWidth="2" />
              <path d="M345 135 Q354 107 371 91 Q385 82 400 84 Q415 82 430 91 Q448 107 455 135 Q438 148 400 154 Q362 148 345 135 Z" fill="#2b3437" />
              <path d="M349 106 Q349 77 374 68 M451 106 Q451 77 426 68" fill="none" stroke="#c3ccc6" strokeOpacity=".17" strokeWidth="3" />
              <path d="M337 137 Q362 163 400 165 Q438 163 463 137" fill="none" stroke="#aab4b0" strokeOpacity=".26" strokeWidth="2" />

              <path d="M272 152 Q303 139 341 137 L459 137 Q497 139 528 152 L541 210 Q537 258 549 395 Q404 418 251 395 Q263 259 259 210 Z" fill="url(#gp-body)" stroke="#2b3538" strokeWidth="2.5" />
              <path d="M272 152 Q303 139 341 137 L459 137 Q497 139 528 152 L541 210 Q537 258 549 395 Q404 418 251 395 Q263 259 259 210 Z" fill="url(#gp-body-light)" />
              <g clipPath="url(#gp-body-clip)">
                <path d="M254 149 Q296 188 296 242 Q301 334 279 401 M546 149 Q504 188 504 242 Q499 334 521 401" fill="none" stroke="#131c1e" strokeOpacity=".2" strokeWidth="16" filter="url(#gp-soft)" />
                <path d="M302 172 Q333 235 319 330 M489 170 Q468 228 482 322" fill="none" stroke="#aeb9b4" strokeOpacity=".13" strokeWidth="9" filter="url(#gp-soft)" />
                <path d="M358 170 Q345 214 354 261 M447 173 Q460 224 449 271" fill="none" stroke="#d4dcd4" strokeOpacity=".11" strokeWidth="5" filter="url(#gp-soft)" />
                <path d="M271 295 Q309 284 340 297 M465 292 Q500 283 536 297" fill="none" stroke="#172124" strokeOpacity=".18" strokeWidth="7" filter="url(#gp-soft)" />
                <path d="M274 155 Q313 174 343 170 M526 155 Q487 174 457 170" fill="none" stroke="#c4cfca" strokeOpacity=".15" strokeWidth="2" />
                <path d="M0 0 H800 V500 H0Z" fill="url(#gp-knit)" opacity=".7" />
              </g>
              <path d="M333 138 Q357 167 400 174 Q443 167 467 138 Q454 163 444 177 Q423 186 400 185 Q377 186 356 177 Q346 163 333 138 Z" fill="#4d5759" stroke="#2a3437" strokeWidth="2" />
              <path d="M337 143 Q361 171 400 177 Q439 171 463 143" fill="none" stroke="#aab5af" strokeOpacity=".36" strokeWidth="2" />
              <path d="M368 170 Q360 197 362 229 M432 170 Q440 197 438 229" fill="none" stroke="#c7d0c9" strokeOpacity=".56" strokeWidth="2" strokeLinecap="round" />
              <circle cx="368" cy="169" r="3" fill="#1d2628" stroke="#9aa6a1" strokeWidth="1" />
              <circle cx="432" cy="169" r="3" fill="#1d2628" stroke="#9aa6a1" strokeWidth="1" />
              <path d="M361 224 L363 236 M437 224 L439 236" stroke="#a4aea9" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
              <path d="M336 288 Q400 279 464 288 L479 360 Q401 371 321 360 Z" fill="url(#gp-pocket)" stroke="#626e6e" strokeOpacity=".7" strokeWidth="2" />
              <path d="M336 288 Q355 323 327 355 M464 288 Q445 323 473 355" fill="none" stroke="#20292b" strokeWidth="10" strokeOpacity=".45" filter="url(#gp-soft)" />
              <path d="M339 293 L325 353 M461 293 L475 353 M322 360 Q401 370 478 360" fill="none" stroke="#9ca9a4" strokeOpacity=".27" strokeWidth="1.4" />
              <path d="M253 389 Q402 405 547 389 L551 421 Q401 438 249 421 Z" fill="url(#gp-rib)" stroke="#273235" strokeWidth="2" />
              <path d="M257 398 Q402 414 544 398" fill="none" stroke="#aeb9b1" strokeOpacity=".32" strokeWidth="1.6" />
              <path d="M272 409 V426 M286 411 V428 M300 412 V429 M314 414 V430 M328 415 V430 M342 416 V432 M356 417 V432 M370 418 V433 M384 419 V433 M398 420 V433 M412 419 V433 M426 418 V433 M440 417 V432 M454 416 V431 M468 415 V431 M482 414 V430 M496 412 V429 M510 411 V428 M524 409 V426" stroke="#b7c0b8" strokeOpacity=".16" strokeWidth="1" />
              <path d="M263 162 Q250 190 259 220 M537 162 Q550 190 541 220" fill="none" stroke="#c4cfc8" strokeOpacity=".28" strokeWidth="2.2" />
            </g>
          </svg>
        </div>
      </div>

      <svg className="muslin-preview-guides" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g fill="none" stroke="#e9f2e9" strokeWidth="1.35" strokeLinecap="square">
          <path d="M267 259 H532" strokeDasharray="3 3" />
          <path d="M267 249 V269 M532 249 V269" />
        </g>
        <g fill="none" stroke="#334044" strokeWidth="1.25" strokeLinecap="square" opacity=".78">
          <path d="M575 165 V416" />
          <path d="M565 165 H585 M565 416 H585" />
        </g>
        <circle cx="267" cy="259" r="2.5" fill="#e9f2e9" />
        <circle cx="532" cy="259" r="2.5" fill="#e9f2e9" />
        <text x="400" y="249" textAnchor="middle" fill="#f4f7f0" fontSize="10" fontFamily="Martian Mono, monospace" letterSpacing="1.2">PIT TO PIT</text>
        <text x="596" y="293" fill="#334044" fontSize="10" fontFamily="Martian Mono, monospace" letterSpacing="1.2" transform="rotate(90 596 293)">LENGTH</text>
      </svg>
      <span className="muslin-preview-instruction" aria-hidden="true">MOVE TO INSPECT / 3D VIEW</span>
    </div>
  );
}
