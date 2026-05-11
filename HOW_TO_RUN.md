# How to Run the Local Development Server

To start the development environment for this project, follow these steps:

1. **Open your terminal** (Command Prompt, PowerShell, or any terminal of your choice).
2. **Navigate to the project root directory**:
   ```bash
   cd c:\Users\Mitja\Desktop\ag-proj-au-landing-page
   ```
3. **Install dependencies** (if you haven't already or if you've added new packages):
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

### What happens next?
- **Turbo** will orchestrate the startup of all applications in the `apps/` directory.
- You can access the different apps at their respective local URLs (usually `http://localhost:3000`, `http://localhost:3001`, etc.).
- The terminal will show the logs for all running applications.

### Troubleshooting
- If you encounter "Module not found" errors, ensure you are running the command from the root directory.
- If a port is already in use, you might need to stop the previous process or Turbo will automatically try the next available port.
