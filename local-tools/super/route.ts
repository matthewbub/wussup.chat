import { NewsArticle, NewsApiResponse } from "@/types/news-api";

function removeRedactedArticles(articles: NewsArticle[]) {
  return articles.filter((article) => article.title !== "[Removed]");
}

function removeImagelessArticles(articles: NewsArticle[]) {
  return articles.filter((article) => article.urlToImage !== null);
}

export async function GET() {
  const url =
    "https://newsapi.org/v2/top-headlines?country=us&apiKey=" +
    process.env.NEWS_API;
  const newsData = await fetch(url);

  const parsedData: NewsApiResponse = await newsData.json();

  parsedData.articles = removeRedactedArticles(parsedData.articles);
  parsedData.articles = removeImagelessArticles(parsedData.articles);

  return Response.json(parsedData);
}
