export type NewsSource = {
  id: string | null;
  name: string;
};

export type NewsArticle = {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

export type NewsApiResponse = {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
};
