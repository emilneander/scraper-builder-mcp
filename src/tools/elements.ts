import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const findElementsTool = {
  name: 'find_elements',
  description: 'Find elements matching a CSS selector. Returns information about each element including tag, text, attributes, and position.',
  inputSchema: z.object({
    selector: z.string().describe('CSS selector to find elements'),
    limit: z.number().optional().describe('Maximum number of elements to return. Default: 20')
  }),
  handler: async (params: { selector: string; limit?: number }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    const limit = params.limit || 20;
    
    const elements = await page.evaluate(({ sel, lim }) => {
      const els = Array.from(document.querySelectorAll(sel)).slice(0, lim);
      
      return els.map((el, index) => {
        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        
        // Get attributes
        const attrs: Record<string, string> = {};
        for (const attr of el.attributes) {
          if (['id', 'class', 'href', 'src', 'alt', 'title', 'data-testid', 'name', 'type', 'value', 'placeholder'].includes(attr.name)) {
            attrs[attr.name] = attr.value.slice(0, 200);
          }
        }
        
        return {
          index,
          tag,
          text: el.textContent?.trim().slice(0, 200) || '',
          attributes: attrs,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        };
      });
    }, { sel: params.selector, lim: limit });
    
    return {
      success: true,
      selector: params.selector,
      count: elements.length,
      elements
    };
  }
};

export const extractTextTool = {
  name: 'extract_text',
  description: 'Extract text content from elements matching a CSS selector. Returns an array of text strings.',
  inputSchema: z.object({
    selector: z.string().describe('CSS selector to find elements'),
    limit: z.number().optional().describe('Maximum number of elements. Default: 50'),
    includeHtml: z.boolean().optional().describe('Include inner HTML as well. Default: false')
  }),
  handler: async (params: { selector: string; limit?: number; includeHtml?: boolean }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    const limit = params.limit || 50;
    
    const results = await page.evaluate(({ sel, lim, html }) => {
      const els = Array.from(document.querySelectorAll(sel)).slice(0, lim);
      
      return els.map(el => {
        const result: { text: string; html?: string } = {
          text: el.textContent?.trim() || ''
        };
        if (html) {
          result.html = el.innerHTML.slice(0, 500);
        }
        return result;
      });
    }, { sel: params.selector, lim: limit, html: params.includeHtml || false });
    
    return {
      success: true,
      selector: params.selector,
      count: results.length,
      results
    };
  }
};
