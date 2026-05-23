export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function hidePreheader(text: string): string {
	const filler = "&nbsp;&zwnj;".repeat(30);
	return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(text)}${filler}</div>`;
}
