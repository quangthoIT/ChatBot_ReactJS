import { marked } from "marked";

export function convertMarkdownToHTML(markdownText) {
  return marked.parse(markdownText); // Hoặc `marked(markdownText)` tùy phiên bản
}
