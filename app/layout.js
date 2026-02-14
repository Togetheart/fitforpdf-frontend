import './globals.css';
import SiteShell from './components/SiteShell';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
