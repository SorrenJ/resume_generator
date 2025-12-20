export function parseMarkdownLinks(text: string): (string | { text: string; url: string })[] {
  const parts: (string | { text: string; url: string })[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push({
      text: match[1],
      url: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length === 0 ? [text] : parts;
}

export function insertLink(text: string, linkText: string, linkUrl: string): string {
  const markdownLink = `[${linkText}](${linkUrl})`;
  return text + markdownLink;
}
