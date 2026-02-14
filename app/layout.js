import './globals.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
