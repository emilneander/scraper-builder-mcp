import { chromium, Browser, Page } from 'playwright';
import { execSync } from 'child_process';

let browser: Browser | null = null;
let page: Page | null = null;

const isHeaded = process.env.HEADED === 'true';

async function launchBrowser(): Promise<Browser> {
  const launchOptions = { 
    headless: !isHeaded,
    args: ['--no-sandbox']
  };
  
  try {
    return await chromium.launch(launchOptions);
  } catch (error) {
    // Browser not installed - install it automatically
    console.error('Chromium not found. Installing...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.error('Chromium installed successfully.');
    return await chromium.launch(launchOptions);
  }
}

export async function getPage(): Promise<Page> {
  if (!browser) {
    browser = await launchBrowser();
  }
  
  if (!page) {
    page = await browser.newPage();
    page.setDefaultTimeout(30000);
  }
  
  return page;
}

export async function closeBrowser(): Promise<void> {
  if (page) {
    await page.close();
    page = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function hasActivePage(): boolean {
  return page !== null;
}
