interface ParsedUrl {
    url: string | null;
    originalText: string;
}

export function extractUrl(text: string): ParsedUrl {
    const urlPattern =
        /\b(?:(?:https?|ftp):\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s\)]*)?/i;

    const match = text.match(urlPattern);

    if (!match) {
        return {
            url: null,
            originalText: text,
        };
    }

    // Normalize the URL
    let url = match[0].trim();

    // If URL starts with www., add https://
    if (url.startsWith("www.")) {
        url = `https://${url}`;
    }
    // If URL doesn't have any protocol, add https://
    else if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = `https://${url}`;
    }

    return {
        url,
        originalText: text,
    };
}
