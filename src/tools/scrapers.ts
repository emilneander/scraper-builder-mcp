import { z } from 'zod';
import fs from 'fs';
import path from 'path';

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export const saveScraperTool = {
  name: 'save_scraper',
  description: 'CRITICAL: Save a reusable TypeScript scraper. You MUST ALWAYS follow this with "run_scraper" immediately to verify it works and fix any errors. Use "directory" to save in the user\'s project folder.',
  inputSchema: z.object({
    name: z.string().describe('Name of the scraper (e.g., "worldcup_odds"). Will be sanitized to safe filename.'),
    code: z.string().describe('The full TypeScript code for the scraper.'),
    directory: z.string().optional().describe('Optional: absolute path to save scrapers. Defaults to the current project\'s root directory.'),
    overwrite: z.boolean().optional().describe('Overwrite existing scraper if it exists. Default: false')
  }),
  handler: async (params: { name: string; code: string; directory?: string; overwrite?: boolean }) => {
    const baseDir = params.directory || process.cwd();
    const scrapersDir = path.join(baseDir, 'scrapers');
    const dataDir = path.join(baseDir, 'data');

    // Ensure directories exist
    ensureDirectoryExists(scrapersDir);
    ensureDirectoryExists(dataDir);

    // Sanitize filename
    const safeName = params.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `${safeName}.ts`;
    const filePath = path.join(scrapersDir, filename);

    if (fs.existsSync(filePath) && !params.overwrite) {
      return {
        success: false,
        error: `Scraper "${filename}" already exists. Set overwrite: true to replace it.`
      };
    }

    try {
      fs.writeFileSync(filePath, params.code);

      // Validation
      let validation = 'TypeScript Check Passed';
      try {
        const projectRoot = process.cwd();
        
        // 1. Check if the code implements the correct data directory pattern
        // We look for: path.join(..., 'data', scraperName) or similar
        const hasCorrectDataPath = params.code.includes("path.join(process.cwd(), 'data', scraperName)") || 
                                   params.code.includes("path.join(process.cwd(), 'data', '") ||
                                   params.code.includes('data/${scraperName}');
        
        if (!hasCorrectDataPath) {
             validation = `⚠️ Data Path Warning:
The scraper does not seem to save data to a subdirectory (e.g., "data/scraper_name/"). 
Please ensure your code defines:
  const scraperName = '${safeName.replace('.ts', '')}';
  const dataDir = path.join(process.cwd(), 'data', scraperName);
This is required for the "run_scraper" tool to find your data.`;
        } else {
             // 2. Run TypeScript compiler check
             require('child_process').execSync('npx tsc --noEmit', { 
                 cwd: projectRoot, 
                 stdio: 'pipe', 
                 encoding: 'utf-8' 
             });
        }
      } catch (error: any) {
        const output = error.stdout || error.message;
        const shortOutput = output.length > 500 ? output.substring(0, 500) + '...' : output;
        validation = `⚠️ TypeScript Validation Failed:\n${shortOutput}`;
      }

      return {
        success: true,
        message: `Scraper saved to ${filePath}. NEXT STEP: You MUST now call "run_scraper" with name "${safeName}" to verify the scraper works correctly in this environment.`,
        validation_status: validation,
        path: filePath,
        current_working_directory: baseDir
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to save scraper: ${error.message}`
      };
    }
  }
};

export const listScrapersTool = {
  name: 'list_scrapers',
  description: 'List all saved scraper scripts. Use this to see what scrapers are available to run.',
  inputSchema: z.object({
    directory: z.string().optional().describe('Optional: absolute path where scrapers are stored. Defaults to the current project\'s root directory.')
  }),
  handler: async (params: { directory?: string }) => {
    const baseDir = params.directory || process.cwd();
    const scrapersDir = path.join(baseDir, 'scrapers');

    if (!fs.existsSync(scrapersDir)) {
      return {
        success: true,
        scrapers: [],
        message: 'No scrapers directory found.'
      };
    }

    const files = fs.readdirSync(scrapersDir)
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .map(f => ({
        name: f,
        path: path.join(scrapersDir, f),
        size: fs.statSync(path.join(scrapersDir, f)).size
      }));

    return {
      success: true,
      count: files.length,
      scrapers: files,
      current_working_directory: baseDir
    };
  }
};

export const runScraperTool = {
  name: 'run_scraper',
  description: 'Execute a saved scraper and get fresh data. ALWAYS run this after save_scraper to verify the scraper works correctly.',
  inputSchema: z.object({
    name: z.string().describe('Name of the scraper to run (e.g., "worldcup_odds_2026"). Do not include .ts extension.'),
    directory: z.string().optional().describe('Optional: absolute path where scrapers are stored. Defaults to the current project\'s root directory.')
  }),
  handler: async (params: { name: string; directory?: string }) => {
    const baseDir = params.directory || process.cwd();
    const scrapersDir = path.join(baseDir, 'scrapers');
    const safeName = params.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const scriptPath = path.join(scrapersDir, `${safeName}.ts`);

    if (!fs.existsSync(scriptPath)) {
      return {
        success: false,
        error: `Scraper script not found: ${scriptPath}`
      };
    }

    try {
        // Execute the scraper
        // We use npx tsx to execute typescript directly
        const projectRoot = process.cwd();
        require('child_process').execSync(`npx tsx "${scriptPath}"`, { 
            cwd: projectRoot,
            stdio: 'pipe',
            encoding: 'utf-8'
        });

        // Find the latest data file
        const dataDir = path.join(baseDir, 'data', safeName);
        if (!fs.existsSync(dataDir)) {
             return {
                success: true,
                message: 'Scraper ran successfully, but no data directory was found for this scraper.',
                data: null
             };
        }

        const files = fs.readdirSync(dataDir)
                        .filter(f => f.endsWith('.json'))
                        .sort()
                        .reverse(); // Newest first

        if (files.length === 0) {
             return {
                success: true,
                message: 'Scraper ran successfully, but no JSON data files were found.',
                data: null
             };
        }

        const latestFile = path.join(dataDir, files[0]);
        const content = fs.readFileSync(latestFile, 'utf-8');
        const jsonData = JSON.parse(content);

        return {
            success: true,
            message: `Scraper executed successfully. Retrieved data from ${files[0]}`,
            data_file: latestFile,
            data: jsonData,
            current_working_directory: baseDir
        };

    } catch (error: any) {
        const output = error.stdout || error.message;
        return {
            success: false,
            error: `Failed to run scraper: ${error.message}\nOutput: ${output}`
        };
    }
  }
};
