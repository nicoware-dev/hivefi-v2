// src/actions/getSearchData.ts
import {
  elizaLogger as elizaLogger2,
  generateText
} from "@elizaos/core";

// src/environment.ts
import { z } from "zod";
var firecrawlEnvSchema = z.object({
  FIRECRAWL_API_KEY: z.string().min(1, "Firecrawl API key is required")
});
async function validateFirecrawlConfig(runtime) {
  try {
    const config = {
      FIRECRAWL_API_KEY: runtime.getSetting("FIRECRAWL_API_KEY")
    };
    console.log("config: ", config);
    return firecrawlEnvSchema.parse(config);
  } catch (error) {
    console.log("error::::", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
      throw new Error(
        `Firecrawl API configuration validation failed:
${errorMessages}`
      );
    }
    throw error;
  }
}

// src/examples.ts
var getScrapedDataExamples = [
  [
    {
      user: "{{user1}}",
      content: {
        text: "Can you scrape the content from https://example.com?"
      }
    },
    {
      user: "{{agent}}",
      content: {
        text: "I'll scrape the content from that website for you.",
        action: "FIRECRAWL_GET_SCRAPED_DATA"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "Get the data from www.example.com/page"
      }
    },
    {
      user: "{{agent}}",
      content: {
        text: "I'll scrape the data from that webpage for you.",
        action: "FIRECRAWL_GET_SCRAPED_DATA"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "I need to scrape some website data."
      }
    },
    {
      user: "{{agent}}",
      content: {
        text: "I can help you scrape website data. Please share the URL you'd like me to process."
      }
    },
    {
      user: "{{user1}}",
      content: {
        text: "example.com/products"
      }
    },
    {
      user: "{{agent}}",
      content: {
        text: "I'll scrape that webpage and get the data for you.",
        action: "FIRECRAWL_GET_SCRAPED_DATA"
      }
    }
  ]
];
var getSearchDataExamples = [
  [
    {
      user: "{{user1}}",
      content: {
        text: "Find the latest news about SpaceX launches."
      }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here is the latest news about SpaceX launches:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "Can you find details about the iPhone 16 release?"
      }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here are the details I found about the iPhone 16 release:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "What is the schedule for the next FIFA World Cup?"
      }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here is the schedule for the next FIFA World Cup:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: { text: "Check the latest stock price of Tesla." }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here is the latest stock price of Tesla I found:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "What are the current trending movies in the US?"
      }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here are the current trending movies in the US:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: {
        text: "What is the latest score in the NBA finals?"
      }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here is the latest score from the NBA finals:",
        action: "WEB_SEARCH"
      }
    }
  ],
  [
    {
      user: "{{user1}}",
      content: { text: "When is the next Apple keynote event?" }
    },
    {
      user: "{{agentName}}",
      content: {
        text: "Here is the information about the next Apple keynote event:",
        action: "WEB_SEARCH"
      }
    }
  ]
];

// src/services.ts
import { elizaLogger } from "@elizaos/core";
var BASE_URL = "https://api.firecrawl.dev/v1";
var createFirecrawlService = (apiKey) => {
  const getScrapeData = async (url) => {
    if (!apiKey || !url) {
      throw new Error("Invalid parameters: API key and URL are required");
    }
    try {
      const response = await fetch(`${BASE_URL}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url
        })
      });
      elizaLogger.info("response: ", response);
      console.log("data: ", response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("FireCrawl API Error:", error.message);
      throw error;
    }
  };
  const getSearchData = async (query) => {
    if (!apiKey || !query) {
      throw new Error(
        "Invalid parameters: API key and query are required"
      );
    }
    try {
      const response = await fetch(`${BASE_URL}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query
        })
      });
      elizaLogger.info("response: ", response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("FireCrawl API Error:", error.message);
      throw error;
    }
  };
  return { getSearchData, getScrapeData };
};

// src/templates.ts
var searchDataPrompt = `
You are an expert in summarising data fetched from firecrawl search data scrapper used to search for data on the internet. There would be links and data and mentadata which you have to use to give a meaningful response
`;
var scrapeDataPrompt = `
You are an expert in summarising data fetched from firecrawl scrape data scrapper used to scrape data from a website. There would be links and data and mentadata which you have to use to give a meaningful response
`;

