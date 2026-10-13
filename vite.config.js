import { defineConfig } from 'vite';

// Local builds also work at /; the Pages workflow supplies its repository path.
export default defineConfig({ base: process.env.PAGES_BASE_PATH || './' });
