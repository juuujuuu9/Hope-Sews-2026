import type { APIRoute } from "astro";
import {
	parseContactPayload,
	saveContactSubmission,
	sendContactEmails,
} from "../../lib/contact";

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export const POST: APIRoute = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: "invalid_json" }, 400);
	}

	const payload = parseContactPayload(body);
	if (!payload) {
		return json({ ok: false, error: "invalid_email" }, 400);
	}

	let duplicate = false;
	try {
		({ duplicate } = await saveContactSubmission(payload.email));
	} catch (err) {
		console.error("[contact] supabase insert failed", err);
		return json({ ok: false, error: "storage_failed" }, 500);
	}

	if (!duplicate) {
		try {
			await sendContactEmails(payload.email);
		} catch (err) {
			console.error("[contact] resend failed (submission saved)", err);
		}
	}

	return json({ ok: true }, 200);
};
