import { z } from 'zod';
import { getPage, hasActivePage } from '../browser.js';

export const getPageContentTool = {
  name: 'get_page_content',
  description: 'Get HTML or simplified DOM structure for scraper development. Use simplified mode to analyze page structure when building a scraper. Essential for finding CSS selectors and understanding data layout.',
  inputSchema: z.object({
    simplified: z.boolean().optional()
      .describe('If true, returns a simplified DOM tree with just tag names, classes, IDs, and text snippets. Default: false'),
    selector: z.string().optional()
      .describe('Optional: get content only from elements matching this selector'),
    maxLength: z.number().optional()
      .describe('Maximum length of returned content. Default: 50000')
  }),
  handler: async (params: { simplified?: boolean; selector?: string; maxLength?: number }) => {
    if (!hasActivePage()) {
      return { error: 'No page loaded. Use navigate tool first.' };
    }
    
    const page = await getPage();
    const maxLen = params.maxLength || 50000;
    
    if (params.simplified) {
      // Return simplified DOM structure
      const structure = await page.evaluate((sel) => {
        function simplifyNode(node: Element, depth: number = 0): object | null {
          if (depth > 10) return null; // Prevent too deep recursion
          
          const tag = node.tagName.toLowerCase();
          
          // Skip script, style, and other non-content elements
          if (['script', 'style', 'noscript', 'svg', 'path'].includes(tag)) {
            return null;
          }
          
          const result: Record<string, unknown> = { tag };
          
          if (node.id) result.id = node.id;
          if (node.className && typeof node.className === 'string') {
            result.class = node.className.split(' ').filter(c => c).slice(0, 5).join(' ');
          }
          
          // Get direct text content (not from children)
          const textContent = Array.from(node.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent?.trim())
            .filter(t => t)
            .join(' ')
            .slice(0, 100);
          
          if (textContent) result.text = textContent;
          
          // Important attributes
          const href = node.getAttribute('href');
          const src = node.getAttribute('src');
          const dataTestId = node.getAttribute('data-testid');
          
          if (href) result.href = href.slice(0, 100);
          if (src) result.src = src.slice(0, 100);
          if (dataTestId) result.testId = dataTestId;
          
          // Recurse into children
          const children = Array.from(node.children)
            .map(child => simplifyNode(child, depth + 1))
            .filter(c => c !== null);
          
          if (children.length > 0) {
            result.children = children.slice(0, 20); // Limit children
          }
          
          return result;
        }
        
        const root = sel ? document.querySelector(sel) : document.body;
        if (!root) return { error: 'Element not found' };
        return simplifyNode(root);
      }, params.selector || null);
      
      const content = JSON.stringify(structure, null, 2);
      return {
        success: true,
        format: 'simplified',
        content: content.slice(0, maxLen),
        truncated: content.length > maxLen
      };
    } else {
      // Return raw HTML
      let html: string;
      
      if (params.selector) {
        html = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? el.outerHTML : '';
        }, params.selector) || '';
        
        if (!html) {
          return { error: `Element not found: ${params.selector}` };
        }
      } else {
        html = await page.content();
      }
      
      return {
        success: true,
        format: 'html',
        content: html.slice(0, maxLen),
        truncated: html.length > maxLen,
        length: html.length
      };
    }
  }
};
