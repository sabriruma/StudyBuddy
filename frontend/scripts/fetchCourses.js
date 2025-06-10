const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const allCourses = [];

  for (let i = 1; i <= 200; i++) {
    const url = `https://catalog.fiu.edu/courses?cq=&page=${i}`;
    console.log(`Scraping ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const coursesOnPage = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('li.course-button').forEach(el => {
        const codeEl = el.querySelector('span.pill-label');
        const titleEl = el.querySelector('h3 a');
        if (codeEl && titleEl) {
          items.push({
            code: codeEl.textContent.trim(),
            name: titleEl.textContent.trim()
          });
        }
      });
      return items;
    });

    if (coursesOnPage.length === 0) break;
    allCourses.push(...coursesOnPage);
  }

  await browser.close();

  fs.writeFileSync('./src/data/subjects.json', JSON.stringify(allCourses, null, 2));
  console.log(`✅ Done! Saved ${allCourses.length} courses.`);
})();