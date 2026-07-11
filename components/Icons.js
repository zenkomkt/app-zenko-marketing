/**
 * Ícones em SVG.
 * Todos são decorativos (aria-hidden): o significado vem sempre do texto ao lado.
 */

function Svg({ children, ...props }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

/* Marca Zenko */
export function LogoZ(props) {
  return (
    <svg viewBox="0 0 128 128" aria-hidden="true" focusable="false" {...props}>
      <path d="M28 34 L92 34 L80 52 L16 52 Z" fill="url(#zgrad)" />
      <path d="M80 44 L98 44 L48 94 L30 94 Z" fill="url(#zgrad)" />
      <path d="M36 92 L100 92 L88 110 L24 110 Z" fill="url(#zgrad)" />
      <path d="M86 22 L110 26 L96 46 Z" fill="url(#zgrad)" />
    </svg>
  );
}

/* Navegação */
export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="11" width="8" height="10" rx="1.5" />
    <rect x="3" y="14" width="8" height="7" rx="1.5" />
  </Svg>
);

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M12 16V4M8 8l4-4 4 4" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Svg>
);

export const IconLayers = (p) => (
  <Svg {...p}>
    <rect x="7" y="7" width="14" height="14" rx="2" />
    <path d="M3 15V5a2 2 0 0 1 2-2h10" />
  </Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </Svg>
);

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M17 8h4M19 6v4" />
  </Svg>
);

export const IconScroll = (p) => (
  <Svg {...p}>
    <path d="M8 4h9a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2z" />
    <path d="M9 9h6M9 13h4" />
  </Svg>
);

export const IconGear = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.7 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 15M4.6 9a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 12 3.6" />
  </Svg>
);

/* Interface */
export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconBell = (p) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 18l6-6-6-6" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l3 2" />
  </Svg>
);

export const IconTrend = (p) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M17 5h4v4" />
  </Svg>
);

export const IconImage = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="9" cy="9" r="1.8" />
    <path d="M20 15l-4-4L7 20" />
  </Svg>
);

export const IconFilm = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M9 4l2 5M15 4l2 5" />
  </Svg>
);

export const IconWarning = (p) => (
  <Svg {...p}>
    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </Svg>
);

export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </Svg>
);

/* Redes sociais (formas simplificadas, no gradiente da marca) */
export const IconInstagram = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="url(#zgrad)" strokeWidth="2" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="url(#zgrad)" stroke="none" />
  </svg>
);

export const IconFacebook = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="url(#zgrad)" {...p}>
    <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z" />
  </svg>
);

export const IconTikTok = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="url(#zgrad)" {...p}>
    <path d="M16 4c.5 2.3 2 3.8 4 4v3c-1.6 0-3-.5-4-1.3V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2A3 3 0 1 0 13 15V4h3z" />
  </svg>
);
