import { app } from "./app";
import { watchExpirations } from "./events";

const port = Number(process.env.PORT ?? 3001);
watchExpirations();
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
