import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const scrollTool = {
  name: 'scroll',
  description: 'Scroll the page in a direction or to a specific position. Useful for loading lazy content or reaching elements below the fold.',
  inputSchema: z.object({
    direction: z.enum(['up', 'down', 'top', 'bottom']).optional()
      .describe('Direction to scroll. Use "top" or "bottom" to go to page extremes.'),
    pixels: z.number().optional()
      .describe('Number of pixels to scroll (used with up/down). Default: 500'),
    selector: z.string().optional()
      .describe('Scroll element into view instead of scrolling the page')
  }),
  handler: async (params: { direction?: 'up' | 'down' | 'top' | 'bottom'; pixels?: number; selector?: string }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    
    if (params.selector) {
      // Scroll element into view
      try {
        await page.locator(params.selector).scrollIntoViewIfNeeded();
        return {
          success: true,
          message: `Scrolled "${params.selector}" into view`
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to scroll to element: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
    
    const scrollAmount = params.pixels || 500;
    
    await page.evaluate(({ dir, amount }) => {
      switch (dir) {
        case 'up':
          window.scrollBy(0, -amount);
          break;
        case 'down':
          window.scrollBy(0, amount);
          break;
        case 'top':
          window.scrollTo(0, 0);
          break;
        case 'bottom':
          window.scrollTo(0, document.body.scrollHeight);
          break;
        default:
          window.scrollBy(0, amount);
      }
    }, { dir: params.direction || 'down', amount: scrollAmount });
    
    // Wait for any lazy loading
    await page.waitForTimeout(300);
    
    const scrollPosition = await page.evaluate(() => ({
      x: window.scrollX,
      y: window.scrollY,
      pageHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight
    }));
    
    return {
      success: true,
      position: scrollPosition,
      message: `Scrolled ${params.direction || 'down'}. Position: ${scrollPosition.y}/${scrollPosition.pageHeight}px`
    };
  }
};
