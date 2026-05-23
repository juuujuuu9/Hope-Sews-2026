import {
	transactionalColors as c,
	transactionalLayout as layout,
	transactionalTypography as type,
} from "./tokens";
import { escapeHtml } from "./utils";

export type EmailHeaderOptions = {
	logoUrl: string;
	companyName: string;
	contextLabel: string;
};

export function emailHeader({
	logoUrl,
	companyName,
	contextLabel,
}: EmailHeaderOptions): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 24px ${layout.gutter}; background-color: ${c.bgPrimary};" class="dark-bg">
      <table role="presentation" width="${layout.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${layout.maxWidth}; width: 100%;">
        <tr>
          <td align="left">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" width="120" style="display: block; border: 0; max-width: 160px; height: auto;" />
          </td>
          <td align="right" style="font-family: ${type.fontStack}; font-size: ${type.small}; color: ${c.textSecondary};" class="dark-muted">
            ${escapeHtml(contextLabel)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export type EmailHeroOptions = {
	headline: string;
	subheadline: string;
};

export function emailHero({ headline, subheadline }: EmailHeroOptions): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 32px ${layout.gutter}; background-color: ${c.bgSecondary};" class="dark-card">
      <table role="presentation" width="${layout.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${layout.maxWidth}; width: 100%;">
        <tr>
          <td style="font-family: ${type.fontStack};">
            <h1 style="margin: 0 0 16px 0; font-size: ${type.h1}; font-weight: 700; color: ${c.textPrimary}; line-height: 1.3;" class="dark-text">
              ${escapeHtml(headline)}
            </h1>
            <p style="margin: 0; font-size: ${type.body}; color: #444444; line-height: 1.6;" class="dark-muted">
              ${escapeHtml(subheadline)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export type DataCardRow = {
	label: string;
	value: string;
};

export function emailDataCard(rows: DataCardRow[]): string {
	const rowHtml = rows
		.map(
			(row) => `
              <tr>
                <td style="padding-bottom: 12px; border-bottom: 1px solid ${c.bgTertiary};" class="dark-border">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="40%" style="font-family: ${type.fontStack}; font-size: ${type.small}; color: ${c.textMuted}; vertical-align: top;" class="dark-muted">
                        ${escapeHtml(row.label)}
                      </td>
                      <td width="60%" style="font-family: ${type.fontStack}; font-size: ${type.body}; color: ${c.textPrimary}; vertical-align: top;" class="dark-text">
                        ${escapeHtml(row.value)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`,
		)
		.join("");

	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 0 ${layout.gutter} ${layout.sectionGap} ${layout.gutter};">
      <table role="presentation" width="${layout.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${layout.maxWidth}; width: 100%; background-color: ${c.bgPrimary}; border: 1px solid ${c.border}; border-radius: 8px;" class="dark-bg dark-border">
        <tr>
          <td style="padding: 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${rowHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function emailContentBlock(html: string): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 0 ${layout.gutter} ${layout.sectionGap} ${layout.gutter};">
      <table role="presentation" width="${layout.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${layout.maxWidth}; width: 100%;">
        <tr>
          <td style="font-family: ${type.fontStack}; font-size: ${type.body}; color: #444444; line-height: 1.6;" class="dark-muted">
            ${html}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export type EmailCtaOptions = {
	url: string;
	text: string;
};

export function emailCta({ url, text }: EmailCtaOptions): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: ${layout.sectionGap} ${layout.gutter};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="cta-button">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: ${c.accent};" bgcolor="${c.accent}">
            <a href="${escapeHtml(url)}" target="_blank" style="display: inline-block; padding: 16px 32px; font-family: ${type.fontStack}; font-size: ${type.body}; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; min-width: 200px; text-align: center;">
              ${escapeHtml(text)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export type EmailFooterOptions = {
	companyName: string;
	supportEmail: string;
	reasonForEmail: string;
	siteUrl: string;
};

export function emailFooter({
	companyName,
	supportEmail,
	reasonForEmail,
	siteUrl,
}: EmailFooterOptions): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 32px ${layout.gutter}; background-color: ${c.bgSecondary}; border-top: 1px solid ${c.border};" class="dark-card dark-border">
      <table role="presentation" width="${layout.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${layout.maxWidth}; width: 100%;">
        <tr>
          <td style="padding-bottom: 16px; text-align: center; font-family: ${type.fontStack}; font-size: ${type.small}; color: ${c.textSecondary}; line-height: 1.6;" class="dark-muted">
            Questions? Email <a href="mailto:${escapeHtml(supportEmail)}" style="color: ${c.accent}; text-decoration: underline;">${escapeHtml(supportEmail)}</a>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-family: ${type.fontStack}; font-size: ${type.caption}; color: ${c.textMuted}; line-height: 1.5;" class="dark-muted">
            <p style="margin: 0 0 8px 0;">
              ${escapeHtml(companyName)}
            </p>
            <p style="margin: 0 0 8px 0;">
              You're receiving this email because ${escapeHtml(reasonForEmail)}.
            </p>
            <p style="margin: 0;">
              <a href="${escapeHtml(siteUrl)}" style="color: ${c.textSecondary}; text-decoration: underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}
