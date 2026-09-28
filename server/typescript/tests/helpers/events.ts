import assert from "node:assert/strict";
import {
	EMPTY_SSE_DATA_REGEX,
	EVENT_STREAM_REGEX,
} from "../../../../shared/regex";

export async function subscribe(url: string) {
	const controller = new AbortController();
	const response = await fetch(`${url}/api/events`, {
		signal: controller.signal,
	});
	assert.match(response.headers.get("content-type") ?? "", EVENT_STREAM_REGEX);
	assert(response.body);
	const reader = response.body.getReader();
	let buffer = "";
	const decoder = new TextDecoder();
	return {
		async receive() {
			for (;;) {
				const boundary = buffer.indexOf("\n\n");
				if (boundary >= 0) {
					const event = buffer.slice(0, boundary);
					buffer = buffer.slice(boundary + 2);
					if (EMPTY_SSE_DATA_REGEX.test(event)) return;
				} else {
					const chunk = await reader.read();
					assert(!chunk.done, "Event stream closed before notification");
					buffer += decoder.decode(chunk.value, { stream: true });
				}
			}
		},
		close: () => controller.abort(),
	};
}
