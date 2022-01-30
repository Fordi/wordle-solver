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
      steps = text
          .split('\n')
          .filter(line => line.indexOf(`Wordle ${day}`) !== -1)[0]
          .match(/Wordle \d+ ([1-6X]+)\/6/)[1];
      if (steps === 'X') {
        steps = 0;
      }
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

  const result = freq.map((count, steps) => ({ 
    steps,
    count,
    pct: 100 * count / ids.length
  }));
  result.sourceLength = ids.length;
  return result;
};

export const sendTweet = async (status) => (await makeTwitterClient()).tweets.statusesUpdate({ status });
