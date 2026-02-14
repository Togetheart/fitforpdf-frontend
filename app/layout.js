import './globals.css';
import SiteHeader from './_components/SiteHeader';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
