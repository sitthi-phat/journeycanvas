// Deterministic "tidy layout" for a board's presentation layer.
// Pure + framework-agnostic so both the client (measured sizes) and the server
// (estimated sizes) can reuse it. Returns a new nodes array with updated
// position (and grown band width/height). Never moves app-journey / module /
// image nodes — those are left untouched.

// Generous estimates (real cards run wide once the actor row + System + Behaviour
// are shown). Used only when measured sizes aren't available (e.g. server API).
export const ESTIMATE_SIZE = {
  action: { width: 340, height: 250 },
  decision: { width: 190, height: 150 },
  persona: { width: 280, height: 320 },
  actor: { width: 260, height: 160 },
  marker: { width: 250, height: 150 },
  callout: { width: 250, height: 160 },
  cta: { width: 230, height: 76 },
  title: { width: 620, height: 90 },
  phase: { width: 1100, height: 240 },
  stage: { width: 320, height: 600 }
};
const DEFAULT_SIZE = { width: 220, height: 150 };

// layout constants
const GAP_X = 40;
const GAP_Y = 40;
const BAND_GAP = 28;
const LABEL_W = 300;     // left gutter inside a band for its number/label
const SIDE_GAP = 48;     // gap before the side lane (markers/callouts/cta)
const TOP_PAD = 26;      // top inset for the first step row inside a band
const BOTTOM_PAD = 26;
const MIN_BAND_H = 180;
const TITLE_GAP = 24;    // title → cast row
const CAST_GAP = 48;     // cast row → first band (clears tall Persona cards)
const MAX_COLS = 8;      // wrap steps to a new row inside a band beyond this

const STEP_TYPES = ['action', 'decision'];
const CAST_TYPES = ['persona', 'actor'];
const SIDE_TYPES = ['marker', 'callout'];

