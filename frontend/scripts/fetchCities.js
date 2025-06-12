const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fetchCities() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.stateofflorida.com/cities/', { waitUntil: 'domcontentloaded' });

  const cities = await page.$$eval('strong > a', anchors =>
    anchors.map(a => a.textContent.trim()).filter(Boolean)
  );

  console.log(`${cities.length} cities found`);

  // Ensure data directory exists
  const dir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, 'cities.json');
  fs.writeFileSync(filePath, JSON.stringify(cities, null, 2));
  console.log(`Saved ${cities.length} cities to cities.json`);

  await browser.close();
}

fetchCities().catch(err => console.error('❌ Error scraping cities:', err));