// src/actions/getSearchData.ts
import { ModelClass } from "@elizaos/core";
var getSearchDataAction = {
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
    "FIND_INFORMATION"
  ],
  description: "Perform a web search to find information related to the message.",
  validate: async (runtime) => {
    await validateFirecrawlConfig(runtime);
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    const config = await validateFirecrawlConfig(runtime);
    const firecrawlService = createFirecrawlService(
      config.FIRECRAWL_API_KEY
    );
    console.log(message.content.text);
    try {
      const messageText = message.content.text || "";
      elizaLogger2.info(`Found data: ${messageText}`);
      const searchData = await firecrawlService.getSearchData(messageText);
      elizaLogger2.success(`Successfully fectched data`);
      const responseText = await generateText({
        runtime,
        context: `This was the user question: ${message.content.text}

                        The Response data from firecrawl Search API is given below

                        ${JSON.stringify(searchData)}

                        Now Summarise and use this data and provide a response to question asked in the format.
                        Note: The response should be in the same language as the question asked and should be human readable and make sense to the user
                        Do not add any other text or comments to the response just the answer to the question
                        Remove 
 \r, special characters and html tags from the response
                        `,
        modelClass: ModelClass.SMALL,
        customSystemPrompt: searchDataPrompt
      });
      console.log("responseText", responseText);
      if (callback) {
        callback({
          text: `${JSON.stringify(responseText)}`
        });
        return true;
      }
    } catch (error) {
      elizaLogger2.error("Error in the Firecrawl plugin", error);
      callback({
        text: `Error fetching crawl data: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  examples: getSearchDataExamples
};

// src/actions/getScrapeData.ts
import {
  elizaLogger as elizaLogger3,
  generateText as generateText2
} from "@elizaos/core";

// src/utils.ts
function extractUrl(text) {
  const urlPattern = /\b(?:(?:https?|ftp):\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s\)]*)?/i;
  const match = text.match(urlPattern);
  if (!match) {
    return {
      url: null,
      originalText: text
    };
  }
  let url = match[0].trim();
  if (url.startsWith("www.")) {
    url = `https://${url}`;
  } else if (!url.match(/^[a-zA-Z]+:\/\//)) {
    url = `https://${url}`;
  }
  return {
    url,
    originalText: text
  };
}

// src/actions/getScrapeData.ts
import { ModelClass as ModelClass2 } from "@elizaos/core";
var getScrapeDataAction = {
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
    "ANALYZE_URL"
  ],
  description: "Used to scrape information from a website related to the message, summarize it and return a response. If you need info about something give a link and the plugin will scrape the data from the website and return a response.",
  validate: async (runtime) => {
    await validateFirecrawlConfig(runtime);
    return true;
  },
  handler: async (runtime, message, state, _options, callback) => {
    const config = await validateFirecrawlConfig(runtime);
    const firecrawlService = createFirecrawlService(
      config.FIRECRAWL_API_KEY
    );
    try {
      const messageText = message.content.text || "";
      const { url } = extractUrl(messageText);
      if (!url) {
        callback({
          text: "No URL found in the message content."
        });
        return false;
      }
      elizaLogger3.info(`Found URL: ${url}`);
      const scrapeData = await firecrawlService.getScrapeData(url);
      console.log("Final scrapeData: ", scrapeData);
      elizaLogger3.success(`Successfully fectched crawl data`);
      const responseText = await generateText2({
        runtime,
        context: `This was the user question: ${message.content.text}

                        The Response data from firecrawl Scrape Data API is given below

                        ${JSON.stringify(scrapeData)}

                        Now Summarise and use this data and provide a response to question asked in the format.
                        Note: The response should be in the same language as the question asked and should be human readable and make sense to the user
                        Do not add any other text or comments to the response just the answer to the question
                        Remove 
 \r, special characters and html tags from the response
                        `,
        modelClass: ModelClass2.SMALL,
        customSystemPrompt: scrapeDataPrompt
      });
      if (callback) {
        elizaLogger3.info("response: ", scrapeData);
        callback({
          text: `Scraped data: ${JSON.stringify(responseText)}`
        });
        return true;
      }
    } catch (error) {
      elizaLogger3.error("Error in the Firecrawl plugin", error);
      callback({
        text: `Error fetching scrape data: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  examples: getScrapedDataExamples
};

// src/index.ts
var firecrawlPlugin = {
  name: "firecrawl",
  description: "Firecrawl plugin for Eliza",
  actions: [getSearchDataAction, getScrapeDataAction],
  // evaluators analyze the situations and actions taken by the agent. they run after each agent action
  // allowing the agent to reflect on what happened and potentially trigger additional actions or modifications
  evaluators: [],
  // providers supply information and state to the agent's context, help agent access necessary data
  providers: []
};
var index_default = firecrawlPlugin;
export {
  index_default as default,
  firecrawlPlugin
};
//# sourceMappingURL=index.js.map