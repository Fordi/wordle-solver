import { TwitterClient } from 'twitter-api-client';
import { makeResolver, readJson } from './utilities.mjs';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import base91 from 'node-base91';

const resolver = makeResolver(import.meta);

const makeTwitterClient = async () => {
  try {
    return new TwitterClient(await readJson(resolver('../twitter.json')));
  } catch (e) {
    throw new Error('To use twitter-related features, create a `twitter.json` file with your API credentials.');
  }
};

const statDir = resolver('../stats');

const hashId = id => base91.encode(createHash('sha1').update(id).digest()).substring(0, 8);

export const tweetedSolutions = async day => {
  await mkdir(statDir, { recursive: true });
  let extant = {};
  try {
    extant = JSON.parse(await readFile(`${statDir}/${day}.json`, 'utf8'));
  } catch (e) {}
  const results = await (await makeTwitterClient()).tweets.search({
    q: `Wordle ${day} 🟩🟩🟩🟩🟩`,
    result_type: 'recent',
    count: 100,
  });
  results.statuses.forEach(({ id, text }) => {
    let steps;
    try {
      steps = parseInt(
        text
          .split('\n')
          .filter(line => line.indexOf(`Wordle ${day}`) !== -1)[0]
          .match(/Wordle \d+ (\d+)\/6/)[1]
      );
    } catch (e) {}
    if (steps) {
      extant[hashId(String(id))] = steps;
    }
  });
  try {
    await writeFile(`${statDir}/${day}.json`, JSON.stringify(extant), 'utf8');
  } catch (e) {}
  const ids = Object.keys(extant);
  const freq = [];
  ids.forEach(id => {
    const steps = extant[id];
    freq[steps] = (freq[steps] || 0) + 1;
  });
  const result = freq.slice(1).map((count, index) => ({ steps: index + 1, count }));
  result.sourceLength = ids.length;
  return result;
};

export const sendTweet = async (status) => (await makeTwitterClient()).tweets.statusesUpdate({ status });
