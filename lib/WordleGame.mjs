import WordleSolution from './WordleSolution.mjs';

const evalCache = {};

export default class WordleGame {
  constructor(solution) {
    this.solution = solution;
    this.attempts = new WordleSolution();
  }
  static evaluate(guess, solution) {
    const key = `${solution}:${guess}`
    if (!evalCache[key]) {
      const s = Array.from(solution);
      const r = Array.from('-----');
      const g = Array.from(guess);
  
      g.forEach((l, i) => {
        if (l === s[i]) {
          s[i] = undefined;
          g[i] = false;
          r[i] = '+';
          return;
        }
      });
  
      g.forEach((l, i) => {
        if (l === false) return;
        const p = s.indexOf(l);
        if (p !== -1) {
          s[p] = undefined;
          r[i] = '?';
          return;
        }
      });
      evalCache[key] = r.join('');
    }
    return evalCache[key];
  }
  attempt(guess) {
    const attempt = { guess, result: this.constructor.evaluate(guess, this.solution) };
    this.attempts.push(attempt);
    return attempt;
  }
  get solved() {
    if (!this.attempts.length) return false;
    return this.attempts.isSolved;
  }
  get steps() {
    return this.attempts.length;
  }
}
