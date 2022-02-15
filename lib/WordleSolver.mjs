import WordleGame from './WordleGame.mjs';
import WordleState from './WordleState.mjs';
import { wordWeight, frequencyData } from './wordWeight.mjs';

export default class WordleSolver {
  constructor(words, state, startWord = 'soare') {
    this.startWord = startWord;
    this._baseWords = words.slice();
    this.state = state ?? new WordleState();
  }
  set state(state) {
    this._state = state;
    if (this._baseWords) {
      this._words = this._baseWords.filter(word => state.checkWord(word));
      this._frequencyTable = null;
      this._words = this.sort(this._words);
    }
  }
  get state() { return this._state; }
  get frequencyTable() {
    if (!this._frequencyTable) {
      const table = {};
      const words = this._words;

      words.forEach(word => {
        word.split('').forEach((letter) => {
          table[letter] = (table[letter] || 0) + 1;
        });
      });
      this._frequencyTable = table;
    }
    return this._frequencyTable;
  }
  score(word) {
    return word.split('').reduce(({ sum, visited }, letter, index) => {
      if (!visited.has(letter)) {
        sum = sum + this.frequencyTable[letter];
        visited.add(letter);
      }
      return { sum, visited };
    }, { sum: 0, visited: new Set() }).sum;
  }
  sort(words) {
    return words.slice().sort((a, b) => {
      let sa = this.score(a);
      let sb = this.score(b);
      while (sa === sb && a.length) {
        a = a.substring(0, a.length - 2);
        b = b.substring(2, b.length - 2);
        sa = this.score(a);
        sb = this.score(b);
      }
      return sb - sa;
    });
  }
  nextWords(count, sample = 20) {
    const candidates = this._words.slice(0, sample);
    // console.log(`Current corpus: ${this._words.length} words`);
    const sumEntropy = (sum, word) => sum + wordWeight(word);
    const entropy = this._words.reduce(sumEntropy, 0);
    const next = candidates.map(guess => {
      // console.log(`guess ${guess}...`)
      let score = 0;
      this._words.forEach(mockSolution => {
        const result = WordleGame.evaluate(guess, mockSolution);
        const nextState = new WordleState(this.state).addAttempt(guess, result);
        const filtered = this._words.filter(w => nextState.checkWord(w)).reduce(sumEntropy, 0);
        const ps = score;
        score += filtered / entropy;
        if (isNaN(score)) {
          console.log({ ps, filtered, entropy });
          process.exit(0);
        }
      });
      // console.log(`${guess}: ${score}`);
      return { guess, score: score * frequencyData[guess] };
    }).sort((a, b) => b.score - a.score).slice(0, count);
    // console.log(next);
    return next.map(a => a.guess);
  }
  solve(game, maxSteps = Infinity) {
    if (!this.state.isNew) {
      this.state = new WordleState();
    }
    while (!game.solved && this._words.length && game.steps < maxSteps) {
      const guess = (this.state.isNew && this.startWord !== null) ? this.startWord : this.nextWords(1)[0];
      const { result } = game.attempt(guess);
      this.state = this.state.addAttempt(guess, result);
    }
    return game.attempts;
  }
}
