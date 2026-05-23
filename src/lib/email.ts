import {
	emailContentBlock,
	emailCta,
	emailDataCard,
	emailFooter,
	emailHeader,
	emailHero,
} from "./transactional-email/components";
import { wrapTransactionalEmail } from "./transactional-email/layout";

const COMPANY_NAME = "Hope Sews";
const INSTAGRAM_URL = "https://www.instagram.com/hope_sews/";

export type SubscriberEmailContext = {
	email: string;
	siteUrl: string;
	supportEmail: string;
	logoUrl: string;
	subscribedAt: Date;
};

function formatTimestamp(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "full",
		timeStyle: "short",
		timeZone: "UTC",
		timeZoneName: "short",
	}).format(date);
}

export function renderSubscriberWelcomeEmail(ctx: SubscriberEmailContext): {
	html: string;
	text: string;
	subject: string;
	preheader: string;
} {
	const subject = "You're on the list — Hope Sews";
	const preheader =
		"Thank you for joining. Updates on culture, circular design, and artisan stories ahead.";

	const body = [
		emailHeader({
			logoUrl: ctx.logoUrl,
			companyName: COMPANY_NAME,
			contextLabel: "Welcome",
		}),
		emailHero({
			headline: "You're on the list",
			subheadline:
				"Thank you for staying in touch. We'll share updates on culture, circular design, and stories from artisans around the world.",
		}),
		emailContentBlock(`
            <p style="margin: 0 0 16px 0;">What to expect:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Early news on collections and projects</li>
              <li style="margin-bottom: 8px;">Stories behind the textiles and makers we work with</li>
              <li>Invitations when something new is ready to share</li>
            </ul>`),
		emailCta({
			url: INSTAGRAM_URL,
			text: "Follow on Instagram",
		}),
		emailFooter({
			companyName: COMPANY_NAME,
			supportEmail: ctx.supportEmail,
			reasonForEmail: "you signed up on hopesews.com",
			siteUrl: ctx.siteUrl,
		}),
	].join("");

	const html = wrapTransactionalEmail({
		preheader,
		title: subject,
		body,
	});

	const text = `${COMPANY_NAME} — ${subject}

You're on the list

Thank you for staying in touch. We'll share updates on culture, circular design, and stories from artisans around the world.

What to expect:
- Early news on collections and projects
- Stories behind the textiles and makers we work with
- Invitations when something new is ready to share

Follow on Instagram: ${INSTAGRAM_URL}

---

Questions? Email ${ctx.supportEmail}

${COMPANY_NAME}
${ctx.siteUrl}

You're receiving this email because you signed up on hopesews.com.`;

	return { html, text, subject, preheader };
}

export function renderAdminSubscriberNotification(ctx: SubscriberEmailContext): {
	html: string;
	text: string;
	subject: string;
	preheader: string;
} {
	const subject = `New subscriber: ${ctx.email}`;
	const preheader = `Landing page signup from ${ctx.email}`;

	const body = [
		emailHeader({
			logoUrl: ctx.logoUrl,
			companyName: COMPANY_NAME,
			contextLabel: "Admin notification",
		}),
		emailHero({
			headline: "New landing page signup",
			subheadline: "Someone joined the Hope Sews email list.",
		}),
		emailDataCard([
			{ label: "Email", value: ctx.email },
			{ label: "Signed up", value: formatTimestamp(ctx.subscribedAt) },
			{ label: "Source", value: "hopesews.com landing page" },
		]),
		emailFooter({
			companyName: COMPANY_NAME,
			supportEmail: ctx.supportEmail,
			reasonForEmail: "you receive admin notifications for Hope Sews signups",
			siteUrl: ctx.siteUrl,
		}),
	].join("");

	const html = wrapTransactionalEmail({
		preheader,
		title: subject,
		body,
	});

	const text = `${COMPANY_NAME} — ${subject}

New landing page signup

Email: ${ctx.email}
Signed up: ${formatTimestamp(ctx.subscribedAt)}
Source: hopesews.com landing page

---

${COMPANY_NAME}
${ctx.siteUrl}`;

	return { html, text, subject, preheader };
}
