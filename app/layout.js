import './globals.css';

export const metadata = {
  title: 'AKTARMATIK | E-Ticaret Modülleri Platformu',
  description: 'Trendyol yorum aktarma, sosyal kanıt, akıllı arama, Instagram feed ve daha fazla modülle e-ticaret sitenizi güçlendirin.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
