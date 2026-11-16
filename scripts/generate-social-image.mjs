import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

// Capture the real headline so the font, gradient and line breaks match the site.
// Run with a dev server: npm run generate:social-image -- --origin http://localhost:3000
const originIndex = process.argv.indexOf('--origin');
const origin = new URL(originIndex < 0 ? 'http://localhost:3000' : process.argv[originIndex + 1]);
const season = JSON.parse(await readFile(new URL('../src/data/season.json', import.meta.url), 'utf8'));
const expectedTitle = `Your Guide to\nMiami Art Week ${season.year}`;
const output = new URL(`../public/miami-art-week-${season.year}-share-hero.png`, import.meta.url);
const width = 1200;
const height = 630;
const fontSize = 102;

const browser = await chromium.launch({ headless: true });
try {
  // Preserve the desktop hero's full gradient span, including space beside the text.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(origin.href, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  const title = (await page.locator('h1').innerText()).trim();
  if (title !== expectedTitle) throw new Error(`Unexpected hero headline: ${JSON.stringify(title)}`);

  await page.evaluate(({ width, height, fontSize }) => {
    const original = document.querySelector('h1');
    const computed = getComputedStyle(original);
    const scale = fontSize / Number.parseFloat(computed.fontSize);
    const headline = original.cloneNode(true);
    const background = getComputedStyle(document.body).backgroundColor;
    Object.assign(headline.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${original.getBoundingClientRect().width * scale}px`,
      maxWidth: 'none',
      margin: '0',
      padding: '0',
      fontFamily: computed.fontFamily,
      fontWeight: computed.fontWeight,
      fontSize: `${fontSize}px`,
      lineHeight: `${Number.parseFloat(computed.lineHeight) * scale}px`,
      letterSpacing: computed.letterSpacing,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      backgroundImage: computed.backgroundImage,
    });
    const canvas = document.createElement('div');
    canvas.id = 'social-image';
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0 auto auto 0',
      width: `${width}px`,
      height: `${height}px`,
      overflow: 'hidden',
      background,
    });
    canvas.append(headline);
    document.body.replaceChildren(canvas);
  }, { width, height, fontSize });

  await page.setViewportSize({ width, height });
  await mkdir(new URL('../public/', import.meta.url), { recursive: true });
  await page.locator('#social-image').screenshot({ path: output.pathname, animations: 'disabled' });
  console.log(`Generated ${width}×${height} ${output.pathname} from ${origin.origin}`);
} finally {
  await browser.close();
}
