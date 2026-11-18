import type { MenuItem } from "@/types";

/**
 * Illustrated product art in the brand palette — used until real photography is
 * dropped in (set `photo` on an item in data/menu.ts).
 */
const N = "#14304F";
const T = "#4DB6AC";
const P = "#F96B97";
const C = "#FFF6E9";
const G = "#E6B56A";

function Shadow({ cx = 200, cy = 356, rx = 120 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.08} fill={N} opacity={0.14} />;
}

function Scoops() {
  return (
    <>
      <Shadow />
      {/* wafer */}
      <g transform="rotate(-18 120 150)">
        <rect x="96" y="60" width="44" height="110" rx="4" fill={G} stroke="#c58f3e" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M96 ${80 + i * 20} H140 M${106 + i * 9} 60 V170`} stroke="#c58f3e" strokeWidth="1.4" opacity={0.7} />
        ))}
      </g>
      {/* scoops */}
      <circle cx="262" cy="170" r="54" fill="#7a4a30" />
      <path d="M215 160 q20 22 40 6 q18 18 52 -4" fill="none" stroke="#3d2216" strokeWidth="7" strokeLinecap="round" opacity={0.7} />
      <circle cx="172" cy="196" r="62" fill="#ff8fb0" />
      <circle cx="148" cy="176" r="12" fill="#ffb9cd" opacity={0.7} />
      <circle cx="258" cy="214" r="50" fill="#fbe7b4" />
      <path d="M180 210 q-4 40 -10 56" stroke="#d9223f" strokeWidth="10" strokeLinecap="round" fill="none" opacity={0.9} />
      {/* wooden spoon */}
      <g transform="rotate(24 318 150)">
        <ellipse cx="318" cy="96" rx="24" ry="34" fill="#d9a46a" />
        <rect x="311" y="120" width="14" height="120" rx="6" fill="#d9a46a" />
      </g>
      {/* cup */}
      <path d="M92 236 h216 l-24 108 q-2 10 -14 10 h-140 q-12 0 -14 -10 z" fill={N} />
      <rect x="84" y="226" width="232" height="16" rx="8" fill={C} />
      <circle cx="200" cy="296" r="22" fill="none" stroke={T} strokeWidth="4" />
      <path d="M186 296 q14 -18 28 0 q-14 22 -28 0z" fill={P} />
    </>
  );
}

function Softy() {
  return (
    <>
      <Shadow />
      <path d="M142 214 H258 L200 352 Z" fill={G} stroke="#c58f3e" strokeWidth="3" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${150 + i * 20} 214 L${200 - 20 + i * 10} 340 M${250 - i * 20} 214 L${200 + 20 - i * 10} 340`} stroke="#c58f3e" strokeWidth="2" opacity={0.55} />
      ))}
      <ellipse cx="200" cy="214" rx="64" ry="14" fill="#d79a4a" />
      {/* twisted swirl: alternating pink / cream layers */}
      <path d="M130 208 q70 22 140 0 q10 -34 -20 -50 q-50 18 -100 0 q-30 16 -20 50z" fill={P} />
      <path d="M142 168 q58 22 116 0 q6 -32 -20 -44 q-38 14 -76 0 q-26 12 -20 44z" fill="#ffd0de" />
      <path d="M156 130 q44 18 88 0 q4 -30 -18 -40 q-26 10 -52 0 q-22 10 -18 40z" fill={P} />
      <path d="M172 92 q28 12 56 0 q2 -24 -14 -36 q-6 -14 -2 -26 q-24 22 -34 30 q-10 12 -6 32z" fill="#ffd0de" />
      <path d="M150 196 q40 10 90 -4" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity={0.5} fill="none" />
      <circle cx="284" cy="118" r="5" fill={T} />
      <circle cx="108" cy="156" r="5" fill={G} />
      <circle cx="298" cy="188" r="4" fill={P} />
    </>
  );
}

