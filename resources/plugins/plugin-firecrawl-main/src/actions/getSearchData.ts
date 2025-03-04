import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    generateText,
    composeContext,
    parseJSONObjectFromText,
} from "@elizaos/core";
import { validateFirecrawlConfig } from "../environment";
import { getSearchDataExamples } from "../examples";
import { createFirecrawlService } from "../services";
import { searchDataPrompt } from "../templates";
import { ModelClass } from "@elizaos/core";

export const getSearchDataAction: Action = {
    name: "WEB_SEARCH",
    similes: [
        "SEARCH_WEB",
        "INTERNET_SEARCH",
        "LOOKUP",
        "QUERY_WEB",
        "FIND_ONLINE",
        "SEARCH_ENGINE",
        "WEB_LOOKUP",
        "ONLINE_SEARCH",
        "FIND_INFORMATION",
    ],
    description:
        "Perform a web search to find information related to the message.",
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

        console.log(message.content.text);
        try {
            const messageText = message.content.text || "";

            elizaLogger.info(`Found data: ${messageText}`);
            const searchData =
                await firecrawlService.getSearchData(messageText);

            elizaLogger.success(`Successfully fectched data`);

            const responseText = await generateText({
                runtime,
                context: `This was the user question: ${message.content.text}

                        The Response data from firecrawl Search API is given below

                        ${JSON.stringify(searchData)}

                        Now Summarise and use this data and provide a response to question asked in the format.
                        Note: The response should be in the same language as the question asked and should be human readable and make sense to the user
                        Do not add any other text or comments to the response just the answer to the question
                        Remove \n \r, special characters and html tags from the response
                        `,
                modelClass: ModelClass.SMALL,
                customSystemPrompt: searchDataPrompt,
            });

            console.log("responseText", responseText);

            // const parsedResponse = parseJSONObjectFromText(responseText);

            // console.log("parsedResponse", parsedResponse);

            if (callback) {
                callback({
                    text: `${JSON.stringify(responseText)}`,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in the Firecrawl plugin", error);
            callback({
                text: `Error fetching crawl data: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: getSearchDataExamples as ActionExample[][],
} as Action;
