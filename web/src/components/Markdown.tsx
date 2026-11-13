import { marked } from "marked"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function Markdown({ source }: { source: string }) {
  const html = marked.parse(escapeHtml(source), { async: false }) as string
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}