export function arrangeBoard({ nodes = [], edges = [], measure } = {}) {
  const sizeOf = (n) => {
    const m = typeof measure === 'function' ? measure(n) : null;
    const est = ESTIMATE_SIZE[n.type] || DEFAULT_SIZE;
    const w = (m && m.width) || n.width || est.width;
    const h = (m && m.height) || n.height || est.height;
    return { width: w, height: h };
  };
  const centerY = (n) => (n.position?.y || 0) + sizeOf(n).height / 2;

  const titles = nodes.filter((n) => n.type === 'title');
  const cast = nodes.filter((n) => CAST_TYPES.includes(n.type));
  const phases = nodes.filter((n) => n.type === 'phase');
  const stages = nodes.filter((n) => n.type === 'stage');
  const steps = nodes.filter((n) => STEP_TYPES.includes(n.type));
  const sideItems = nodes.filter((n) => SIDE_TYPES.includes(n.type));
  const ctas = nodes.filter((n) => n.type === 'cta');

  // Nothing to arrange? return as-is.
  if (steps.length === 0 && cast.length === 0 && titles.length === 0) {
    return { nodes };
  }

  const pos = {};            // id → { x, y }
  const sizeOverride = {};   // id → { width, height } (bands/title)

  // ---- common metrics from real/estimated sizes ----
  const maxOf = (arr, dim) => arr.reduce((m, n) => Math.max(m, sizeOf(n)[dim]), 0);
  const maxStepW = Math.max(maxOf(steps, 'width'), 200);
  const maxStepH = Math.max(maxOf(steps, 'height'), 140);
  const colPitch = maxStepW + GAP_X;
  const rowPitch = maxStepH + GAP_Y;

  const sideAll = [...sideItems, ...ctas];
  const maxSideW = Math.max(maxOf(sideAll, 'width'), 0);
  const maxSideH = Math.max(maxOf(sideAll, 'height'), 0);
  const sidePitch = maxSideH + GAP_Y;

  // bands: prefer phase bands; else stages (also laid horizontally for tidiness)
  const bandNodes = (phases.length ? phases : stages).slice().sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
  const hasBands = bandNodes.length > 0;

  // ---- assign steps + side items to a band by current vertical position ----
  const bandOf = (n) => {
    if (!hasBands) return 0;
    const cy = centerY(n);
    let best = 0, bestD = Infinity;
    bandNodes.forEach((b, i) => {
      const top = b.position?.y || 0;
      const bot = top + sizeOf(b).height;
      const d = cy < top ? top - cy : cy > bot ? cy - bot : 0;
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };
  const bandCount = hasBands ? bandNodes.length : 1;
  const stepsByBand = Array.from({ length: bandCount }, () => []);
  const sideByBand = Array.from({ length: bandCount }, () => []);
  steps.slice().sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0) || (a.position?.y || 0) - (b.position?.y || 0))
    .forEach((s) => stepsByBand[bandOf(s)].push(s));
  sideItems.forEach((s) => sideByBand[bandOf(s)].push(s));
  // CTAs go to the last band's side lane
  ctas.forEach((c) => sideByBand[bandCount - 1].push(c));

  // ---- vertical origin: title, then cast row ----
  const titleH = titles.length ? sizeOf(titles[0]).height : 0;
  const castH = cast.length ? maxOf(cast, 'height') : 0;
  const castY = titleH ? titleH + TITLE_GAP : 0;
  let y = (titleH || castH) ? (castY + (castH ? castH + CAST_GAP : 0)) : 0;
  const bandsStartY = y;

  // ---- per-band geometry (pass 1: heights + max width) ----
  const bandGeom = [];
  let globalBandW = 0;
  for (let i = 0; i < bandCount; i++) {
    const cnt = stepsByBand[i].length;
    const rows = Math.max(1, Math.ceil(cnt / MAX_COLS));
    const colsUsed = Math.min(Math.max(cnt, 1), MAX_COLS);
    const stepsContentH = rows * rowPitch - GAP_Y;
    const sideCnt = sideByBand[i].length;
    const sideContentH = sideCnt > 0 ? sideCnt * sidePitch - GAP_Y : 0;
    const h = Math.max(MIN_BAND_H, TOP_PAD + Math.max(stepsContentH, sideContentH) + BOTTOM_PAD);
    const stepsRight = LABEL_W + colsUsed * colPitch - GAP_X;
    const w = (sideCnt > 0)
      ? stepsRight + SIDE_GAP + maxSideW + BOTTOM_PAD
      : stepsRight + BOTTOM_PAD;
    bandGeom.push({ rows, h, stepsRight });
    globalBandW = Math.max(globalBandW, w, ESTIMATE_SIZE.phase.width);
  }

  // ---- place everything (pass 2) ----
  // title
  if (titles.length) {
    pos[titles[0].id] = { x: 0, y: 0 };
    sizeOverride[titles[0].id] = { width: globalBandW, height: titleH };
    // stack any extra titles below (rare)
    for (let i = 1; i < titles.length; i++) pos[titles[i].id] = { x: 0, y: -(i * (titleH + 8)) };
  }
  // cast row (persona first, then actors), left-aligned
  const castOrdered = [
    ...cast.filter((n) => n.type === 'persona'),
    ...cast.filter((n) => n.type === 'actor').sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0))
  ];
  let cx = 0;
  for (const n of castOrdered) {
    pos[n.id] = { x: cx, y: castY };
    cx += sizeOf(n).width + GAP_X;
  }

  // bands
  for (let i = 0; i < bandCount; i++) {
    const g = bandGeom[i];
    const bandY = y;
    if (hasBands) {
      const b = bandNodes[i];
      pos[b.id] = { x: 0, y: bandY };
      sizeOverride[b.id] = { width: globalBandW, height: g.h };
    }
    // steps left-to-right (wrap rows)
    stepsByBand[i].forEach((s, k) => {
      const col = k % MAX_COLS;
      const row = Math.floor(k / MAX_COLS);
      pos[s.id] = { x: LABEL_W + col * colPitch, y: bandY + TOP_PAD + row * rowPitch };
    });
    // side lane (markers/callouts/cta): right-aligned, but never left of THIS band's
    // steps (so markers can't overlap a wide step row)
    const sideX = Math.max(globalBandW - maxSideW - BOTTOM_PAD, g.stepsRight + SIDE_GAP, LABEL_W);
    sideByBand[i].forEach((s, k) => {
      pos[s.id] = { x: sideX, y: bandY + TOP_PAD + k * sidePitch };
    });
    y = bandY + g.h + BAND_GAP;
  }

  // ---- emit new nodes ----
  const outNodes = nodes.map((n) => {
    if (!pos[n.id]) return n;
    const next = { ...n, position: pos[n.id] };
    if (sizeOverride[n.id]) { next.width = sizeOverride[n.id].width; next.height = sizeOverride[n.id].height; }
    return next;
  });
  return { nodes: outNodes };
}
