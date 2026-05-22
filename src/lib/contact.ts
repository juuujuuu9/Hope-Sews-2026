import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getResendConfig, getSupabaseConfig } from "./server-env";

const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactPayload = {
	email: string;
	website?: string;
};

export function parseContactPayload(body: unknown): ContactPayload | null {
	if (!body || typeof body !== "object") {
		return null;
	}

	const record = body as Record<string, unknown>;
	const email =
		typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
	const website =
		typeof record.website === "string" ? record.website.trim() : undefined;

	if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
		return null;
	}

	if (website) {
		return null;
	}

	return { email, website };
}

export async function saveContactSubmission(email: string) {
	const { url, serviceRoleKey } = getSupabaseConfig();
	const supabase = createClient(url, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});

	const { error } = await supabase.from("contact_submissions").insert({ email });

	if (error) {
		if (error.code === "23505") {
			return { duplicate: true as const };
		}
		throw error;
	}

	return { duplicate: false as const };
}

export async function sendContactEmails(email: string) {
	const resendConfig = getResendConfig();
	if (!resendConfig) {
		return;
	}

	const resend = new Resend(resendConfig.apiKey);
	const siteName = "Hope Sews";

	await Promise.all([
		resend.emails.send({
			from: resendConfig.from,
			to: resendConfig.notify,
			subject: `New signup: ${email}`,
			text: `A new email was submitted on the Hope Sews landing page.\n\nEmail: ${email}`,
		}),
		resend.emails.send({
			from: resendConfig.from,
			to: email,
			subject: "You're on the list — Hope Sews",
			text: `Thank you for staying in touch with ${siteName}.

We'll share updates on culture, circular design, and stories from artisans around the world.

— Hope Sews`,
		}),
	]);
}
