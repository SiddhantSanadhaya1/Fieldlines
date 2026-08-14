/**
 * Placeholder evidence tiles.
 *
 * Real jobs carry photos captured on-device (FIEL-17 / FIEL-64), which do not
 * exist yet. Rather than link to remote images — which would break offline and
 * render as broken-image icons — each tile is an inline SVG data URI. They are
 * deliberately synthetic-looking: a demo should not pass fake photographs off
 * as field evidence.
 */

const PALETTE: Record<string, [string, string]> = {
  slate: ['#334155', '#64748b'],
  teal: ['#0f766e', '#14b8a6'],
  amber: ['#b45309', '#f59e0b'],
  rose: ['#9f1239', '#f43f5e'],
  indigo: ['#3730a3', '#6366f1'],
};

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Greedy word wrap. Thumbnails render at ~132px from a 480px viewBox, so type
 * has to be set large in source units to stay legible once scaled down —
 * which means long captions need breaking across lines.
 */
function wrap(label: string, maxChars = 20): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of label.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

/**
 * Builds an inline SVG data URI for one piece of evidence.
 * Renders offline, at any size, with no network request.
 */
export function evidenceTile(label: string, tone: keyof typeof PALETTE = 'slate'): string {
  const [dark, light] = PALETTE[tone] ?? PALETTE.slate;
  const lines = wrap(label);
  const glyphY = lines.length > 1 ? 132 : 146;
  const textTop = glyphY + 96;

  const textHTML = lines
    .map(
      (line, i) =>
        `<text x="240" y="${textTop + i * 44}" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="36" font-weight="700" fill="#fff">${escapeXml(line)}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${dark}"/>
      <stop offset="100%" stop-color="${light}"/>
    </linearGradient>
    <pattern id="p" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0H0v30" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="480" height="360" fill="url(#g)"/>
  <rect width="480" height="360" fill="url(#p)"/>
  <g transform="translate(240 ${glyphY}) scale(1.7)" fill="none" stroke="rgba(255,255,255,.9)"
     stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-30 -14h12l5-7h26l5 7h12a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5h-60a5 5 0 0 1-5-5v-30a5 5 0 0 1 5-5z"/>
    <circle cx="0" cy="10" r="13"/>
  </g>
  ${textHTML}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
