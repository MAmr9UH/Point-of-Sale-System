import fs from 'fs'

function loadEnv() {
  if (process.env.NODE_ENV === 'production') {
    // In production, we assume environment variables are set properly.
    return;
  }

  try {
    // 1. Get the path to the .env file
    const envPath = process.cwd().endsWith("server") ? "./.env" : "../.env";

    // 2. Read the file's contents into a string
    const envFileContent = fs.readFileSync(envPath, { encoding: 'utf-8' });

    // 3. Split the string into an array of lines
    const lines = envFileContent.split('\n');

    for (const line of lines) {
      // 4. Ignore comments (lines starting with '#') and empty lines
      if (line.startsWith('#') || line.trim().length === 0) {
        continue;
      }

      // 5. Split the line into a key and value
      // We only split on the *first* equals sign
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) {
        continue; // Skip malformed lines
      }

      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();
      
      // 6. Basic handling for quotes (remove them)
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 7. IMPORTANT: Only set the variable if it's not *already* set
      // This gives real environment variables precedence
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    // Ignore errors (e.g., file not found).
    // In a real app, you might want to log this.
    // console.warn('Could not load .env file', err.message);
    console.warn('Could not load .env file', err);
  }
}

// Export the function so it can be used by other files
export { loadEnv };