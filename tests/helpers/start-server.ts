import { startTestServer } from "../../server/typescript/tests/helpers/server";

const api = await startTestServer(3002);
console.log(`Browser test API: ${api.url}`);
for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.once(signal, async () => {
		await api.close();
		process.exit(0);
	});
}
