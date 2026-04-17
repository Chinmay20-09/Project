import { CheerioCrawler } from "crawlee";

export async function runCrawler(url) {
  const results = [];

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 5,

    async requestHandler({ request, $, log }) {
      log.info(`Processing ${request.url}`);

      const title = $("title").text();

      const links = $("a")
        .map((i, el) => $(el).attr("href"))
        .get()
        .filter(Boolean)
        .slice(0, 5);

      results.push({
        url: request.url,
        title,
        links,
      });
    },
  });

  await crawler.run([url]);
  return results;
}
