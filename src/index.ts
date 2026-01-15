#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { closeBrowser } from './browser.js';
import { navigateTool } from './tools/navigate.js';
import { screenshotTool } from './tools/screenshot.js';
import { getPageContentTool } from './tools/content.js';
import { findElementsTool, extractTextTool } from './tools/elements.js';
import { clickTool, typeTool } from './tools/interact.js';
import { scrollTool } from './tools/scroll.js';
import { waitForTool } from './tools/wait.js';
import { saveScraperTool, listScrapersTool, runScraperTool } from './tools/scrapers.js';
import { executeScript, ExecuteScriptSchema } from './tools/execute.js';
import { downloadResource, DownloadResourceSchema } from './tools/network.js';
import { z } from 'zod';

// Create MCP server
const server = new McpServer({
  name: 'scraper-builder-mcp',
  version: '1.0.0',
});

// Register navigate tool
server.tool(
  navigateTool.name,
  navigateTool.description,
  navigateTool.inputSchema.shape,
  async (params) => {
    const result = await navigateTool.handler(params as Parameters<typeof navigateTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register screenshot tool
server.tool(
  screenshotTool.name,
  screenshotTool.description,
  screenshotTool.inputSchema.shape,
  async (params) => {
    const result = await screenshotTool.handler(params as Parameters<typeof screenshotTool.handler>[0]);
    
    // If result contains an image, return it as an image content type
    if (result && typeof result === 'object' && 'image' in result && result.image) {
      const imageData = result.image as { data: string; mimeType: string };
      return {
        content: [
          { 
            type: 'image' as const, 
            data: imageData.data,
            mimeType: imageData.mimeType
          },
          { type: 'text' as const, text: JSON.stringify({ success: result.success, size: result.size, message: result.message }, null, 2) }
        ]
      };
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register get_page_content tool
server.tool(
  getPageContentTool.name,
  getPageContentTool.description,
  getPageContentTool.inputSchema.shape,
  async (params) => {
    const result = await getPageContentTool.handler(params as Parameters<typeof getPageContentTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register find_elements tool
server.tool(
  findElementsTool.name,
  findElementsTool.description,
  findElementsTool.inputSchema.shape,
  async (params) => {
    const result = await findElementsTool.handler(params as Parameters<typeof findElementsTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register extract_text tool
server.tool(
  extractTextTool.name,
  extractTextTool.description,
  extractTextTool.inputSchema.shape,
  async (params) => {
    const result = await extractTextTool.handler(params as Parameters<typeof extractTextTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register click tool
server.tool(
  clickTool.name,
  clickTool.description,
  clickTool.inputSchema.shape,
  async (params) => {
    const result = await clickTool.handler(params as Parameters<typeof clickTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register type tool
server.tool(
  typeTool.name,
  typeTool.description,
  typeTool.inputSchema.shape,
  async (params) => {
    const result = await typeTool.handler(params as Parameters<typeof typeTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register scroll tool
server.tool(
  scrollTool.name,
  scrollTool.description,
  scrollTool.inputSchema.shape,
  async (params) => {
    const result = await scrollTool.handler(params as Parameters<typeof scrollTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register wait_for tool
server.tool(
  waitForTool.name,
  waitForTool.description,
  waitForTool.inputSchema.shape,
  async (params) => {
    const result = await waitForTool.handler(params as Parameters<typeof waitForTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register save_scraper tool
server.tool(
  saveScraperTool.name,
  saveScraperTool.description,
  saveScraperTool.inputSchema.shape,
  async (params) => {
    const result = await saveScraperTool.handler(params as Parameters<typeof saveScraperTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register list_scrapers tool
server.tool(
  listScrapersTool.name,
  listScrapersTool.description,
  listScrapersTool.inputSchema.shape,
  async (params) => {
    const result = await listScrapersTool.handler();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register run_scraper tool
server.tool(
  runScraperTool.name,
  runScraperTool.description,
  runScraperTool.inputSchema.shape,
  async (params) => {
    const result = await runScraperTool.handler(params as Parameters<typeof runScraperTool.handler>[0]);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// Register execute_javascript tool
server.tool(
  'execute_javascript',
  'Execute JavaScript code in the browser context',
  ExecuteScriptSchema.shape,
  async (params) => {
    const result = await executeScript(params as z.infer<typeof ExecuteScriptSchema>);
    return result;
  }
);

// Register download_resource tool
server.tool(
  'download_resource',
  'Download a resource from a URL using the browser context',
  DownloadResourceSchema.shape,
  async (params) => {
    const result = await downloadResource(params as z.infer<typeof DownloadResourceSchema>);
    return result;
  }
);

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Playwright MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
