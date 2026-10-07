/**
 * Small React blocks for the Theme MDX pages (docs pages render with React
 * even in an Angular Storybook). Every preview paints with the live
 * `var(--qbc-…)` custom property, so what you see is the stylesheet the
 * components load, not a copy of it.
 */
import type { CSSProperties, ReactNode } from 'react';

import { overridesFor, type Token } from './tokens';

const code: CSSProperties = {
  fontFamily: 'var(--qbc-font-mono)',
  fontSize: 12,
};
const muted: CSSProperties = { color: 'var(--qbc-ink-soft)', fontSize: 12 };
const row: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(180px, 280px) minmax(0, 1fr)',
  gap: 20,
  alignItems: 'center',
  padding: '14px 0',
  borderBottom: '1px solid var(--qbc-line)',
};

function Responsive({ name }: { name: string }) {
  const list = overridesFor(name);
  if (!list.length) return null;
  return (
    <div style={{ ...muted, marginTop: 4 }}>
      {list.map((o) => (
        <div key={o.query}>
          {o.query}: <code style={code}>{o.value}</code>
        </div>
      ))}
    </div>
  );
}

/** Name, `var()` reference, declared value, note and any responsive retune. */
export function TokenMeta({ token }: { token: Token }) {
  return (
    <div style={{ minWidth: 0 }}>
      <code style={{ ...code, fontWeight: 700, color: 'var(--qbc-ink)' }}>var({token.name})</code>
      <div style={{ ...muted, ...code, overflowWrap: 'anywhere' }}>{token.value}</div>
      {token.note ? <div style={muted}>{token.note}</div> : null}
      <Responsive name={token.name} />
    </div>
  );
}

/** Colour swatches in a responsive grid. */
export function ColorGrid({ tokens }: { tokens: readonly Token[] }) {
  return (
    <div
      className="sb-unstyled"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        margin: '16px 0 32px',
      }}
    >
      {tokens.map((t) => (
        <div
          key={t.name}
          style={{
            border: '1px solid var(--qbc-line)',
            borderRadius: 'var(--qbc-r-lg)',
            overflow: 'hidden',
            background: 'var(--qbc-panel)',
          }}
        >
          <div
            style={{
              height: 72,
              background: `var(${t.name})`,
              borderBottom: '1px solid var(--qbc-line)',
            }}
          />
          <div style={{ padding: 12 }}>
            <TokenMeta token={t} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** One row per token, with a live preview rendered by `preview(token)`. */
export function TokenTable({
  tokens,
  preview,
}: {
  tokens: readonly Token[];
  preview?: (token: Token) => ReactNode;
}) {
  return (
    <div
      className="sb-unstyled"
      style={{ margin: '16px 0 32px' }}
    >
      {tokens.map((t) => (
        <div
          key={t.name}
          style={row}
        >
          <TokenMeta token={t} />
          <div style={{ minWidth: 0 }}>{preview ? preview(t) : null}</div>
        </div>
      ))}
    </div>
  );
}

/** Corner-radius rows: a tile drawn with each `--qbc-r-*`. */
export function RadiusRow({ tokens }: { tokens: readonly Token[] }) {
  return (
    <TokenTable
      tokens={tokens}
      preview={previews.radius}
    />
  );
}

/** Shadow tokens on panel tiles, side by side. */
export function ShadowCard({ tokens }: { tokens: readonly Token[] }) {
  return (
    <div
      className="sb-unstyled"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 28,
        margin: '16px 0 32px',
        padding: 28,
        borderRadius: 'var(--qbc-r-xl)',
        background: 'var(--qbc-soft)',
      }}
    >
      {tokens.map((t) => (
        <div key={t.name}>
          <div
            style={{
              height: 96,
              marginBottom: 14,
              borderRadius: 'var(--qbc-r-lg)',
              border: '1px solid var(--qbc-line-card)',
              background: 'var(--qbc-panel)',
              boxShadow: `var(${t.name})`,
            }}
          />
          <TokenMeta token={t} />
        </div>
      ))}
    </div>
  );
}

/** A labelled type sample — sizes and weights the components use literally. */
export function TypeSample({
  size,
  weight,
  usage,
  children,
}: {
  size: string;
  weight: number;
  usage: string;
  children: ReactNode;
}) {
  return (
    <div
      className="sb-unstyled"
      style={row}
    >
      <div>
        <code style={{ ...code, fontWeight: 700, color: 'var(--qbc-ink)' }}>
          {size} / {weight}
        </code>
        <div style={muted}>{usage}</div>
      </div>
      <div
        style={{
          fontFamily: 'var(--qbc-font-sans)',
          fontSize: size,
          fontWeight: weight,
          lineHeight: 1.2,
          color: 'var(--qbc-ink)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const previews = {
  color: (t: Token) => (
    <div
      style={{
        width: 96,
        height: 40,
        borderRadius: 'var(--qbc-r-control)',
        border: '1px solid var(--qbc-line)',
        background: `var(${t.name})`,
      }}
    />
  ),
  fontFamily: (t: Token) => (
    <div style={{ fontFamily: `var(${t.name})`, fontSize: 22, color: 'var(--qbc-ink)' }}>
      QBC-142 Groom the backlog 0123
    </div>
  ),
  radius: (t: Token) => (
    <div
      style={{
        width: 120,
        height: 64,
        borderRadius: `var(${t.name})`,
        background: 'var(--qbc-accent-soft)',
        border: '1px solid var(--qbc-accent)',
      }}
    />
  ),
  width: (t: Token) => (
    <div
      style={{
        width: `min(100%, var(${t.name}))`,
        minWidth: 4,
        height: 14,
        borderRadius: 4,
        background: 'var(--qbc-accent-soft)',
        border: '1px solid var(--qbc-accent)',
      }}
    />
  ),
  height: (t: Token) => (
    <div
      style={{
        width: 120,
        height: `var(${t.name})`,
        borderRadius: 4,
        background: 'var(--qbc-blue-soft)',
        border: '1px solid var(--qbc-blue)',
      }}
    />
  ),
};
