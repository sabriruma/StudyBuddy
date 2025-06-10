const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
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
          const code = codeEl.textContent.trim();
          const name = titleEl.textContent.trim();
          // Avoid duplicates
          if (!items.some(item => item.code === code && item.name === name)) {
            items.push({ code, name });
          }
        }
      });
      return items;
    });

    if (coursesOnPage.length === 0) break;
    allCourses.push(...coursesOnPage);
  }

  await browser.close();

  const seen = new Set();
const uniqueCourses = allCourses.filter(course => {
  const key = `${course.code}-${course.name}`;
  return seen.has(key) ? false : seen.add(key);
});

  fs.writeFileSync('./src/data/subjects.json', JSON.stringify(uniqueCourses, null, 2));
  console.log(`✅ Done! Saved ${uniqueCourses.length} unique courses.`);
})();