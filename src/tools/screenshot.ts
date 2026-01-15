import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const screenshotTool = {
  name: 'screenshot',
  description: 'Take a screenshot of the current page. Returns the image as base64 PNG. Use this to see what the page looks like.',
  inputSchema: z.object({
    fullPage: z.boolean().optional().describe('Capture full scrollable page instead of just viewport. Default: false'),
    selector: z.string().optional().describe('Optional: capture only a specific element by CSS selector')
  }),
  handler: async (params: { fullPage?: boolean; selector?: string }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    
    let screenshot: Buffer;
    
    if (params.selector) {
      const element = await page.$(params.selector);
      if (!element) {
        return { error: `Element not found: ${params.selector}` };
      }
      screenshot = await element.screenshot({ type: 'png' });
    } else {
      screenshot = await page.screenshot({ 
        type: 'png',
        fullPage: params.fullPage || false
      });
    }
    
    const base64 = screenshot.toString('base64');
    
    return {
      success: true,
      image: {
        type: 'image',
        data: base64,
        mimeType: 'image/png'
      },
      size: screenshot.length,
      message: `Screenshot captured (${Math.round(screenshot.length / 1024)}KB)`
    };
  }
};
