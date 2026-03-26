import { scrapeTrendyolProduct } from './lib/scraper.js';

async function main() {
  const url = 'https://www.trendyol.com/softto-plus/beyaz-kapatici-aninda-etkili-brown-hair-kahverengi-boya-sampuan-350-ml-p-1049516236';
  try {
    const data = await scrapeTrendyolProduct(url, '1049516236');
    console.log('Success:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
