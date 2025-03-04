import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    generateText,
} from "@elizaos/core";
import { validateFirecrawlConfig } from "../environment";
import { getScrapedDataExamples } from "../examples";
import { createFirecrawlService } from "../services";
import { extractUrl } from "../utils";
import { scrapeDataPrompt } from "../templates";
import { ModelClass } from "@elizaos/core";

export const getScrapeDataAction: Action = {
    name: "FIRECRAWL_GET_SCRAPED_DATA",
    similes: [
        "SCRAPE_WEBSITE",
        "LOOKUP",
        "RETURN_DATA",
        "FIND_ONLINE",
        "QUERY",
        "FETCH_PAGE",
        "EXTRACT_CONTENT",
        "GET_WEBPAGE",
        "CRAWL_SITE",
        "READ_WEBPAGE",
        "PARSE_URL",
        "GET_SITE_DATA",
        "RETRIEVE_PAGE",
        "SCAN_WEBSITE",
        "ANALYZE_URL",
    ],
    description:
        "Used to scrape information from a website related to the message, summarize it and return a response. If you need info about something give a link and the plugin will scrape the data from the website and return a response.",
    validate: async (runtime: IAgentRuntime) => {
        await validateFirecrawlConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateFirecrawlConfig(runtime);
        const firecrawlService = createFirecrawlService(
            config.FIRECRAWL_API_KEY
        );

        try {
            const messageText = message.content.text || "";
            const { url } = extractUrl(messageText);

            if (!url) {
                callback({
                    text: "No URL found in the message content.",
                });
                return false;
            }

            elizaLogger.info(`Found URL: ${url}`);
            const scrapeData = await firecrawlService.getScrapeData(url);
            console.log("Final scrapeData: ", scrapeData);
            elizaLogger.success(`Successfully fectched crawl data`);

            const responseText = await generateText({
                runtime,
                context: `This was the user question: ${message.content.text}

                        The Response data from firecrawl Scrape Data API is given below

                        ${JSON.stringify(scrapeData)}

                        Now Summarise and use this data and provide a response to question asked in the format.
                        Note: The response should be in the same language as the question asked and should be human readable and make sense to the user
                        Do not add any other text or comments to the response just the answer to the question
                        Remove \n \r, special characters and html tags from the response
                        `,
                modelClass: ModelClass.SMALL,
                customSystemPrompt: scrapeDataPrompt,
            });

            if (callback) {
                elizaLogger.info("response: ", scrapeData);
                callback({
                    text: `Scraped data: ${JSON.stringify(responseText)}`,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in the Firecrawl plugin", error);
            callback({
                text: `Error fetching scrape data: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: getScrapedDataExamples as ActionExample[][],
} as Action;
