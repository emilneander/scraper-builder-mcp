
import { z } from 'zod';
import { getPage } from '../browser.js';
import fs from 'fs';
import path from 'path';

export const DownloadResourceSchema = z.object({
  url: z.string().url().describe('The URL of the resource to download.'),
  save_path: z.string().optional().describe('Absolute path to save the resource to. If not provided, the content will be returned as text (if possible).'),
});

export async function downloadResource(args: z.infer<typeof DownloadResourceSchema>) {
  const page = await getPage();
  const context = page.context();
  
  try {
    const response = await context.request.get(args.url);
    
    if (!response.ok()) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Failed to fetch resource: ${response.status()} ${response.statusText()}` }]
      };
    }

    const buffer = await response.body();
    
    if (args.save_path) {
      // Ensure directory exists
      const dir = path.dirname(args.save_path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(args.save_path, buffer);
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Resource downloaded successfully to ${args.save_path} (${buffer.length} bytes)` 
        }]
      };
    } else {
      // Try to decode as text
      // We can check headers content-type if we want, but for now just try string conversion
      const text = buffer.toString('utf-8');
      // Truncate if too long for tool output
      const maxLength = 10000;
      const displayContent = text.length > maxLength 
        ? text.substring(0, maxLength) + `\n... (truncated, total length: ${text.length})` 
        : text;

      return {
        content: [{ type: 'text' as const, text: displayContent }]
      };
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `Download failed: ${error.message}` }]
    };
  }
}
