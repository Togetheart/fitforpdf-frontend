import SeoArticle, { articleMetadata } from '../components/SeoArticle';
import { getArticleBySlug } from '../lib/seoArticles.mjs';

const article = getArticleBySlug('excel-pdf-text-too-small-fix');
export const metadata = articleMetadata(article);

export default function Page() {
  return <SeoArticle article={article} />;
}
