const replacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

// Escapes a value for use as HTML text or inside a quoted attribute. The consent text comes from the API and the
// widget runs in the embedding site's origin, so every API value goes through this before it reaches innerHTML.
export function escapeHtml(value: unknown): string {
    return String(value).replace(/[&<>"']/g, ch => replacements[ch]);
}
