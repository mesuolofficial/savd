export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  // Remove script and iframe tags entirely
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  
  // Remove inline event handlers (onclick, onerror, etc.) and styles
  clean = clean.replace(/ on\w+="[^"]*"/gi, "");
  clean = clean.replace(/ style="[^"]*"/gi, "");
  
  // Allow only specific safe tags
  const allowedTags = ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br"];
  // Strip out any tag that is not in the allowed list
  clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : "";
  });

  return clean;
}