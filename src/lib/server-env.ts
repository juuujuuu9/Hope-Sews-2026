function optional(name: string): string | undefined {
	const value = import.meta.env[name];
	if (typeof value !== "string" || value.trim() === "") {
		return undefined;
	}
	return value.trim();
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

export function getResendConfig() {
	const apiKey = optional("RESEND_API_KEY");
	const from = optional("CONTACT_FROM_EMAIL");
	const notify = optional("CONTACT_NOTIFY_EMAIL");

	if (!apiKey || !from || !notify) {
		return null;
	}

	return { apiKey, from, notify };
}
