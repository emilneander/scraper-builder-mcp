
import { Page } from 'playwright';
import { z } from 'zod';
import { getPage } from '../browser.js';

export const ExecuteScriptSchema = z.object({
  script: z.string().describe('The JavaScript code to execute. The value returned by the script will be returned by the tool. Global variables like "document" and "window" are available.'),
});

export async function executeScript(args: z.infer<typeof ExecuteScriptSchema>) {
  const page = await getPage();
  
  try {
    // We wrap the evaluation to catch errors within the page context
    const result = await page.evaluate((code) => {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(code);
        return { success: true, result: res };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }, args.script);

    if (result.success) {
      return {
        content: [{ 
          type: 'text' as const, 
          text: JSON.stringify(result.result, null, 2) 
        }]
      };
    } else {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Script execution failed: ${result.error}` }]
      };
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `Tool execution failed: ${error.message}` }]
    };
  }
}
