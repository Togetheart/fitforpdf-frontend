import Script from 'next/script';
import './globals.css';
import SiteShell from './components/SiteShell';

export default function RootLayout({ children }) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
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
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`,
            }}
          />
        )}
      </body>
    </html>
  );
}
