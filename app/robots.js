export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://www.fitforpdf.com/sitemap.xml',
    host: 'https://www.fitforpdf.com',
  };
}
