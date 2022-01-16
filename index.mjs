import { getCliOptions, usage } from './lib/cli.mjs';
import { getTodaysPuzzle, getDayNumber } from './lib/getTodaysPuzzle.mjs';
import { makeResolver, readJson } from './lib/utilities.mjs';
import WordleSolver from './lib/WordleSolver.mjs';
import WordleGame from './lib/WordleGame.mjs';
import { sendTweet, tweetedSolutions } from './lib/Twitter.mjs';

const resolver = makeResolver(import.meta);

const WORDLE_POSTSCRIPT = `(WordleBot is a DIY Wordle solver I wrote in NodeJS.  If you beat the bot, you're doing great!)`;

const config = getCliOptions();

if (config.partial) {
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')));
  config.partial.forEach(attempt => {
    if (!/[a-z]{5}[\?\-\+]{5}/.test(attempt)) {
      throw new Error('Attempts must be in the format abcde-?+?-');
    }
    solver.state = solver.state.addAttempt(attempt.substring(0, 5), attempt.substring(5, 10));
  });
  console.log(solver.nextWords(10).join(' '));
}

if (config.solve) {
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')));
  const solution = solver.solve(new WordleGame(config.solve[0]));
  console.log(solution.toSpoiler());
}

if (config.solveToday) {
  const puzzle = await getTodaysPuzzle('./wordleWords.bin');
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')));
  const solution = solver.solve(new WordleGame(puzzle));
  console.log(solution.toSpoiler());
}

if (config.tweet) {
  const day = getDayNumber();
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')));
  const solution = solver.solve(new WordleGame(await getTodaysPuzzle('./wordleWords.bin')));
  const status = [
    `WordleBot ${day} ${solution.length}/6`,
    solution.toShareable(),
    WORDLE_POSTSCRIPT
  ].join('\n');
  console.log(status);
  if (!config.dryRun) {
    console.log('Sending tweet...')
    await sendTweet(status);
    console.log('Sent!');
  }
}

if (config.tweetEod) {
  const day = getDayNumber();
  const solutions = await tweetedSolutions(day);
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')));
  const solution = solver.solve(new WordleGame(await getTodaysPuzzle('./wordleWords.bin')));
  const excitement = i => {
    if (i === 1) return '! WOW!'
    if (i < solution.length) return '!!';
    if (i === solution.length) return '!';
    return '';
  }
  let status = [
    `Of the last 100 tweeted Wordle ${day}:`,
    ...solutions.map(({ count, steps }) => (
      `${count} solved it in ${steps}${excitement(steps)}`
    )).filter(a => a),
    `WordleBot solved it in ${solution.length}`,
    WORDLE_POSTSCRIPT,
  ].join('\n');
  console.log(status);
  if (!config.dryRun) {
    console.log('Sending tweet...')
    await sendTweet(status);
    console.log('Sent!');
  }
}
