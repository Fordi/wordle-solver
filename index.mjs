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
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')), undefined, config.startWord);
  const solution = solver.solve(new WordleGame(config.solve));
  console.log(solution.toSpoiler());
}

if (config.solveToday) {
  const puzzle = await getTodaysPuzzle('./wordleWords.bin');
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')), undefined, config.startWord);
  const solution = solver.solve(new WordleGame(puzzle));
  console.log(solution.toSpoiler());
}

if (config.tweet) {
  const day = getDayNumber();
  const solver = new WordleSolver(await readJson(resolver('./wordList.json')), undefined, config.startWord);
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
  const solution = solver.solve(new WordleGame(await getTodaysPuzzle('./wordleWords.bin')), undefined, config.startWord);
  const fwSpace = '￣';
  const fwDigits = '０１２３４５６７８９'.split('');
  const gridLine = Array(7).join('⬛').split('');
  const grid = Array(6).join('.').split('.').map(() => gridLine.slice());
  const max = solutions.reduce((max, { count }) => Math.max(max, count), 0);
  const counts = Array(6).join('.').split('.').map((_, i) => {
    const n = i === 0 ? 1 : Math.ceil((max**(1/6))**(i + 1));
    const t = Math.floor(n / 10);
    const o = n % 10;
    return (t === 0 ? fwSpace : fwDigits[t]) + fwDigits[o];
  }).reverse();
  solutions.forEach(({ count, steps }) => {
    const x = steps - 1;
    for (let y = 0; y < 6; y++) {
      const i = 5 - y;
      const b = i === 0 ? 0 : i === 1 ? 1 : Math.ceil((max**(1/6))**(i));
      const t = i === 0 ? 1 : Math.ceil((max**(1/6))**(i + 1));
      if (count >= t) {
        grid[y][x] = '🟩';
      } else if (count > b) {
        grid[y][x] = '🟨';
      }
    }
  });

  const status = [
    `Stats for the last 100 tweets for Wordle ${day}:`,
    ...grid.map((line, n) => (
     counts[n] + line.join('')
    )),
    '￣￣' + `1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣`,
    `WordleBot solved it in ${solution.length}`,
    `If you beat the bot, you're doing great!`
  ].join('\n');
  console.log(status);
  if (!config.dryRun) {
    console.log('Sending tweet...')
    await sendTweet(status);
    console.log('Sent!');
  }
}
