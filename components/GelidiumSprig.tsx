import { TIDE_COLORS } from "@/lib/soak-dry-colors";

// 石花菜的樣子：扁平直立、成叢生長，枝條像羽毛一樣左右互生分岔（一般高約
// 10 到 30 公分）。這裡用程式長出一叢——主枝往上，兩側互生出一級小枝，小枝
// 再長出更短的二級小枝。顏色是剛採上岸的棕紅（七泡七曬的第 2 階）。
//
// 用固定種子的亂數，伺服器跟瀏覽器算出來的形狀一模一樣，不會有 hydration 落差；
// 每一株看起來不規則，但每次載入都是同一叢。

type Branch = { d: string; order: 0 | 1 | 2; delay: number; duration: number };

const COLOR = TIDE_COLORS[1];
const WIDTH: Record<Branch["order"], number> = { 0: 2.4, 1: 1.5, 2: 0.9 };
const GROW: Record<Branch["order"], number> = { 0: 1.5, 1: 0.6, 2: 0.4 };
const STEP = 5;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function grow(
  out: Branch[],
  rand: () => number,
  x: number,
  y: number,
  heading: number,
  length: number,
  order: Branch["order"],
  delay: number,
  curl = 0
) {
  const points: [number, number][] = [[x, y]];
  const steps = Math.max(2, Math.round(length / STEP));
  // 小枝出枝後會慢慢往上彎回主枝的方向（curl），再加一點晃動，不會是直線。
  const bend = curl + (rand() - 0.5) * 0.02;
  let h = heading;
  let px = x;
  let py = y;
  const sides: { t: number; x: number; y: number; h: number }[] = [];

  for (let i = 1; i <= steps; i++) {
    h += bend + (rand() - 0.5) * 0.06;
    px += Math.sin(h) * STEP;
    py -= Math.cos(h) * STEP;
    points.push([px, py]);
    sides.push({ t: i / steps, x: px, y: py, h });
  }

  out.push({
    d: points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(""),
    order,
    delay,
    duration: GROW[order],
  });

  if (order === 2) return;

  // 互生：左右輪流出枝，下面先不出（主枝基部是光的），越往梢越短。
  const spacing = order === 0 ? 2 : 1;
  const startAt = order === 0 ? 0.2 : 0.15;
  let side = rand() < 0.5 ? -1 : 1;
  for (let i = 0; i < sides.length; i += spacing) {
    const s = sides[i];
    if (s.t < startAt || s.t > 0.94) continue;
    const childLength =
      length * (order === 0 ? 0.34 : 0.3) * (1 - s.t * 0.7) * (0.8 + rand() * 0.4);
    if (childLength < 4) continue;
    // 分岔角度收窄：石花菜的小枝是斜斜往上長的羽狀，不是橫向張開的樹枝。
    const angle = side * (0.55 + rand() * 0.25);
    grow(
      out,
      rand,
      s.x,
      s.y,
      s.h + angle,
      childLength,
      (order + 1) as 1 | 2,
      delay + s.t * GROW[order],
      -side * (order === 0 ? 0.035 : 0.05)
    );
    side = -side;
  }
}

function buildTuft(seed: number): Branch[] {
  const rand = mulberry32(seed);
  const out: Branch[] = [];
  // 叢生：同一個基部長出四根主枝，長短、方向都不一樣。
  const fronds = [
    { heading: -0.26, length: 155 },
    { heading: 0.03, length: 190 },
    { heading: 0.3, length: 135 },
    { heading: -0.08, length: 110 },
  ];
  fronds.forEach((f, i) => grow(out, rand, 100 + (i - 1.5) * 3, 232, f.heading, f.length, 0, i * 0.18));
  return out;
}

const TUFT = buildTuft(20261028);

export default function GelidiumSprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true">
      <g className="gelidium-sway" fill="none" stroke={COLOR} strokeLinecap="round" strokeLinejoin="round">
        {TUFT.map((b, i) => (
          <path
            key={i}
            d={b.d}
            pathLength={1}
            strokeWidth={WIDTH[b.order]}
            className="gelidium-path"
            style={
              {
                "--delay": `${b.delay.toFixed(2)}s`,
                "--dur": `${b.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  );
}
