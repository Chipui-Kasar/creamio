"use client";

import { EQUIPMENT, EQUIPMENT_BY_ID } from "@/data/equipment";
import { SEATING_INFO } from "@/data/shopLayout";
import { useShop } from "@/hooks/useShop";
import type { EquipmentId, Placement } from "@/types";

const M = 54; // margin for dimension lines
const NAVY = "#14304F";
const PINK = "#F96B97";
const TEAL = "#4DB6AC";
const r = (v: number) => Math.round(v * 100) / 100;

interface Scale {
  S: number;
  px: (x: number) => number;
  pz: (z: number) => number;
}

function Item({
  id,
  p,
  sc,
  selected,
  hovered,
  onSelect,
  onHover,
  children,
  numberAt,
}: {
  id: EquipmentId;
  p: Placement;
  sc: Scale;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: EquipmentId) => void;
  onHover: (id: EquipmentId | null) => void;
  children: React.ReactNode;
  numberAt?: [number, number];
}) {
  const spec = EQUIPMENT_BY_ID[id];
  const [nx, nz] = numberAt ?? [0, 0];
  const { S } = sc;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${spec.number}. ${spec.name}`}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(id)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      <g transform={`translate(${r(sc.px(p.x))} ${r(sc.pz(p.z))}) rotate(${r((-p.rotY * 180) / Math.PI)})`}>
        <g
          style={{
            fill: spec.accent,
            fillOpacity: selected ? 0.55 : hovered ? 0.42 : 0.26,
            stroke: selected ? PINK : spec.accent,
            strokeWidth: selected ? 3 : 1.6,
          }}
        >
          {children}
        </g>
        {/* front-edge tick so orientation is readable */}
        <line x1={-p.w * S * 0.18} x2={p.w * S * 0.18} y1={(p.d * S) / 2} y2={(p.d * S) / 2} stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
      </g>
      <g transform={`translate(${r(sc.px(p.x + nx))} ${r(sc.pz(p.z + nz))})`}>
        <circle r={11} fill={selected ? PINK : NAVY} />
        <text textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={700} fill="#fff6e9">
          {spec.number}
        </text>
      </g>
    </g>
  );
}

/** Scale floor plan (SVG) — driven by the same layout as the 3D scene, so it follows the room size. */
export function FloorPlan({ className = "", showLegend = true }: { className?: string; showLegend?: boolean }) {
  const shop = useShop();
  const { selected, hovered, visiCooler, layout: L, tableFolded } = shop;
  const { width: RW, depth: RD, hx, hz } = L.room;
  const S = 470 / Math.max(RW, RD);
  const sc: Scale = { S, px: (x) => (x + hx) * S + M, pz: (z) => (z + hz) * S + M };
  const { px, pz } = sc;
  const VW = RW * S + M * 2;
  const VH = RD * S + M * 2 + 18;
  const rect = (p: { w: number; d: number }, rx = 3) => <rect x={-(p.w * S) / 2} y={-(p.d * S) / 2} width={p.w * S} height={p.d * S} rx={rx} />;
  const P = L.placements;
  const common = (id: EquipmentId) => ({
    id,
    p: P[id],
    sc,
    selected: selected === id,
    hovered: hovered === id,
    onSelect: (i: EquipmentId) => shop.select(i),
    onHover: shop.hover,
  });
  const { prepCounter: pc, serviceBase: sb, door } = L;
  const door0 = door.x - door.width / 2;
  const door1 = door.x + door.width / 2;
  const front = pz(hz);
  const seat = P.seating;
  const aisleW = L.room.width / 2 - L.bx; // aisle spans bx → east wall

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Scale floor plan of the ${RW} by ${RD} foot Creamio shop`} className="h-auto w-full select-none">
        <defs>
          <pattern id="fp-tile" width={S / 2} height={S / 2} patternUnits="userSpaceOnUse">
            <rect width={S / 2} height={S / 2} fill="#e6f4f0" />
            <rect width={S / 4} height={S / 4} fill="#d4ece6" />
            <rect x={S / 4} y={S / 4} width={S / 4} height={S / 4} fill="#d4ece6" />
          </pattern>
          <pattern id="fp-wood" width={S * 2} height={S / 3} patternUnits="userSpaceOnUse">
            <rect width={S * 2} height={S / 3} fill="#f5e6cd" />
            <line x1="0" x2={S * 2} y1={S / 3} y2={S / 3} stroke="#e2c9a4" strokeWidth="1.2" />
            <line x1={S * 0.8} x2={S * 0.8} y1="0" y2={S / 3} stroke="#e2c9a4" strokeWidth="1" />
          </pattern>
          <pattern id="fp-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={TEAL} strokeWidth="1.4" strokeOpacity="0.5" />
          </pattern>
          <marker id="fp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={PINK} />
          </marker>
          <marker id="fp-arrow-t" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2b8f85" />
          </marker>
        </defs>

        <rect width={VW} height={VH} fill="#fff6e9" />

        {/* floors */}
        {L.floors.tile.map((f, i) => (
          <rect key={`t${i}`} x={px(f.x0)} y={pz(f.z0)} width={(f.x1 - f.x0) * S} height={(f.z1 - f.z0) * S} fill="url(#fp-tile)" />
        ))}
        {L.floors.wood.map((f, i) => (
          <rect key={`w${i}`} x={px(f.x0)} y={pz(f.z0)} width={(f.x1 - f.x0) * S} height={(f.z1 - f.z0) * S} fill="url(#fp-wood)" />
        ))}

        {/* staff aisle clearance */}
        <rect x={px(L.bx)} y={pz(L.zAisle)} width={aisleW * S} height={(L.zCounter - L.zAisle) * S} fill="url(#fp-hatch)" opacity={0.55} />
        <text x={px(L.bx + 2)} y={pz(L.zAisle + 1.4)} textAnchor="middle" fontSize={10} fontWeight={700} letterSpacing="0.12em" fill="#1f6f67">
          STAFF AISLE · 2.6 FT
        </text>

        {/* counters (fixed joinery) */}
        <g fill="#f1dfc4" stroke={NAVY} strokeWidth={1.4}>
          <rect x={px(pc.x - pc.w / 2)} y={pz(pc.z - pc.d / 2)} width={pc.w * S} height={pc.d * S} rx={2} />
          <rect x={px(sb.x - sb.w / 2)} y={pz(sb.z - sb.d / 2)} width={sb.w * S} height={sb.d * S} rx={2} />
        </g>
        <text x={px(pc.x)} y={pz(pc.z + 0.68)} textAnchor="middle" fontSize={8.5} fontWeight={600} letterSpacing="0.1em" fill={NAVY} opacity={0.6}>
          PREP COUNTER
        </text>

        {/* walls */}
        <g stroke={NAVY} strokeWidth={9} strokeLinecap="square" fill="none">
          <path d={`M${px(-hx)},${front} V${pz(-hz)} H${px(hx)} V${front}`} />
          <path d={`M${px(-hx)},${front} H${px(door0)}`} />
          <path d={`M${px(door1)},${front} H${px(hx)}`} />
        </g>
        {/* door + swing */}
        <path d={`M${px(door1)},${front} L${px(door1) - door.width * S * 0.5},${front + door.width * S * 0.86}`} stroke={NAVY} strokeWidth={2.2} />
        <path d={`M${px(door0)},${front} A${door.width * S},${door.width * S} 0 0 0 ${px(door1) - door.width * S * 0.5},${front + door.width * S * 0.86}`} fill="none" stroke={NAVY} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
        <text x={px(door.x)} y={front + 28} textAnchor="middle" fontSize={10} fontWeight={700} letterSpacing="0.16em" fill={NAVY}>
          ENTRANCE
        </text>

        {/* equipment */}
        <Item {...common("freezer-400")}>{rect(P["freezer-400"])}</Item>
        <Item {...common("freezer-350")}>{rect(P["freezer-350"])}</Item>
        <Item {...common("stabilizer")}>{rect(P.stabilizer, 2)}</Item>
        <Item {...common("softy")}>{rect(P.softy, 6)}</Item>
        <Item {...common("juicer")}>{rect(P.juicer, 6)}</Item>
        <Item {...common("coffee")}>{rect(P.coffee, 5)}</Item>
        {visiCooler && <Item {...common("visi-cooler")}>{rect(P["visi-cooler"], 3)}</Item>}
        <Item {...common("sink")}>
          {rect(P.sink, 3)}
        </Item>

        {/* glass-top hints on both freezers */}
        {(["freezer-400", "freezer-350"] as const).map((id) => {
          const p = P[id];
          return (
            <g key={id} transform={`translate(${r(px(p.x))} ${r(pz(p.z))}) rotate(${r((-p.rotY * 180) / Math.PI)})`} pointerEvents="none">
              <line x1={0} x2={0} y1={(-p.d * S) / 2 + 4} y2={(p.d * S) / 2 - 4} stroke="#fff" strokeWidth={1.4} opacity={0.85} />
              <rect x={(-p.w * S) / 2 + 4} y={(-p.d * S) / 2 + 4} width={p.w * S - 8} height={p.d * S - 8} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.7} />
            </g>
          );
        })}

        {/* seating */}
        <Item {...common("seating")}>
          {L.seating === "table" ? (
            <>
              <rect x={-1.2 * S} y={-1.2 * S} width={2.4 * S} height={2.4 * S} rx={3} />
              {[
                [0, -1.35],
                [0, 1.35],
                [-1.35, 0],
                [1.35, 0],
              ].map(([cx, cz], i) => (
                <rect key={i} x={(cx - 0.55) * S} y={(cz - 0.55) * S} width={1.1 * S} height={1.1 * S} rx={5} style={{ fillOpacity: 0.5 }} />
              ))}
            </>
          ) : (
            <>
              <rect x={-0.65 * S} y={-2.3 * S} width={tableFolded ? 0.18 * S : 1.3 * S} height={4.6 * S} rx={2} />
              {[-1.74, -0.58, 0.58, 1.74].map((cz) => (
                <circle key={cz} cx={(tableFolded ? -0.1 : 0.95) * S} cy={cz * S} r={0.42 * S} style={{ fillOpacity: 0.5 }} />
              ))}
            </>
          )}
        </Item>
        <text x={px(seat.x + 1.2)} y={pz(seat.z - seat.d / 2 - 0.25)} fontSize={8.5} fontWeight={700} letterSpacing="0.12em" fill={NAVY} opacity={0.55} textAnchor="middle">
          {SEATING_INFO[L.seating].footprint} FT² SEATING
        </text>

        {/* movement arrows */}
        <path d={`M${px(door.x)},${pz(hz - 0.5)} L${px(door.x)},${pz(L.zFront + 0.5)}`} stroke={PINK} strokeWidth={2.2} fill="none" strokeDasharray="2 5" strokeLinecap="round" markerEnd="url(#fp-arrow)" />
        <text x={px(door.x) + 10} y={pz(hz - 1.4)} fontSize={9} fontWeight={700} letterSpacing="0.12em" fill={PINK}>
          CUSTOMERS
        </text>
        <path d={`M${px(L.bx - L.lane / 2 - 0.2)},${pz(L.zFront + 0.4)} C${px(L.bx - L.lane / 2 - 0.2)},${pz(L.zCounter + 0.4)} ${px(L.bx - 0.4)},${pz(L.zAisle + 1.3)} ${px(L.bx + 0.9)},${pz(L.zAisle + 1.3)}`} stroke="#2b8f85" strokeWidth={2.2} fill="none" strokeDasharray="2 5" strokeLinecap="round" markerEnd="url(#fp-arrow-t)" />

        {/* dimensions */}
        <g stroke={NAVY} strokeWidth={1} fill={NAVY} fontSize={11} fontWeight={600}>
          <line x1={px(-hx)} x2={px(hx)} y1={M - 26} y2={M - 26} />
          <line x1={px(-hx)} x2={px(-hx)} y1={M - 32} y2={M - 20} />
          <line x1={px(hx)} x2={px(hx)} y1={M - 32} y2={M - 20} />
          <text x={px(0)} y={M - 32} textAnchor="middle" stroke="none">{`${RW}′ 0″`}</text>
          <line x1={M - 26} x2={M - 26} y1={pz(-hz)} y2={pz(hz)} />
          <line x1={M - 32} x2={M - 20} y1={pz(-hz)} y2={pz(-hz)} />
          <line x1={M - 32} x2={M - 20} y1={pz(hz)} y2={pz(hz)} />
          <text x={M - 34} y={pz(0)} textAnchor="middle" transform={`rotate(-90 ${M - 34} ${pz(0)})`} stroke="none">{`${RD}′ 0″`}</text>
        </g>
        <text x={px(0)} y={M - 8} textAnchor="middle" fontSize={9} letterSpacing="0.22em" fontWeight={700} fill={NAVY} opacity={0.5}>
          BACK WALL
        </text>
      </svg>

      {showLegend && (
        <figcaption className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] leading-tight sm:grid-cols-3">
          {EQUIPMENT.filter((e) => e.id !== "visi-cooler" || visiCooler).map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => shop.select(e.id)}
              onMouseEnter={() => shop.hover(e.id)}
              onMouseLeave={() => shop.hover(null)}
              className="flex items-center gap-2 text-left transition-opacity hover:opacity-70"
            >
              <span className="grid size-5 flex-none place-items-center rounded-full text-[10px] font-bold text-cream" style={{ background: selected === e.id ? PINK : NAVY }}>
                {e.number}
              </span>
              {e.shortName}
            </button>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
