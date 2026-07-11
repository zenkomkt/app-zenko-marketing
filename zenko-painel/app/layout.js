import './globals.css';
import localFont from 'next/font/local';
import { ToastProvider } from '@/components/ToastProvider';
import AppShell from '@/components/AppShell';

/**
 * Fontes via next/font/local.
 *
 * Os arquivos ficam em app/fonts (WOFF2, reduzidos ao alfabeto latino).
 * Vantagens sobre o <link> do Google Fonts:
 *  - o navegador não precisa falar com nenhum servidor de terceiros;
 *  - o Next injeta @font-face e o preload sozinho, sem o texto "pular" ao carregar;
 *  - o build funciona offline, em Docker e em CI.
 */
const fonteDisplay = localFont({
  src: './fonts/BricolageGrotesque.woff2',
  weight: '200 800', // fonte variável
  style: 'normal',
  display: 'swap',
  variable: '--fonte-display',
});

const fonteCorpo = localFont({
  src: './fonts/Chivo.woff2',
  weight: '100 900', // fonte variável
  style: 'normal',
  display: 'swap',
  variable: '--fonte-corpo',
});

const fonteMono = localFont({
  src: [
    { path: './fonts/IBMPlexMono-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/IBMPlexMono-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--fonte-mono',
});

export const metadata = {
  title: {
    default: 'Zenko · Painel de Publicação',
    template: 'Zenko · %s',
  },
  description:
    'Painel interno da Zenko para agendar e publicar em Instagram, TikTok e Facebook. Acessível (WCAG 2.2 AA).',
};

export const viewport = {
  themeColor: '#05070E',
};

export default function RootLayout({ children }) {
  const fontes = `${fonteDisplay.variable} ${fonteCorpo.variable} ${fonteMono.variable}`;

  return (
    <html lang="pt-BR" className={fontes}>
      <body>
        {/* Gradiente da marca, compartilhado por todos os SVGs via url(#zgrad) */}
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="zgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#54E3FB" />
              <stop offset="1" stopColor="#2E77F0" />
            </linearGradient>
          </defs>
        </svg>

        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