function Juice() {
  return (
    <>
      <Shadow rx={110} />
      {/* oranges */}
      <circle cx="96" cy="318" r="38" fill="#f39a2d" />
      <circle cx="84" cy="304" r="9" fill="#fbc067" opacity={0.7} />
      <g transform="translate(318 322)">
        <circle r="38" fill="#f39a2d" />
        <circle r="30" fill="#fff0cf" />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M0 0 L${Math.cos((i / 9) * 6.283) * 28} ${Math.sin((i / 9) * 6.283) * 28} A28 28 0 0 1 ${Math.cos(((i + 0.82) / 9) * 6.283) * 28} ${Math.sin(((i + 0.82) / 9) * 6.283) * 28}Z`} fill="#ffb44a" />
        ))}
      </g>
      {/* glass */}
      <path d="M128 78 h144 l-16 270 q-1 10 -12 10 h-88 q-11 0 -12 -10 z" fill="#ffffff" opacity={0.5} stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <path d="M134 128 h132 l-12 218 q-1 8 -10 8 h-88 q-9 0 -10 -8 z" fill="#ff9d2e" />
      <path d="M134 128 h132 l-1 14 q-30 -8 -64 0 q-34 8 -67 0z" fill="#ffc15a" />
      <rect x="150" y="160" width="40" height="40" rx="8" fill="#fff" opacity={0.5} transform="rotate(-12 170 180)" />
      <rect x="206" y="196" width="36" height="36" rx="8" fill="#fff" opacity={0.45} transform="rotate(14 224 214)" />
      <path d="M152 100 q-2 120 8 230" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity={0.55} fill="none" />
      {/* straw */}
      <path d="M224 40 L232 250" stroke={P} strokeWidth="10" strokeLinecap="round" />
      <path d="M224 40 L252 28" stroke={P} strokeWidth="10" strokeLinecap="round" />
      {/* slice on rim */}
      <g transform="translate(268 90) rotate(20)">
        <circle r="34" fill="#f39a2d" />
        <circle r="27" fill="#fff0cf" />
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M0 0 L${Math.cos((i / 8) * 6.283) * 25} ${Math.sin((i / 8) * 6.283) * 25} A25 25 0 0 1 ${Math.cos(((i + 0.8) / 8) * 6.283) * 25} ${Math.sin(((i + 0.8) / 8) * 6.283) * 25}Z`} fill="#ffb44a" />
        ))}
      </g>
    </>
  );
}

function Shake() {
  return (
    <>
      <Shadow rx={100} />
      <path d="M130 120 h140 l-12 228 q-1 10 -12 10 h-92 q-11 0 -12 -10 z" fill="#ffe3ea" stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <path d="M134 150 h132 l-10 196 q-1 8 -10 8 h-92 q-9 0 -10 -8 z" fill="#ffa9c3" />
      <path d="M134 150 q66 -26 132 0 l-2 14 q-64 -22 -128 0z" fill="#fff" opacity={0.7} />
      <path d="M150 170 q-2 90 6 160" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity={0.6} fill="none" />
      {/* cream */}
      <path d="M124 124 q4 -40 36 -44 q8 -30 40 -30 q34 0 42 30 q32 4 36 44 q-76 20 -154 0z" fill="#fff6e9" stroke={N} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M160 86 q40 -14 80 0 M150 106 q50 -14 100 0" stroke="#f0d9be" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* chocolate drizzle */}
      <path d="M156 112 q20 18 24 -4 q18 22 22 -2 q20 20 26 -2 q16 14 20 0" stroke="#6b3f2a" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* cherry */}
      <circle cx="200" cy="48" r="17" fill="#d9223f" />
      <path d="M200 32 q8 -20 28 -22" stroke="#4a9a52" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="194" cy="42" r="4" fill="#fff" opacity={0.7} />
      {/* straw */}
      <path d="M244 60 L262 250" stroke={T} strokeWidth="10" strokeLinecap="round" />
      <path d="M244 60 L270 40" stroke={T} strokeWidth="10" strokeLinecap="round" />
    </>
  );
}

