import { TwitterClient } from 'twitter-api-client';
import { makeResolver, readJson } from './utilities.mjs';
const resolver = makeResolver(import.meta);

const makeTwitterClient = async () => {
  try {
    return new TwitterClient(await readJson(resolver('../twitter.json')));
  } catch (e) {
    throw new Error('To use twitter-related features, create a `twitter.json` file with your API credentials.');
  }
}

export const tweetedSolutions = async day => {
  const results = await (await makeTwitterClient()).tweets.search({
    q: `Wordle ${day} 🟩🟩🟩🟩🟩`,
    result_type: 'recent',
    count: 100,
  });
  const freq = [];
  results.statuses.forEach(({ text }) => {
    let steps;
    try {
      steps = parseInt(
        text
          .split('\n')
          .filter(line => line.indexOf(`Wordle ${day}`) !== -1)[0]
          .match(/Wordle \d+ (\d+)\/6/)[1]
      );
    } catch (e) {}
    if (steps) freq[steps] = (freq[steps] || 0) + 1;
  });
  
  return freq.slice(1).map((count, index) => ({ steps: index + 1, count }));
};

export const sendTweet = async (status) => (await makeTwitterClient()).tweets.statusesUpdate({ status });
