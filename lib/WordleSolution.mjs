export default class WordleSolution extends Array {
  format({ eol, tween, default: def, ...config }) {
    return this.map(({ result, guess }) => (
      result.split('').map((c, i) => (
        (config[c] || def)(guess[i])
      )).join(tween) + eol
    )).join('\n')
  }

  toShareable() {
    return this.format({
      '+': l => '🟩',
      '?': l => '🟨',
      '-': l => '⬛',
      default: l => '⬜',
      eol: '',
      tween: '',
    });
  }

  toSpoiler() {
    return this.format({
      '+': l => `\x1b[42m\x1b[30m\x1b[4m${l}`,
      '?': l => `\x1b[43m\x1b[30m\x1b[4m${l}`,
      '-': l => `\x1b[47m\x1b[30m\x1b[4m${l}`,
      default: l => `\x1b[46m\x1b[30m\x1b[4m${l}`,
      eol: '\x1b[0m',
      tween: '|',
    });
  }
  get isSolved() {
    return this[this.length - 1].result === '+++++';
  }
  get isWin() {
    return this.length < 6 && this.isSolved;
  }
}
