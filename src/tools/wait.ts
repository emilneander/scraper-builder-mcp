import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const waitForTool = {
  name: 'wait_for',
  description: 'Wait for an element to appear, or for the page to reach a certain state. Useful for dynamic content.',
  inputSchema: z.object({
    selector: z.string().optional().describe('CSS selector to wait for'),
    state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional()
      .describe('State to wait for. Default: visible'),
    timeout: z.number().optional().describe('Timeout in ms. Default: 10000'),
    networkIdle: z.boolean().optional().describe('Wait for network to be idle instead')
  }),
  handler: async (params: { selector?: string; state?: string; timeout?: number; networkIdle?: boolean }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    const timeout = params.timeout || 10000;
    
    try {
      if (params.networkIdle) {
        await page.waitForLoadState('networkidle', { timeout });
        return {
          success: true,
          message: 'Network is idle'
        };
      }
      
      if (!params.selector) {
        return { error: 'Either selector or networkIdle must be specified' };
      }
      
      const state = (params.state as 'visible' | 'hidden' | 'attached' | 'detached') || 'visible';
      await page.locator(params.selector).waitFor({ state, timeout });
      
      return {
        success: true,
        message: `Element "${params.selector}" is now ${state}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Timeout waiting for "${params.selector}": ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};
