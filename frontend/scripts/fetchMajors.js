const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const url = 'https://www.fiu.edu/academics/degrees-and-programs/index.html#';
  console.log(`Scraping ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  const majorsOnPage = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('p.program').forEach(el => {
      const text = el.textContent.trim();
      if (text) items.push(text);
    });
    return items;
  });

  await browser.close();

  // Remove duplicates if any
  const uniqueMajors = Array.from(new Set(majorsOnPage));

  fs.writeFileSync('./src/data/majors.json', JSON.stringify(uniqueMajors, null, 2));
  console.log(`✅ Done! Saved ${uniqueMajors.length} unique majors.`);
})();
