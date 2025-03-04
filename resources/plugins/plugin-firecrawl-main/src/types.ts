export interface ScrapeResponse {
    data: {
        markdown: string;
        html: string;
        rawHtml: string;
        title: string;
        screenshot: string;
        links: string[];
        actions: {
            screenshots: string[];
        };
        metadata: {
            title: string;
            description: string;
            language: string;
            sourceURL: string;
            [key: string]: string | number;
            statusCode: number;
            error?: string;
        };
        llm_extraction: Record<string, unknown>;
        warning?: string;
    };
}

export interface SearchResponse {
    data: {
        title: string;
        description: string;
        url: string;
        markdown: string;
        html: string;
        rawHtml: string;
        links: string[];
        screenshot: string;
        metadata: {
            title: string;
            description: string;
            sourceURL: string;
            statusCode: number;
            error?: string;
        };
    }[];
    warning?: string;
}
