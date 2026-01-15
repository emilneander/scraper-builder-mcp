# Scraper Builder MCP

Build, save, and run web scrapers with AI assistance. An MCP server that lets AI agents explore websites and generate reusable TypeScript scrapers.

## Why This MCP?

Other browser MCPs help AI extract data once. This one saves **reusable TypeScript scrapers** you can run anytime — in scripts, cron jobs, or pipelines.

## Usage Examples

### Creating a Scraper

Just describe what you want and provide a JSON schema:

> "**Use scraper-builder-mcp** to create a scraper for https://example.com/jobs  
> Extract data matching this schema:
> ```json
> { "title": "string", "company": "string", "location": "string", "url": "string" }
> ```
> Save it as `example_jobs` and run it to verify it works"

The AI will:
1. Navigate to the page and take a screenshot
2. Explore the DOM to find the right selectors
3. Write a TypeScript scraper that outputs your schema
4. Save it to your project folder
5. Run it to verify it works (and fix if needed)

**Tips:**
- If your IDE has built-in browser tools, say **"use scraper-builder-mcp"** explicitly
- Scrapers save to `scrapers/` and data to `data/` in your **project root**
- Always ask the AI to run the scraper after saving to catch issues early

### Running a Saved Scraper

> "Run the `example_jobs` scraper"

Or:

> "List my scrapers"

### More Examples

| You say... | AI does... |
|------------|------------|
| "Scrape the top 10 products from this page" | Explores, extracts, returns data |
| "Save this as a reusable scraper called `products`" | Saves to `scrapers/products.ts` |
| "Run the products scraper" | Runs scraper, saves data to `data/products/`, returns results |
| "The website changed, update the products scraper" | Edits the saved scraper |

## Quick Start

### Install via npx (Recommended)

Add to your MCP config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "scraper-builder-mcp": {
      "command": "npx",
      "args": ["-y", "scraper-builder-mcp"]
    }
  }
}
```

### Auto-Approve Permissions (Recommended)

To avoid confirming every tool execution (like taking screenshots or scrolling), follow these steps for your client:

| Client | How to Auto-Approve |
| :--- | :--- |
| **Cursor** | Add `scraper-builder-mcp:*` to the **MCP Allowlist** in Settings. |
| **Claude Desktop** | Click **"Always approve"** when the first tool permission prompt appears. |
| **Windsurf / Others** | Approve when prompted; most clients will remember your choice for the session or permanently. |

<details>
<summary><b>Full list of tools for granular Cursor whitelisting</b></summary>

If you prefer not to use a wildcard, add these individually:
```
scraper-builder-mcp:navigate
scraper-builder-mcp:screenshot
scraper-builder-mcp:get_page_content
scraper-builder-mcp:find_elements
scraper-builder-mcp:extract_text
scraper-builder-mcp:click
scraper-builder-mcp:type
scraper-builder-mcp:scroll
scraper-builder-mcp:wait_for
scraper-builder-mcp:execute_javascript
scraper-builder-mcp:download_resource
scraper-builder-mcp:save_scraper
scraper-builder-mcp:list_scrapers
scraper-builder-mcp:run_scraper
```
</details>

To show the browser window while scraping, add:
```json
{
  "mcpServers": {
    "scraper-builder-mcp": {
      "command": "npx",
      "args": ["-y", "scraper-builder-mcp"],
      "env": { "HEADED": "true" }
    }
  }
}
```

Chromium will be installed automatically on first use.

### Install from Source

```bash
git clone https://github.com/emilneander/scraper-builder-mcp.git
cd scraper-builder-mcp
npm install
npm run build
```

Then point your MCP config to `dist/index.js`.

## Tools

### Scraper Workflow

| Tool | Description |
|------|-------------|
| `save_scraper` | Save a reusable TypeScript scraper script |
| `list_scrapers` | List all saved scrapers |
| `run_scraper` | Execute a saved scraper and get fresh data |

### Browser Automation

| Tool | Description |
|------|-------------|
| `navigate` | Go to a URL for web scraping |
| `screenshot` | Capture page for visual analysis |
| `get_page_content` | Get HTML or simplified DOM for finding selectors |
| `find_elements` | Test CSS selectors and verify matches |
| `extract_text` | Preview data extraction results |
| `click` | Click on an element |
| `type` | Type into input fields |
| `scroll` | Scroll the page (handles lazy loading) |
| `wait_for` | Wait for elements or network idle |
| `execute_javascript` | Run JS in browser context |
| `download_resource` | Download files with browser cookies/auth |

## License

MIT
