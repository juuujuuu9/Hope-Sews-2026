function optional(name: string): string | undefined {
	for (const source of [import.meta.env[name], process.env[name]]) {
		if (typeof source === "string" && source.trim() !== "") {
			return source.trim();
		}
	}
	return undefined;
}

export function parseEmailList(value: string | undefined): string[] {
	if (!value) {
		return [];
	}

	return [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))];
}

export function getSupabaseConfig() {
	const url =
		optional("SUPABASE_URL") ?? optional("NEXT_PUBLIC_SUPABASE_URL");
	const serviceRoleKey = optional("SUPABASE_SERVICE_ROLE_KEY");

	if (!url || !serviceRoleKey) {
		throw new Error(
			"Missing Supabase config (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)",
		);
	}

	return { url, serviceRoleKey };
}

export function getMissingResendConfigKeys(): string[] {
	const missing: string[] = [];
	if (!optional("RESEND_API_KEY")) {
		missing.push("RESEND_API_KEY");
	}
	if (!optional("CONTACT_FROM_EMAIL")) {
		missing.push("CONTACT_FROM_EMAIL");
	}
	if (parseEmailList(optional("CONTACT_NOTIFY_EMAIL")).length === 0) {
		missing.push("CONTACT_NOTIFY_EMAIL");
	}
	return missing;
}

export function getResendConfig() {
	const apiKey = optional("RESEND_API_KEY");
	const from = optional("CONTACT_FROM_EMAIL");
	const notify = parseEmailList(optional("CONTACT_NOTIFY_EMAIL"));

	if (!apiKey || !from || notify.length === 0) {
		return null;
	}

	return { apiKey, from, notify };
}

export function getSiteConfig() {
	const url = optional("SITE_URL") ?? "https://hopesews.com";
	const supportEmail =
		optional("CONTACT_SUPPORT_EMAIL") ??
		optional("CONTACT_FROM_EMAIL") ??
		"hello@hopesews.com";
	const normalizedUrl = url.replace(/\/$/, "");
	const logoUrl =
		optional("SITE_LOGO_URL") ?? `${normalizedUrl}/img/logo-wip7.webp`;

	return {
		url: normalizedUrl,
		supportEmail,
		logoUrl,
	};
}
