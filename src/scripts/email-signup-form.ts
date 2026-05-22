type FormState = "idle" | "submitting" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
	invalid_email: "enter a valid email address.",
	invalid_json: "something went wrong. try again.",
	storage_failed: "could not save your email. try again.",
};

function setState(
	root: HTMLElement,
	state: FormState,
	message = "",
) {
	root.dataset.state = state;
	const status = root.querySelector<HTMLElement>("[data-signup-status]");
	if (status) {
		status.textContent = message;
	}
	const submit = root.querySelector<HTMLButtonElement>("[type='submit']");
	if (submit) {
		submit.disabled = state === "submitting" || state === "success";
	}
}

export function initEmailSignupForm(root: HTMLElement) {
	const form = root.querySelector<HTMLFormElement>("form");
	if (!form) {
		return;
	}

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (root.dataset.state === "submitting" || root.dataset.state === "success") {
			return;
		}

		const formData = new FormData(form);
		const email = String(formData.get("email") ?? "").trim();
		const website = String(formData.get("website") ?? "").trim();

		if (!email) {
			setState(root, "error", ERROR_MESSAGES.invalid_email);
			return;
		}

		setState(root, "submitting");

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, website }),
			});

			const data = (await response.json()) as {
				ok?: boolean;
				error?: string;
			};

			if (!response.ok || !data.ok) {
				const key = data.error ?? "storage_failed";
				setState(root, "error", ERROR_MESSAGES[key] ?? ERROR_MESSAGES.storage_failed);
				return;
			}

			form.reset();
			setState(root, "success", "thank you — you're on the list.");
		} catch {
			setState(root, "error", ERROR_MESSAGES.storage_failed);
		}
	});
}
