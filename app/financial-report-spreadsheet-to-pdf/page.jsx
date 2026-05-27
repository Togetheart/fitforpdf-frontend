import SeoArticle, { articleMetadata } from '../components/SeoArticle';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

const article = getArticleBySlug('financial-report-spreadsheet-to-pdf');
export const metadata = articleMetadata(article);

export default function Page() {
  return <SeoArticle article={article} />;
}
