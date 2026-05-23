import { createClient } from "@supabase/supabase-js";
import { type CreateEmailResponse, Resend } from "resend";
import {
	renderAdminSubscriberNotification,
	renderSubscriberWelcomeEmail,
} from "./email";
import {
	getMissingResendConfigKeys,
	getResendConfig,
	getSiteConfig,
	getSupabaseConfig,
} from "./server-env";

function assertResendSendResult(label: string, result: CreateEmailResponse) {
	if (result.error) {
		throw new Error(
			`[contact] resend ${label} failed: ${result.error.message}`,
		);
	}

	console.info(`[contact] resend ${label} sent`, result.data?.id ?? "unknown-id");
}

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

export async function saveSubscriber(email: string) {
	const { url, serviceRoleKey } = getSupabaseConfig();
	const supabase = createClient(url, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});

	const { error } = await supabase.from("subscribers").insert({ email });

	if (error) {
		if (error.code === "23505") {
			return { duplicate: true as const };
		}
		throw error;
	}

	return { duplicate: false as const };
}

export async function sendSubscriberEmails(email: string) {
	const resendConfig = getResendConfig();
	if (!resendConfig) {
		console.warn(
			"[contact] resend skipped: missing config",
			getMissingResendConfigKeys().join(", "),
		);
		return;
	}

	const site = getSiteConfig();
	const subscribedAt = new Date();
	const emailContext = {
		email,
		siteUrl: site.url,
		supportEmail: site.supportEmail,
		logoUrl: site.logoUrl,
		subscribedAt,
	};

	const adminEmail = renderAdminSubscriberNotification(emailContext);
	const welcomeEmail = renderSubscriberWelcomeEmail(emailContext);
	const resend = new Resend(resendConfig.apiKey);

	const [adminResult, welcomeResult] = await Promise.all([
		resend.emails.send({
			from: resendConfig.from,
			to: resendConfig.notify,
			replyTo: email,
			subject: adminEmail.subject,
			html: adminEmail.html,
			text: adminEmail.text,
			headers: {
				"X-Entity-Ref-ID": `subscriber-admin-${subscribedAt.getTime()}`,
			},
		}),
		resend.emails.send({
			from: resendConfig.from,
			to: email,
			replyTo: site.supportEmail,
			subject: welcomeEmail.subject,
			html: welcomeEmail.html,
			text: welcomeEmail.text,
			headers: {
				"X-Entity-Ref-ID": `subscriber-welcome-${subscribedAt.getTime()}`,
			},
		}),
	]);

	assertResendSendResult("admin notification", adminResult);
	assertResendSendResult("welcome email", welcomeResult);
}
