import Mastodon from 'mastodon';

import { makeResolver, readJson } from './utilities.mjs';

const resolver = makeResolver(import.meta);

const makeMastodonClient = async () => {
  try {
    const {
      apiUrl,
      accessToken,
    }  = await readJson(resolver('../mastodon.json'));

    return new Mastodon({
      access_token: accessToken,
      timeout_ms: 60*1000,
      api_url: apiUrl,
    });
  } catch (e) {
    console.error(e);
    throw new Error('To use mastodon-related features, create a `mastodon.json` file with your API credentials.');
  }
};

export const sendToot = async (status) => {
  const client = await makeMastodonClient();
  client.post('statuses', { status });
};

export const tootedSolutions = async () => [];