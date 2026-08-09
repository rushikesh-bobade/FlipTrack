import { PrismaClient, Marketplace } from "@prisma/client";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const prisma = new PrismaClient();

export interface PriceResult {
  marketplace: Marketplace;
  sku: string;
  size: string;
  askPrice: number | null;
  lastSold: number | null;
  bidPrice: number | null;
  fetchedAt: Date;
  url: string;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  throw new Error("Max retries exceeded");
}

async function scrapeStockX(sku: string, size: string): Promise<PriceResult | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const searchUrl = `https://stockx.com/search?s=${sku}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

    await sleep(2000);

    const priceData = await page.evaluate(() => {
      const productCard = document.querySelector('[data-testid="product-card"]');
      if (!productCard) return null;

      const askPriceEl = productCard.querySelector('[data-testid="product-price-ask"]');
      const bidPriceEl = productCard.querySelector('[data-testid="product-price-bid"]');
      const lastSoldEl = productCard.querySelector('[data-testid="product-price-last-sale"]');

      return {
        askPrice: askPriceEl ? parseFloat(askPriceEl.textContent?.replace(/[^0-9.]/g, "") || "0") : null,
        bidPrice: bidPriceEl ? parseFloat(bidPriceEl.textContent?.replace(/[^0-9.]/g, "") || "0") : null,
        lastSold: lastSoldEl ? parseFloat(lastSoldEl.textContent?.replace(/[^0-9.]/g, "") || "0") : null,
      };
    });

    if (!priceData) {
      console.log(`No price data found for ${sku}`);
      return null;
    }

    return {
      marketplace: "STOCKX",
      sku,
      size,
      askPrice: priceData.askPrice,
      bidPrice: priceData.bidPrice,
      lastSold: priceData.lastSold,
      fetchedAt: new Date(),
      url: searchUrl,
    };
  } catch (error) {
    console.error(`Error scraping StockX for ${sku}:`, error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function runAllScrapers(sku: string, size: string) {
  console.log(`Running scrapers for ${sku} - ${size}`);

  const results: PriceResult[] = [];

  try {
    const stockXResult = await fetchWithRetry(() => scrapeStockX(sku, size));
    
    if (stockXResult) {
      results.push(stockXResult);
      
      await prisma.marketPrice.upsert({
        where: {
          sku_size_marketplace: {
            sku: stockXResult.sku,
            size: stockXResult.size,
            marketplace: stockXResult.marketplace,
          },
        },
        create: {
          sku: stockXResult.sku,
          size: stockXResult.size,
          marketplace: stockXResult.marketplace,
          askPrice: stockXResult.askPrice,
          lastSold: stockXResult.lastSold,
          bidPrice: stockXResult.bidPrice,
          fetchedAt: stockXResult.fetchedAt,
        },
        update: {
          askPrice: stockXResult.askPrice,
          lastSold: stockXResult.lastSold,
          bidPrice: stockXResult.bidPrice,
          fetchedAt: stockXResult.fetchedAt,
        },
      });
    }
  } catch (error) {
    console.error(`Failed to scrape ${sku}:`, error);
  }

  return results;
}
