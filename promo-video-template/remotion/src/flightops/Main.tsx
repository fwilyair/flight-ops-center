import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Caption } from '../aifl/Caption';
import { FlashCut } from '../aifl/FlashCut';
import { PaperTitleCard } from '../aifl/PaperTitleCard';
import { PageCam, type CamKey } from '../aifl/live/PageCam';

const SERIF = '"Songti SC", "STSong", Georgia, serif';
const SANS = '"PingFang SC", "Noto Sans SC", system-ui, sans-serif';
const MONO = '"Roboto Mono", "SFMono-Regular", Menlo, monospace';
const INK = 'oklch(18% 0.018 240)';
const INK2 = 'oklch(48% 0.02 235)';
const BLUE = 'oklch(50% 0.13 235)';
const CYAN = 'oklch(56% 0.12 205)';
const PAPER = 'oklch(97.5% 0.012 225)';
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const SHOTS = {
  morning: { from: 0, duration: 220 },
  card1: { from: 220, duration: 55 },
  table: { from: 275, duration: 190 },
  macro: { from: 465, duration: 100 },
  card2: { from: 565, duration: 55 },
  chart: { from: 620, duration: 105 },
  cardWbr: { from: 725, duration: 50 },
  wbr: { from: 775, duration: 110 },
  card3: { from: 885, duration: 55 },
  outro: { from: 940, duration: 145 },
} as const;

export const TOTAL = 1085;

const Texture: React.FC<{ src: string; style?: React.CSSProperties; opacity?: number }> = ({
  src,
  style,
  opacity = 1,
}) => (
  <Img
    src={staticFile(`textures/live/${src}`)}
    style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, opacity, ...style }}
  />
);

