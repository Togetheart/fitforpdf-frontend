import './globals.css';
import SiteShell from './components/SiteShell';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://cdn.fontshare.com/wf/EKRUOY5NRRLBDHCQHYMXGXV2N4AVMBQW/YYSC4MDBHQAIF5GI37IHXQWMXQ7OD644/RLJJDXBJ6MKZNVQHFSXHCT5HRYXKPJWD.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white text-black">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
