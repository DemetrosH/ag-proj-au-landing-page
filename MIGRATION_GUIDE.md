# Project Migration Guide

To continue working on this project on another computer, follow these instructions to set up the environment correctly.

## 1. Core Software Requirements
*   **Node.js**: Version **18.0.0 or higher** (as specified in `package.json`).
*   **NPM**: Version **11.12.1** (or compatible latest version).

## 2. Project Files & Environment
*   **Project Folder**: Move the entire `ag-proj-au-landing-page` directory.
*   **Environment Variables**: Ensure the `.env.local` file is copied to the new computer. It contains critical Sanity API tokens and Project IDs.
    *   *Path*: `/.env.local`
*   **NPM Configuration**: Ensure the `.npmrc` file is included.
    *   *Path*: `/.npmrc`

## 3. Developer Tools
*   **Turbo**: The project uses TurboRepo. It is included in `devDependencies`, but you can also install it globally:
    ```bash
    npm install -g turbo
    ```

## 4. AI Assistant Requirements (Antigravity)
If you are using Antigravity on the new computer, ensure the following MCP servers are configured in your IDE:
*   **Sanity MCP Server**: To interact with the CMS.
*   **Firecrawl MCP Server**: For web research and scraping.
*   **Filesystem & Browser Tools**: For code editing and previewing.

## 5. Setup Steps
1.  **Install Node.js** (v18+).
2.  **Clone or Copy** the project folder to the new computer.
3.  **Verify `.env.local`**: Make sure it exists in the root.
4.  **Install Dependencies**:
    ```bash
    npm install
    ```
5.  **Start Development Server**:
    ```bash
    npm run dev
    ```

---
*Last Updated: May 6, 2026*
