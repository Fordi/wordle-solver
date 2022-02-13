import { getCliOptions } from './lib/cli.mjs';
import { getTodaysPuzzle, getDayNumber } from './lib/getTodaysPuzzle.mjs';
import { makeResolver, readJson } from './lib/utilities.mjs';
import WordleSolver from './lib/WordleSolver.mjs';
import WordleGame from './lib/WordleGame.mjs';
import { sendTweet, tweetedSolutions } from './lib/Twitter.mjs';

const resolver = makeResolver(import.meta);

const WORDLE_POSTSCRIPT = `(wordle-solver is a DIY Wordle solver I wrote in NodeJS.  If you beat the bot, you're doing great!)`;

const config = getCliOptions();

if (config.dayNum) {
  console.log(`It is day ${getDayNumber()}`);
}

const getWords = async () => Object.keys(await readJson(resolver('./freq_map.json')));

if (config.partial) {
  const solver = new WordleSolver(await getWords());
  config.partial.forEach(attempt => {
    if (!/[a-z]{5}[\?\-\+]{5}/.test(attempt)) {
      throw new Error('Attempts must be in the format abcde-?+?-');
    }
    solver.state = solver.state.addAttempt(attempt.substring(0, 5), attempt.substring(5, 10));
  });
  console.log(`${solver._words.length}: ${solver.nextWords(10).join(' ')}`);
}

if (config.solve) {
  const solver = new WordleSolver(await getWords(), undefined, config.startWord);
  const solution = solver.solve(new WordleGame(config.solve));
  console.log(solution.toSpoiler());
}

if (config.solveToday) {
  const puzzle = await getTodaysPuzzle(resolver('./wordleWords.bin'));
  const solver = new WordleSolver(await getWords(), undefined, config.startWord);
  const solution = solver.solve(new WordleGame(puzzle));
  console.log(solution.toSpoiler());
}

if (config.reverse) {
  const [solution, ...results] = config.reverse;
  const game = new WordleGame(solution);
  const wordList = await getWords();
  const finalGame  = new WordleGame(solution);
  const solver = new WordleSolver(wordList);
  const p = results.map(result => wordList.filter(word => {
    return game.attempt(word).result === result;
  })).map((words, index) => {
    const [word] = solver.sort(words).filter(w => {
      if (finalGame.attempts.find(({ guess }) => guess === w)) return false;
      if (solver._words.indexOf(w) === -1) return false;
      return true;
    });
    if (!word) {
      console.log(`Can't reverse solve this`);
      process.exit(-1);
    }
    finalGame.attempt(word);
    solver.state = solver.state.addAttempt(word, results[index]);
  });
  console.log('My best guess at your puzzle');
  console.log(finalGame.attempts.toSpoiler());
}



if (config.tweet) {
  const day = getDayNumber();
  const solver = new WordleSolver(await getWords(), undefined, config.startWord);
  const solution = solver.solve(new WordleGame(await getTodaysPuzzle(resolver('./wordleWords.bin'))));
  const status = [
    `wordle-solver ${day} ${solution.length}/6`,
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
  const solver = new WordleSolver(await getWords());
  const solution = solver.solve(new WordleGame(await getTodaysPuzzle(resolver('./wordleWords.bin'))), undefined, config.startWord);
  const fwSpace = '￣';
  const fwDigits = '０１２３４５６７８９'.split('');
  const gridLine = Array(8).join('⬛').split('');
  const grid = Array(6).join('.').split('.').map(() => gridLine.slice());
  const order = [1, 2, 3, 4, 5, 6, 0];
  const max = order.reduce((max, index) => {
    const { pct = 0 } = solutions[index] || {};
    return Math.max(max, Math.ceil(pct));
  }, 0);
  const counts = order.map((_, i) => {
    const n = Math.ceil((max**(1/6))**(i));
    const t = Math.floor(n / 10);
    const o = (n | 0) % 10;
    return (t === 0 ? fwSpace : fwDigits[t]) + fwDigits[o];
  }).reverse();
  
  order.forEach((index) => {
    let { pct, steps } = solutions[index] || {};
    pct = Math.ceil(pct);
    const x = steps;
    for (let y = 0; y < 6; y++) {
      const i = 5 - y;
      const b = i === 0 ? 0 : i === 1 ? 1 : Math.ceil((max**(1/6))**(i));
      const t = i === 0 ? 1 : Math.ceil((max**(1/6))**(i + 1));
      if (pct >= t) {
        grid[y][x] = '🟩';
      } else if (pct > b) {
        grid[y][x] = '🟨';
      }
    }
  });

  const status = [
    `Stats for ${solutions.sourceLength} tweets for Wordle ${day}:`,
    ...grid.map((line, n) => (
     counts[n] + line.join('')
    )),
    '￣％' + `1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣🟥`,
    `wordle-solver solved it in ${solution.length}`,
    `If you beat the bot, you're doing great!`
  ].join('\n');
  console.log(status);
  if (!config.dryRun) {
    console.log('Sending tweet...')
    await sendTweet(status);
    console.log('Sent!');
  }
}

if (config.logStats) {
  const day = getDayNumber();
  const solutions = await tweetedSolutions(day);
  console.log(`Day info has ${solutions.sourceLength} solutions`);
}