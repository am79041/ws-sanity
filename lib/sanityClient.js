const { createClient } = require("@sanity/client");
require("dotenv/config");

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  apiVersion: process.env.SANITY_API_VERSION,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_EDITOR_TOKEN,
  useCdn: false,
});

module.exports = sanityClient;
