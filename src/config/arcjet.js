import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Rate limit rule: max 5 requests per 2 seconds
    slidingWindow({
      mode: "LIVE",
      interval: "2s",
      max: 5,
    }),
  ],
});

export default aj;
