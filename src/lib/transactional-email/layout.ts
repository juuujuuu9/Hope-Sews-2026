import { transactionalLayout as layout } from "./tokens";
import { escapeHtml, hidePreheader } from "./utils";

export type TransactionalEmailOptions = {
	preheader: string;
	title: string;
	body: string;
};

export function wrapTransactionalEmail({
	preheader,
	title,
	body,
}: TransactionalEmailOptions): string {
	return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: #2563eb; }
    @media screen and (max-width: 480px) {
      h1 { font-size: 24px !important; }
      .cta-button a { display: block !important; width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
    }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #1a1a1a !important; }
      .dark-text { color: #e5e5e5 !important; }
      .dark-border { border-color: #404040 !important; }
      .dark-card { background-color: #262626 !important; }
      .dark-muted { color: #a3a3a3 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  ${hidePreheader(preheader)}
  <div role="region" aria-label="Skip to content">
    <a href="#main-content" style="display: block; height: 1px; width: 1px; overflow: hidden;">Skip to main content</a>
  </div>
  <!--[if mso]>
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${layout.maxWidth}" align="center" style="width:${layout.maxWidth};">
    <tr><td>
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td id="main-content" role="main" align="center">
        ${body}
      </td>
    </tr>
  </table>
  <!--[if mso]>
    </td></tr>
  </table>
  <![endif]-->
</body>
</html>`;
}
