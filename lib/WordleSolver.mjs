import WordleState from './WordleState.mjs';

export default class WordleSolver {
  constructor(words, state, startWord = null) {
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
        word.split('').forEach((letter, index) => {
          table[`${letter}:${index}`] = (table[`${letter}:${index}`] || 0) + 1;
        });
      });
      this._frequencyTable = table;
    }
    return this._frequencyTable;
  }
  score(word) {
    return word.split('').reduce((sum, letter, index) => (
      sum + this.frequencyTable[`${letter}:${index}`]
    ), 0)
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
  solve(game, maxSteps = Infinity) {
    if (!this.state.isNew) {
      this.state = new WordleState();
    }
    while (!game.solved && this._words.length && game.steps < maxSteps) {
      const guess = (this.state.isNew && this.startWord !== null) ? this.startWord : this._words.shift();
      const { result } = game.attempt(guess);
      this.state = this.state.addAttempt(guess, result);
    }
    return game.attempts;
  }
  nextWords(count) {
    return this._words.slice(0, count);
  }
}
