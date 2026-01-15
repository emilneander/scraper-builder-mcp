import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const clickTool = {
  name: 'click',
  description: 'Click on an element matching a CSS selector. Useful for buttons, links, expanding menus, etc.',
  inputSchema: z.object({
    selector: z.string().describe('CSS selector of element to click'),
    timeout: z.number().optional().describe('Timeout in ms. Default: 5000')
  }),
  handler: async (params: { selector: string; timeout?: number }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    
    try {
      await page.click(params.selector, { timeout: params.timeout || 5000 });
      
      // Wait a moment for any navigation/updates
      await page.waitForTimeout(500);
      
      return {
        success: true,
        message: `Clicked element: ${params.selector}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to click "${params.selector}": ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};

export const typeTool = {
  name: 'type',
  description: 'Type text into an input field. Will clear existing content first unless append is true.',
  inputSchema: z.object({
    selector: z.string().describe('CSS selector of input element'),
    text: z.string().describe('Text to type'),
    append: z.boolean().optional().describe('Append to existing text instead of replacing. Default: false'),
    pressEnter: z.boolean().optional().describe('Press Enter after typing. Default: false')
  }),
  handler: async (params: { selector: string; text: string; append?: boolean; pressEnter?: boolean }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    
    try {
      if (!params.append) {
        await page.fill(params.selector, params.text);
      } else {
        await page.locator(params.selector).pressSequentially(params.text);
      }
      
      if (params.pressEnter) {
        await page.press(params.selector, 'Enter');
        await page.waitForTimeout(500);
      }
      
      return {
        success: true,
        message: `Typed "${params.text}" into ${params.selector}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to type into "${params.selector}": ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};
