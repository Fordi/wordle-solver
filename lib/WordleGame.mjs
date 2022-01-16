import WordleSolution from './WordleSolution.mjs';

export default class WordleGame {
  constructor(solution) {
    this.solution = solution;
    this.attempts = new WordleSolution();
  }
  attempt(guess) {
    const s = this.solution.split('');
    const r = '-----'.split('');
    const g = guess.split('');

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
    const attempt = { guess, result: r.join('') };
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
