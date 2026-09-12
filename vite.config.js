import { defineConfig } from 'vite';
import { execSync } from 'child_process';

let gitHash = 'unknown';
let gitCount = '0';
let gitMessage = '';
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  gitCount = execSync('git rev-list --count HEAD').toString().trim();
  gitMessage = execSync('git log -1 --pretty=%s').toString().trim();
} catch (e) {
  // fallback if git is not available
}

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
    __GIT_COUNT__: JSON.stringify(gitCount),
    __GIT_MESSAGE__: JSON.stringify(gitMessage),
  },
});