const BrandHero: React.FC = () => {
  const frame = useCurrentFrame();
  const wordmark = 'Flight Ops Center';
  const kicker = '航班运行中心 · FLIGHT OPERATIONS';
  const vDraw = interpolate(frame, [0, 9], [100, 0], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const hDraw = interpolate(frame, [8, 18], [100, 0], { ...CLAMP, easing: Easing.linear });
  const crossFade = interpolate(frame, [24, 34], [1, 0], CLAMP);
  const kickChars = Math.floor(Math.max(0, frame - 28) / 0.55);
  const brandOut = interpolate(frame, [76, 83], [0, 1], { ...CLAMP, easing: Easing.bezier(0.4, 0, 0.5, 1) });
  const macroIn = interpolate(frame, [82, 90], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const rise = interpolate(frame, [130, 140], [0, 1], { ...CLAMP, easing: Easing.bezier(0.2, 1.25, 0.3, 1) });
  const reseat = interpolate(frame, [194, 212], [0, 1], { ...CLAMP, easing: Easing.bezier(0.4, 0, 0.3, 1.05) });
  const lift = rise * (1 - reseat);
  const z = 110 * lift + Math.sin(((frame - 140) / 40) * Math.PI * 2) * 4 * lift;
  const beam1 = interpolate(frame, [142, 156], [0, 1], CLAMP);
  const beam2 = interpolate(frame, [162, 182], [0, 1], CLAMP);
  const beamOn = (frame >= 141 && frame <= 157) || (frame >= 161 && frame <= 183);
  const hero = { x: 435, y: 282.5, w: 250, h: 36 };
  const keys: CamKey[] = [
    { frame: 82, cx: 960, cy: 540, zoom: 0.78, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
    { frame: 114, cx: 960, cy: 540, zoom: 0.78, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
    { frame: 130, cx: 530, cy: 300, zoom: 1.72, rotX: 8, rotY: 30, rotZ: 2, persp: 1200 },
    { frame: 220, cx: 530, cy: 300, zoom: 1.72, rotX: 8, rotY: 30, rotZ: 2, persp: 1200 },
  ];
  const spotX = interpolate(frame, [86, 90, 98, 104, 110, 130], [25, 25, 70, 42, 28, 50], CLAMP);
  const spotY = interpolate(frame, [86, 90, 98, 104, 110, 130], [30, 30, 45, 60, 31, 50], CLAMP);
  const pool = interpolate(frame, [104, 114, 130], [620, 420, 330], CLAMP);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {frame >= 82 ? (
        <AbsoluteFill style={{ opacity: macroIn }}>
          <PageCam src="textures/live/overview-current.png" pageH={1080} keys={keys} ease={Easing.bezier(0.35, 0, 0.2, 1)}>
            <div
              style={{
                position: 'absolute',
                left: hero.x - 3,
                top: hero.y - 3,
                width: hero.w + 6,
                height: hero.h + 6,
                borderRadius: 18,
                background: 'rgba(248,250,252,.96)',
                border: `2px solid ${BLUE}`,
                opacity: lift,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: hero.x,
                top: hero.y,
                width: hero.w,
                height: hero.h,
                borderRadius: 18,
                overflow: 'hidden',
                transform: `translateZ(${z}px)`,
                boxShadow: lift > 0 ? `0 ${8 * lift}px ${20 + 20 * lift}px rgba(15,23,42,.2),0 ${44 * lift}px ${90 * lift}px rgba(2,132,199,.18)` : 'none',
                transformStyle: 'preserve-3d',
              }}
            >
              <Img src={staticFile('textures/live/task-capsule-landing.png')} style={{ width: '100%', height: '100%' }} />
              {beamOn ? (
                <svg width={hero.w} height={hero.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                  <rect
                    x={2}
                    y={2}
                    width={hero.w - 4}
                    height={hero.h - 4}
                    rx={16}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    pathLength={1}
                    strokeDasharray="0.14 1"
                    strokeDashoffset={-((frame < 160 ? beam1 : beam2))}
                    style={{ filter: 'drop-shadow(0 0 7px rgba(56,189,248,.8))' }}
                  />
                </svg>
              ) : null}
            </div>
          </PageCam>
          <AbsoluteFill
            style={{
              background: `radial-gradient(${pool}px ${pool * 0.8}px at ${spotX}% ${spotY}%,rgba(255,255,255,.22),rgba(15,23,42,.46) 100%)`,
              pointerEvents: 'none',
            }}
          />
        </AbsoluteFill>
      ) : null}

      {brandOut < 1 ? (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: 1 - brandOut }}>
          <div style={{ textAlign: 'center', transform: `translateY(${-40 * brandOut}px) scale(${1 - 0.12 * brandOut})` }}>
            <svg width={64} height={64} viewBox="0 0 64 64" style={{ marginBottom: 34, opacity: crossFade }}>
              <line x1={32} y1={2} x2={32} y2={62} stroke={BLUE} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={vDraw} />
              <line x1={2} y1={32} x2={62} y2={32} stroke={BLUE} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} />
            </svg>
            <div style={{ display: 'inline-flex', fontFamily: SERIF, fontSize: 124, fontWeight: 600, color: INK, letterSpacing: '-.02em' }}>
              {wordmark.split('').map((ch, i) => {
                const t = interpolate(frame, [10 + i * 1.5, 22 + i * 1.5], [0, 1], { ...CLAMP, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
                return (
                  <span key={i} style={{ opacity: t, transform: `scale(${1.6 - 0.6 * t})`, filter: `blur(${(1 - t) * 6}px)`, whiteSpace: 'pre' }}>
                    {ch}
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 30, height: 42, font: `700 32px ${MONO}`, letterSpacing: '.1em', color: INK2 }}>
              {kicker.slice(0, kickChars)}
              <span style={{ display: 'inline-block', width: 12, height: 24, marginLeft: 4, background: BLUE, opacity: frame < 74 && Math.floor(frame / 2) % 2 === 0 ? 0.85 : 0 }} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

type DealAsset = {
  kind: 'page-tile' | 'task';
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
};

// 25 exact crops of the real overview page plus one real task capsule. Every
// tile lands on the coordinates it was cut from, so the accelerating deal
// literally reconstructs the product page instead of inventing a card grid.
const DEAL_ASSETS: DealAsset[] = [
  ...Array.from({ length: 25 }, (_, i) => ({
    kind: 'page-tile' as const,
    x: (i % 5) * 384,
    y: Math.floor(i / 5) * 216,
    w: 384,
    h: 216,
    rot: ((i * 7) % 5) - 2,
  })),
  { kind: 'task' as const, x: 435, y: 282.5, w: 250, h: 36, rot: 1 },
];

const DeckAndSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const revealUi = interpolate(frame, [108, 124], [0, 1], { ...CLAMP, easing: Easing.out(Easing.quad) });
  const typed = Math.max(0, Math.min(6, Math.floor((frame - 128) / 3) + 1));
  const result = interpolate(frame, [149, 160], [0, 1], CLAMP);
  const scaleSwap = interpolate(frame, [166, 174], [0, 1], CLAMP);
  const pileX = 1440;
  const pileY = 245;
  const orbit = interpolate(frame, [0, 34], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.quad) });
  const pull = interpolate(frame, [34, 62], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const boardScale = 1.9 - orbit * 0.06 - pull * 0.84;
  const boardRotX = 44 - pull * 36;
  const boardRotY = -28 + orbit * 54 - pull * 26;
  const scrollY = interpolate(frame, [62, 82, 98, 113, 124], [0, -80, -180, -180, 0], {
    ...CLAMP,
    easing: Easing.bezier(0.33, 0, 0.15, 1),
  });

  return (
    <AbsoluteFill style={{ background: '#232831', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `perspective(1250px) translateY(${scrollY}px) rotateX(${boardRotX}deg) rotateY(${boardRotY}deg) scale(${boardScale})`,
          transformOrigin: `${pileX}px ${pileY}px`,
          opacity: 1 - revealUi,
          background: 'radial-gradient(900px 650px at 75% 25%,rgba(56,189,248,.15),transparent 65%),linear-gradient(115deg,#262b33,#171b22)',
        }}
      >
        <Texture
          src="overview-current.png"
          opacity={interpolate(frame, [34, 56], [0, 0.9], CLAMP)}
          style={{ filter: 'saturate(.72) brightness(.92)' }}
        />
        {DEAL_ASSETS.map((asset, i) => {
          const cue = 36 + 4 * i - 0.0792 * i * (i - 1);
          const flight = interpolate(frame, [cue, cue + 8], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.2, 1) });
          const settle = interpolate(frame, [cue + 8, cue + 12], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.25, 1.15) });
          const dx = (pileX - asset.x) * (1 - flight);
          const dy = (pileY - asset.y) * (1 - flight);
          const arc = Math.sin(flight * Math.PI) * 90;
          const z = (90 - i * 7) * (1 - flight) + arc + 40 * (1 - settle);
          return (
            <div
              key={`${asset.kind}-${i}`}
              style={{
                position: 'absolute',
                left: asset.x,
                top: asset.y,
                width: asset.w,
                height: asset.h,
                borderRadius: frame >= cue + 12 ? 0 : 16,
                overflow: 'hidden',
                transform: `translate3d(${dx}px,${dy}px,${z}px) rotate(${asset.rot * (2 - flight)}deg) scale(${1 + Math.sin(flight * Math.PI) * 0.06})`,
                boxShadow: frame >= cue + 12 ? '0 3px 10px rgba(0,0,0,.16)' : '0 35px 70px rgba(0,0,0,.38)',
                border: frame >= cue + 12 ? '0 solid transparent' : '1px solid rgba(255,255,255,.5)',
              }}
            >
              {asset.kind === 'task' ? (
                <Img src={staticFile('textures/live/task-capsule-landing.png')} style={{ width: '100%', height: '100%' }} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${staticFile('textures/live/overview-current.png')})`,
                    backgroundSize: '1920px 1080px',
                    backgroundPosition: `-${asset.x}px -${asset.y}px`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <AbsoluteFill style={{ opacity: revealUi, background: PAPER }}>
        <Texture src="overview-current.png" opacity={1 - result} />
        <Texture src="search-mu5206.png" opacity={result * (1 - scaleSwap)} />
        <Texture src="scale-30.png" opacity={scaleSwap} />
        <div
          style={{
            position: 'absolute',
            left: 1348,
            top: 8,
            width: 238,
            height: 42,
            borderRadius: 10,
            padding: '7px 12px',
            boxSizing: 'border-box',
            background: '#fff',
            border: `2px solid ${BLUE}`,
            color: INK,
            font: `700 32px ${MONO}`,
            opacity: interpolate(frame, [122, 128, 154, 162], [0, 1, 1, 0], CLAMP),
          }}
        >
          {'MU5206'.slice(0, typed)}
          <span style={{ display: 'inline-block', width: 2, height: 22, marginLeft: 3, background: BLUE, opacity: frame % 8 < 5 ? 1 : 0 }} />
        </div>
        {[0, 1].map((i) => {
          const t = interpolate(frame, [176 + i * 3, 186 + i * 3], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
          const r = 14 + t * (i ? 78 : 54);
          return <div key={i} style={{ position: 'absolute', left: 1455 - r, top: 30 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `2px solid ${BLUE}`, opacity: 1 - t }} />;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LIFE_ROWS = [
  { x: 198, y: 224, w: 356, h: 42 },
  { x: 66, y: 298, w: 198, h: 44 },
  { x: 66, y: 363, w: 210, h: 44 },
  { x: 66, y: 428, w: 210, h: 44 },
  { x: 66, y: 493, w: 210, h: 44 },
  { x: 66, y: 558, w: 210, h: 44 },
];

const LifecycleEmbed: React.FC = () => {
  const frame = useCurrentFrame();
  const modal = staticFile('textures/live/task-detail-modal.png');
  const pan = interpolate(frame, [0, 75], [0, -34], { ...CLAMP, easing: Easing.bezier(0.33, 0, 0.15, 1) });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Texture src="overview-current.png" style={{ filter: 'brightness(.72) saturate(.8)' }} />
      <div style={{ position: 'absolute', left: 610, top: 190 + pan, width: 700, height: 700, borderRadius: 18, overflow: 'hidden', backgroundImage: `url(${modal})`, backgroundSize: '700px 700px', boxShadow: '0 34px 90px rgba(15,23,42,.3)' }}>
        {LIFE_ROWS.map((row, i) => {
          const cue = 12 + i * 9;
          const p = interpolate(frame, [cue, cue + 12], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.25, 1) });
          const air = 1 - p;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: row.x - 5,
                  top: row.y - 3,
                  width: row.w + 10,
                  height: row.h + 6,
                  borderRadius: 10,
                  background: '#fff',
                  opacity: interpolate(frame, [cue + 12, cue + 14], [1, 0], CLAMP),
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: row.x,
                  top: row.y,
                  width: row.w,
                  height: row.h,
                  borderRadius: 9,
                  backgroundImage: `url(${modal})`,
                  backgroundSize: '700px 700px',
                  backgroundPosition: `-${row.x}px -${row.y}px`,
                  opacity: interpolate(frame, [cue, cue + 3], [0, 1], CLAMP),
                  transform: `perspective(900px) translateY(${-120 * air}px) rotateX(${16 * air}deg) scale(${1.06 - 0.06 * p})`,
                  boxShadow: `0 ${30 * air}px ${60 * air}px rgba(15,23,42,${0.22 * air})`,
                }}
              />
              <div style={{ position: 'absolute', left: row.x + row.w * air / 2, top: row.y + row.h - 2, width: row.w * p, height: 2, background: BLUE, opacity: interpolate(frame, [cue + 10, cue + 18], [1, 0], CLAMP) }} />
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const VIEW_CARDS = [
  { file: 'overview-current.png', crop: '50% 16%', label: '运行总览' },
  { file: 'search-mu5206.png', crop: '50% 18%', label: '航班搜索' },
  { file: 'scale-30.png', crop: '50% 20%', label: '时间刻度' },
  { file: 'flight-detail.png', crop: '90% 45%', label: '航班详情' },
  { file: 'task-detail.png', crop: '50% 50%', label: '任务生命周期' },
];

const ViewStack: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [18, 30, 42, 54, 66];
  const settledCount = cues.filter((c) => frame >= c + 22).length;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(1100px 760px at 50% 40%,#fff,#edf7fb 74%)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 285, top: 118, width: 1180, height: 840 }}>
        {VIEW_CARDS.map((card, i) => {
          const t = interpolate(frame, [cues[i], cues[i] + 22], [0, 1], { ...CLAMP, easing: Easing.bezier(0.45, 0.05, 0.25, 1.12) });
          if (t <= 0) return null;
          const y = i * 150;
          const laterPress = i < 4 ? interpolate(frame, [cues[i + 1], cues[i + 1] + 4, cues[i + 1] + 8], [0, 6, 0], CLAMP) : 0;
          return (
            <div
              key={card.file}
              style={{
                position: 'absolute',
                left: i % 2 ? 90 : 0,
                top: y,
                width: 1104,
                height: 225,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#fff',
                transform: `translateY(${600 * (1 - t) + laterPress}px) rotate(${(i % 2 ? -2 : 2) * (1 - t)}deg) scale(${1.06 - 0.06 * t})`,
                boxShadow: t >= 0.999 ? '0 3px 12px rgba(15,23,42,.10)' : '0 32px 64px rgba(15,23,42,.24)',
                border: '1px solid rgba(148,163,184,.28)',
              }}
            >
              <Img src={staticFile(`textures/live/${card.file}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: card.crop }} />
              <div style={{ position: 'absolute', left: 24, top: 20, padding: '9px 16px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: '1px solid rgba(2,132,199,.28)', color: INK, font: `700 32px ${SANS}`, boxShadow: '0 6px 18px rgba(15,23,42,.12)' }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', right: 110, top: 82, textAlign: 'right' }}>
        <div style={{ font: `700 32px ${MONO}`, letterSpacing: '.10em', color: INK2 }}>OPERATING VIEWS</div>
        <div style={{ marginTop: 8, font: `600 104px ${SERIF}`, color: BLUE }}>{settledCount}</div>
        <div style={{ font: `700 32px ${MONO}`, letterSpacing: '.08em', color: INK2 }}>一条运行链路</div>
      </div>
    </AbsoluteFill>
  );
};

const BLOCKS = [
  { x: 1544, y: 155, w: 330, h: 46 },
  { x: 1544, y: 210, w: 330, h: 58 },
  { x: 1544, y: 274, w: 330, h: 58 },
  { x: 1544, y: 338, w: 330, h: 76 },
  { x: 1544, y: 430, w: 330, h: 58 },
  { x: 1544, y: 500, w: 330, h: 58 },
  { x: 1544, y: 575, w: 330, h: 80 },
  { x: 1544, y: 670, w: 330, h: 90 },
];

const RemarksReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const keys: CamKey[] = [
    { frame: 0, cx: 1700, cy: 315, zoom: 1.5 },
    { frame: 22, cx: 1700, cy: 330, zoom: 1.44 },
    { frame: 64, cx: 960, cy: 540, zoom: 1 },
    { frame: 102, cx: 960, cy: 540, zoom: 0.995 },
  ];
  const editorIn = interpolate(frame, [58, 70], [0, 1], { ...CLAMP, easing: Easing.bezier(0.2, 1.15, 0.3, 1) });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <PageCam src="textures/live/flight-detail.png" pageH={1080} keys={keys}>
        {BLOCKS.map((block, i) => {
          const cue = 6 + Math.floor(i / 2) * 7;
          const cover = interpolate(frame, [cue, cue + 8], [1, 0], { ...CLAMP, easing: Easing.bezier(0.4, 0, 0.6, 1) });
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: block.x + block.w * (1 - cover), top: block.y, width: block.w * cover, height: block.h, background: '#fdfcfa' }} />
              {cover > 0 && cover < 1 ? <div style={{ position: 'absolute', left: block.x + block.w * (1 - cover), top: block.y + 4, width: 2, height: Math.min(24, block.h - 8), background: BLUE }} /> : null}
            </React.Fragment>
          );
        })}
      </PageCam>
      <Img
        src={staticFile('textures/live/remarks-editor.png')}
        style={{
          position: 'absolute',
          left: 665,
          top: 585,
          width: 590,
          height: 326,
          objectFit: 'cover',
          borderRadius: 18,
          border: '1px solid rgba(148,163,184,.38)',
          boxShadow: '0 28px 68px rgba(15,23,42,.24)',
          opacity: editorIn,
          transform: `translateY(${(1 - editorIn) * -44}px) scale(${0.97 + editorIn * 0.03})`,
        }}
      />
    </AbsoluteFill>
  );
};

type OutroAsset = {
  file: string;
  w: number;
  h: number;
  cx: number;
  cy: number;
  scale: number;
  rot: number;
  dx: number;
  dy: number;
  cue: number;
};

const OUTRO_ASSETS: OutroAsset[] = [
  { file: 'overview-current.png', w: 620, h: 349, cx: 960, cy: 150, scale: 0.58, rot: 0, dx: 0, dy: -260, cue: 4 },
  { file: 'flight-card-mu5206.png', w: 300, h: 230, cx: 290, cy: 390, scale: 0.82, rot: -5, dx: -480, dy: 0, cue: 7 },
  { file: 'task-capsule-landing.png', w: 500, h: 72, cx: 1560, cy: 340, scale: 0.9, rot: 4, dx: 500, dy: 0, cue: 10 },
  { file: 'remarks-editor.png', w: 390, h: 215, cx: 1500, cy: 760, scale: 0.9, rot: -3, dx: 450, dy: 280, cue: 13 },
  { file: 'task-detail-modal.png', w: 350, h: 350, cx: 310, cy: 790, scale: 0.72, rot: 3, dx: -430, dy: 300, cue: 16 },
  { file: 'flight-detail-drawer.png', w: 220, h: 542, cx: 600, cy: 790, scale: 0.56, rot: 2, dx: -250, dy: 330, cue: 19 },
  { file: 'search-mu5206.png', w: 520, h: 292, cx: 630, cy: 210, scale: 0.58, rot: -2, dx: 0, dy: -300, cue: 22 },
  { file: 'control-entry.png', w: 520, h: 292, cx: 1300, cy: 910, scale: 0.62, rot: 2, dx: 350, dy: 300, cue: 25 },
  { file: 'scale-30.png', w: 520, h: 292, cx: 1620, cy: 170, scale: 0.5, rot: 3, dx: 380, dy: -230, cue: 28 },
];

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [0, 24], [0, 14], CLAMP);
  const crane = interpolate(frame, [0, 40], [0, 1], { ...CLAMP, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const recede = interpolate(frame, [42, 50], [0, 1], CLAMP);
  const rule = interpolate(frame, [58, 70], [0, 1], CLAMP);
  const tag = interpolate(frame, [68, 80], [0, 1], CLAMP);
  const letters = 'Flight Ops Center'.split('');
  const dust = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 439 + 137) % 1920,
    y: (i * 613 + 271) % 1080,
    s: 2 + (i % 3) * 0.5,
    o: 0.14 + (i % 5) * 0.04,
  }));
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{ transform: `perspective(1400px) rotateX(${4 * (1 - crane)}deg) scale(${1.06 - 0.06 * crane + frame / 4200})`, transformOrigin: '50% 45%' }}>
        <Texture src="overview-current.png" style={{ filter: `blur(${blur}px) saturate(.82)`, opacity: 0.3 }} />
        <AbsoluteFill style={{ background: 'radial-gradient(1150px 760px at 50% 48%,rgba(248,250,252,.9),rgba(224,242,254,.48) 68%,rgba(248,250,252,.35))' }} />
        {OUTRO_ASSETS.map((asset) => {
          const t = interpolate(frame, [asset.cue, asset.cue + 12], [0, 1], { ...CLAMP, easing: Easing.bezier(0.34, 1.4, 0.44, 1) });
          const air = 1 - t;
          return (
            <div
              key={asset.file}
              style={{
                position: 'absolute',
                left: asset.cx - asset.w / 2,
                top: asset.cy - asset.h / 2,
                width: asset.w,
                height: asset.h,
                borderRadius: 16,
                overflow: 'hidden',
                opacity: interpolate(frame, [asset.cue, asset.cue + 3], [0, 1], CLAMP) * (1 - recede * 0.12),
                transform: `translate(${asset.dx * air}px,${asset.dy * air}px) rotate(${asset.rot * (2 - t)}deg) scale(${asset.scale * (1.12 - 0.12 * t)})`,
                boxShadow: air > 0.01 ? `0 ${10 + 26 * air}px ${24 + 46 * air}px rgba(15,23,42,.23)` : '0 10px 24px rgba(15,23,42,.16)',
                border: '1px solid rgba(148,163,184,.35)',
              }}
            >
              <Img src={staticFile(`textures/live/${asset.file}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
      </AbsoluteFill>
      {dust.map((d, i) => (
        <div key={i} style={{ position: 'absolute', left: d.x + Math.sin(frame * 0.026 + i) * 12, top: ((d.y - frame * (0.3 + (i % 4) * 0.08)) % 1080 + 1080) % 1080, width: d.s, height: d.s, borderRadius: '50%', background: '#38bdf8', opacity: d.o }} />
      ))}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', fontFamily: SERIF, fontSize: 130, fontWeight: 600, color: INK, letterSpacing: '-.02em' }}>
            {letters.map((ch, i) => {
              const t = interpolate(frame, [42 + i * 1.8, 50 + i * 1.8], [0, 1], { ...CLAMP, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
              return <span key={i} style={{ opacity: t, transform: `translateY(${(1 - t) * 28}px) scale(${1.35 - 0.35 * t})`, filter: `blur(${(1 - t) * 8}px)`, whiteSpace: 'pre' }}>{ch}</span>;
            })}
          </div>
          <div style={{ width: 260, height: 6, margin: '34px auto 0', borderRadius: 3, background: BLUE, transform: `scaleX(${rule})` }} />
          <div style={{ marginTop: 30, font: `700 32px ${MONO}`, letterSpacing: '.1em', color: INK2, opacity: tag }}>航班运行中心 · 一屏掌握保障全局</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CAPTIONS = [
  { from: 90, duration: 40, text: '全局时间轴 · 当前时间 · 运行偏差' },
  { from: 318, duration: 44, text: '保障任务持续汇入运行视图' },
  { from: 395, duration: 55, text: '搜索航班 · 切换刻度 · 快速定位' },
  { from: 477, duration: 68, text: '任务从发布到完成，全生命周期可追踪' },
  { from: 633, duration: 72, text: '五类运行视图，围绕同一条保障链路' },
  { from: 789, duration: 78, text: '下钻航班详情，记录并同步每一次变化' },
] as const;

const SFX: { from: number; src: string; volume: number }[] = [
  { from: 12, src: 'transition-soft.mp3', volume: 0.4 },
  { from: 78, src: 'whoosh-fast.mp3', volume: 0.45 },
  { from: 127, src: 'whoosh-big.mp3', volume: 0.5 },
  { from: 141, src: 'sparkle.mp3', volume: 0.35 },
  { from: 204, src: 'transition-snap.mp3', volume: 0.5 },
  { from: 220, src: 'swoosh-quick.mp3', volume: 0.4 },
  { from: 277, src: 'transition-soft.mp3', volume: 0.4 },
  { from: 308, src: 'whoosh-big.mp3', volume: 0.5 },
  { from: 340, src: 'whoosh-fast.mp3', volume: 0.4 },
  { from: 356, src: 'whoosh-fast.mp3', volume: 0.32 },
  { from: 388, src: 'whoosh-big.mp3', volume: 0.5 },
  { from: 401, src: 'keyboard.mp3', volume: 0.4 },
  { from: 435, src: 'whoosh-fast.mp3', volume: 0.4 },
  { from: 451, src: 'click-camera.mp3', volume: 0.6 },
  { from: 455, src: 'swoosh-quick.mp3', volume: 0.35 },
  { from: 475, src: 'transition-soft.mp3', volume: 0.45 },
  { from: 565, src: 'swoosh-quick.mp3', volume: 0.4 },
  { from: 623, src: 'transition-soft.mp3', volume: 0.45 },
  { from: 648, src: 'click-camera.mp3', volume: 0.45 },
  { from: 725, src: 'swoosh-quick.mp3', volume: 0.4 },
  { from: 779, src: 'transition-soft.mp3', volume: 0.4 },
  { from: 781, src: 'keyboard.mp3', volume: 0.34 },
  { from: 839, src: 'transition-snap.mp3', volume: 0.46 },
  { from: 885, src: 'swoosh-quick.mp3', volume: 0.4 },
  { from: 945, src: 'riser-cine.mp3', volume: 0.5 },
  { from: 980, src: 'impact-cine.mp3', volume: 0.55 },
  { from: 1005, src: 'sparkle.mp3', volume: 0.3 },
];

export const FlightOpsInkPress: React.FC = () => (
  <AbsoluteFill style={{ background: PAPER }}>
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.src === 'keyboard.mp3' ? (s.from > 700 ? 44 : 24) : 90}>
        <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
      </Sequence>
    ))}
    <Sequence from={SHOTS.morning.from} durationInFrames={SHOTS.morning.duration}><BrandHero /></Sequence>
    <Sequence from={SHOTS.card1.from} durationInFrames={SHOTS.card1.duration}>
      <PaperTitleCard duration={55} words={[{ text: '一条' }, { text: '时间轴，', accent: true }, { text: '掌握' }, { text: '保障全局。' }]} />
    </Sequence>
    <Sequence from={SHOTS.table.from} durationInFrames={SHOTS.table.duration}><DeckAndSearch /></Sequence>
    <Sequence from={SHOTS.macro.from} durationInFrames={SHOTS.macro.duration}><LifecycleEmbed /></Sequence>
    <Sequence from={SHOTS.card2.from} durationInFrames={SHOTS.card2.duration}>
      <PaperTitleCard duration={55} words={[{ text: '每次' }, { text: '变化，', accent: true }, { text: '都有迹可循。' }]} sub="个生命周期节点" subDigits="5" />
    </Sequence>
    <Sequence from={SHOTS.chart.from} durationInFrames={SHOTS.chart.duration}><ViewStack /></Sequence>
    <Sequence from={SHOTS.cardWbr.from} durationInFrames={SHOTS.cardWbr.duration}>
      <PaperTitleCard duration={50} words={[{ text: '航班详情与' }, { text: '备注，', accent: true }, { text: '始终同步。' }]} />
    </Sequence>
    <Sequence from={SHOTS.wbr.from} durationInFrames={SHOTS.wbr.duration}><RemarksReveal /></Sequence>
    <Sequence from={SHOTS.card3.from} durationInFrames={SHOTS.card3.duration}>
      <PaperTitleCard duration={55} words={[{ text: '多级与穿透管控，' }, { text: '同一入口。', accent: true }]} />
    </Sequence>
    <Sequence from={SHOTS.outro.from} durationInFrames={SHOTS.outro.duration}><Outro /></Sequence>
    {CAPTIONS.map((caption) => (
      <Sequence key={caption.from} from={caption.from} durationInFrames={caption.duration}>
        <Caption text={caption.text} duration={caption.duration} />
      </Sequence>
    ))}
    {[SHOTS.table.from, SHOTS.macro.from, SHOTS.chart.from, SHOTS.wbr.from].map((cut) => (
      <Sequence key={cut} from={cut - 5} durationInFrames={10}><FlashCut duration={10} /></Sequence>
    ))}
  </AbsoluteFill>
);
