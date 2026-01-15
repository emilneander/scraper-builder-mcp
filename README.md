# Scraper Builder MCP

Build, save, and run web scrapers with AI assistance. An MCP server that lets AI agents explore websites and generate reusable TypeScript scrapers.

## Why This MCP?

Other browser MCPs help AI extract data once. This one creates **reusable scrapers** you can:

- Run on a **cron job** for automated data collection
- Execute in **CI/CD pipelines** for testing or monitoring
- Use in your own scripts for **production workflows**
- Modify and maintain as the target website changes


## Usage Examples

### Creating a Scraper

Just describe what you want and provide a JSON schema:

> "Create a scraper for https://example.com/jobs  
> Extract data matching this schema:
> ```json
> { "title": "string", "company": "string", "location": "string", "url": "string" }
> ```
> Save it as `example_jobs`"

The AI will:
1. Navigate to the page and take a screenshot
2. Explore the DOM to find the right selectors
3. Write a TypeScript scraper that outputs your schema
4. Save it for reuse

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
  "scraper-builder-mcp": {
    "command": "npx",
    "args": ["-y", "scraper-builder-mcp"]
  }
}
```

To show the browser window while scraping, add:
```json
{
  "scraper-builder-mcp": {
    "command": "npx",
    "args": ["-y", "scraper-builder-mcp"],
    "env": { "HEADED": "true" }
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
| `save_scraper` | Save a TypeScript scraper to `scrapers/` |
| `list_scrapers` | List all saved scrapers |
| `run_scraper` | Execute a saved scraper and get results |

### Browser Automation

| Tool | Description |
|------|-------------|
| `navigate` | Go to a URL |
| `screenshot` | Capture page as image for AI analysis |
| `get_page_content` | Get HTML or simplified DOM structure |
| `find_elements` | Query DOM with CSS selectors |
| `extract_text` | Get text content from elements |
| `click` | Click on an element |
| `type` | Type into input fields |
| `scroll` | Scroll the page (handles lazy loading) |
| `wait_for` | Wait for elements or network idle |
| `execute_javascript` | Run JS in browser context |
| `download_resource` | Download files with browser cookies/auth |

## License

MIT
