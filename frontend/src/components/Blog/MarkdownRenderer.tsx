interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown renderer - can be enhanced with a library later
  const renderMarkdown = (text: string) => {
    let html = text;

    // HTML blocks - preserve raw HTML between <html> tags or in code blocks with html language
    // First, extract and preserve HTML blocks
    const htmlBlocks: string[] = [];
    html = html.replace(/```html\n?([\s\S]*?)```/gim, (_match, htmlContent) => {
      const id = `__HTML_BLOCK_${htmlBlocks.length}__`;
      htmlBlocks.push(htmlContent.trim());
      return id;
    });

    // Also support <div class="chart"> or similar wrapper tags
    html = html.replace(/<div[^>]*class=["']chart[^"']*["'][^>]*>([\s\S]*?)<\/div>/gim, (_match, htmlContent) => {
      const id = `__HTML_BLOCK_${htmlBlocks.length}__`;
      htmlBlocks.push(htmlContent.trim());
      return id;
    });

    // Code blocks first (before other processing)
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-steel-100 dark:bg-steel-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$1</code></pre>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-steel-900 dark:text-white">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6 text-steel-900 dark:text-white">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-8 text-steel-900 dark:text-white">$1</h1>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-copper-500 dark:text-copper-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-steel-100 dark:bg-steel-800 px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Lists - process line by line
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const listMatch = line.match(/^\* (.+)$/);

      if (listMatch) {
        if (!inList) {
          processedLines.push('<ul class="list-disc mb-4 ml-6">');
          inList = true;
        }
        processedLines.push(`<li class="mb-2">${listMatch[1]}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (line.trim()) {
          processedLines.push(line);
        }
      }
    }

    if (inList) {
      processedLines.push('</ul>');
    }

    html = processedLines.join('\n');

    // Paragraphs - split by double newlines
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs
      .map((para) => {
        const trimmed = para.trim();
        if (!trimmed || trimmed.startsWith('<')) {
          return trimmed;
        }
        return `<p class="mb-4">${trimmed}</p>`;
      })
      .join('\n');

    // Single line breaks
    html = html.replace(/\n/gim, '<br />');

    // Restore HTML blocks
    htmlBlocks.forEach((block, index) => {
      html = html.replace(`__HTML_BLOCK_${index}__`, block);
    });

    return html;
  };

  return (
    <div
      className="prose prose-steel dark:prose-invert max-w-none text-steel-700 dark:text-steel-200"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      style={{ 
        // Allow charts and HTML content to overflow if needed
        overflowX: 'auto'
      }}
    />
  );
}