function Coffee() {
  return (
    <>
      <Shadow rx={130} />
      {/* steam */}
      {[170, 206, 242].map((x, i) => (
        <path key={x} d={`M${x} 110 q-14 -18 0 -36 q14 -18 0 -36`} stroke={N} strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.28 - i * 0.04} />
      ))}
      {/* saucer */}
      <ellipse cx="200" cy="334" rx="136" ry="22" fill={C} stroke={N} strokeWidth="3" />
      <ellipse cx="200" cy="330" rx="100" ry="14" fill="#efe1c9" />
      {/* cup */}
      <path d="M96 166 h208 q-2 100 -50 148 q-10 10 -24 10 h-60 q-14 0 -24 -10 q-48 -48 -50 -148z" fill={C} stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <path d="M304 190 q58 -6 54 36 q-4 36 -58 38" fill="none" stroke={N} strokeWidth="14" strokeLinecap="round" />
      <path d="M304 190 q58 -6 54 36 q-4 36 -58 38" fill="none" stroke={C} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="200" cy="166" rx="104" ry="20" fill="#8a5a3c" stroke={N} strokeWidth="3" />
      <ellipse cx="200" cy="166" rx="90" ry="14" fill="#c99467" />
      {/* latte heart */}
      <path d="M200 178 q-26 -10 -20 -22 q8 -10 20 2 q12 -12 20 -2 q6 12 -20 22z" fill="#fff6e9" />
      {/* brand stripe */}
      <path d="M110 224 h180" stroke={T} strokeWidth="10" opacity={0.9} />
      <path d="M118 244 h164" stroke={P} strokeWidth="6" opacity={0.9} />
      {/* beans */}
      {[[62, 344, 20], [88, 358, -30], [330, 350, 40]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <ellipse rx="13" ry="9" fill="#5b3a28" />
          <path d="M-11 0 q11 -6 22 0" stroke="#2f1d14" strokeWidth="2" fill="none" />
        </g>
      ))}
    </>
  );
}

function Cold() {
  return (
    <>
      <Shadow rx={130} />
      {/* ice */}
      {[[70, 330, -12], [338, 336, 16], [310, 306, -6]].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="34" height="34" rx="7" fill="#e8f8fb" stroke="#9fd2dc" strokeWidth="2" transform={`rotate(${r} ${x + 17} ${y + 17})`} />
      ))}
      {/* bottle */}
      <path d="M120 150 q-22 14 -22 52 v138 q0 14 14 14 h72 q14 0 14 -14 v-138 q0 -38 -22 -52 v-40 h-56z" fill="#ffc2d5" stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <rect x="116" y="84" width="64" height="28" rx="6" fill={N} />
      <rect x="98" y="214" width="100" height="84" fill={C} />
      <path d="M118 256 q30 -26 60 0 q-30 26 -60 0z" fill={P} />
      <path d="M112 170 q-4 70 4 150" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity={0.6} fill="none" />
      {/* can */}
      <path d="M232 112 h92 q8 0 8 8 v222 q0 14 -14 14 h-80 q-14 0 -14 -14 v-222 q0 -8 8 -8z" fill={T} stroke={N} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="278" cy="112" rx="46" ry="9" fill="#bfe6df" stroke={N} strokeWidth="3" />
      <circle cx="278" cy="226" r="34" fill={C} />
      <path d="M262 226 q16 -22 32 0 q-16 24 -32 0z" fill={P} />
      <path d="M244 140 q-3 100 4 190" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity={0.5} fill="none" />
      {/* droplets */}
      {[[120, 300], [168, 322], [296, 300], [252, 330]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q-5 8 0 12 q5 -4 0 -12z`} fill="#fff" opacity={0.8} />
      ))}
    </>
  );
}

const ART = { scoops: Scoops, softy: Softy, juice: Juice, shake: Shake, coffee: Coffee, cold: Cold } as const;

export function MenuArt({ kind, title }: { kind: MenuItem["art"]; title: string }) {
  const Art = ART[kind];
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={`Illustration: ${title}`} className="h-full w-full">
      <Art />
    </svg>
  );
}
