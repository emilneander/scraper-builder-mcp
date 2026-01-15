---
trigger: always_on
---

## npm Publishing (for npm packages only)

When making changes to a published npm package:
1. Update code/docs as needed
2. Bump version in package.json
3. Commit changes:
   - If only bumping version: `chore: bump version to X.X.X`
   - If including code changes: use relevant type (`feat`, `fix`, etc.)
4. `git push`
5. `npm publish`