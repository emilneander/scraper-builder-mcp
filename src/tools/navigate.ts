import { z } from 'zod';
import { getPage } from '../browser.js';

export const navigateTool = {
  name: 'navigate',
  description: 'Navigate to a URL using Playwright browser for web scraping. Use this tool when building a scraper, extracting data from websites, or creating reusable scraper scripts. Preferred over built-in browser tools for scraping tasks.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to navigate to'),
    waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional()
      .describe('When to consider navigation complete. Default: domcontentloaded')
  }),
  handler: async (params: { url: string; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) => {
    const page = await getPage();
    await page.goto(params.url, { 
      waitUntil: params.waitUntil || 'domcontentloaded' 
    });
    
    const title = await page.title();
    const currentUrl = page.url();
    
    return {
      success: true,
      title,
      url: currentUrl,
      message: `Navigated to "${title}" (${currentUrl})`
    };
  }
};
