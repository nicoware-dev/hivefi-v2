import { ActionExample } from "@elizaos/core";

export const getScrapedDataExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you scrape the content from https://example.com?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll scrape the content from that website for you.",
                action: "FIRECRAWL_GET_SCRAPED_DATA",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Get the data from www.example.com/page",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll scrape the data from that webpage for you.",
                action: "FIRECRAWL_GET_SCRAPED_DATA",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I need to scrape some website data.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I can help you scrape website data. Please share the URL you'd like me to process.",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "example.com/products",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll scrape that webpage and get the data for you.",
                action: "FIRECRAWL_GET_SCRAPED_DATA",
            },
        },
    ],
];

export const getSearchDataExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Find the latest news about SpaceX launches.",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here is the latest news about SpaceX launches:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you find details about the iPhone 16 release?",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here are the details I found about the iPhone 16 release:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What is the schedule for the next FIFA World Cup?",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here is the schedule for the next FIFA World Cup:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Check the latest stock price of Tesla." },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here is the latest stock price of Tesla I found:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What are the current trending movies in the US?",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here are the current trending movies in the US:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What is the latest score in the NBA finals?",
            },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here is the latest score from the NBA finals:",
                action: "WEB_SEARCH",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "When is the next Apple keynote event?" },
        },
        {
            user: "{{agentName}}",
            content: {
                text: "Here is the information about the next Apple keynote event:",
                action: "WEB_SEARCH",
            },
        },
    ],
];
