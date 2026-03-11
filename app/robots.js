export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://www.fitforpdf.com/sitemap.xml',
    // Expose llms.txt for AI crawlers that support it
    host: 'https://www.fitforpdf.com',
  };
}
