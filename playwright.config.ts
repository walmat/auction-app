import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	workers: 1,
	use: { baseURL: "http://127.0.0.1:5174", trace: "retain-on-failure" },
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: [
		{
			command:
				"node --import ./server/typescript/node_modules/tsx/dist/loader.mjs tests/helpers/start-server.ts",
			url: "http://127.0.0.1:3002/api/listings",
			reuseExistingServer: false,
		},
		{
			command: "npm run dev -- --host 127.0.0.1 --port 5174 --strictPort",
			url: "http://127.0.0.1:5174",
			env: { API_TARGET: "http://127.0.0.1:3002" },
			reuseExistingServer: false,
		},
	],
});
