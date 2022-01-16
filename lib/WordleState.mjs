export default class WordleState {
  constructor({ known = [], has = [], hasnt = [] } = {}) {
    this.known = known;
    this.has = has;
    this.hasnt = hasnt;
  }
  addAttempt(attempt, result) {
    if (
      attempt.length !== 5
      || result.length !== 5
      || /[^a-z]/.test(attempt)
      || /[^\+\-\?]/.test(result)
    ) {
      throw new Error(`Invalid input: ${attempt} ${result}`);
    }
    const [known, has, hasnt] = [this.known, this.has, this.hasnt].map(a => a.slice());

    const a = attempt.split('');
    attempt.split('').forEach((ch, i) => {
      const r = result[i];
      if (r === '+') {
        known[i] = { is: ch };
        has.push(ch);
      }
    });
    attempt.split('').forEach((ch, i) => {
      const r = result[i];
      if (r === '?') {
        known[i] = { isnt: [...((known[i] || {}).isnt || []), ch] };
        has.push(ch);
      }
    });
    attempt.split('').forEach((ch, i) => {
      const r = result[i];
      if (r === '-') {
        known[i] = { isnt: [...((known[i] || {}).isnt || []), ch] };
        if (has.indexOf(ch) === -1 && !known.find(({ is } = {}) => is === ch)) { hasnt.push(ch); }
      }
    });
    return new WordleState({
      known,
      has: Array.from(new Set(has)),
      hasnt: Array.from(new Set(hasnt))
    });
  }
  checkKnown(word) {
    const { known } = this;
    for (let i = 0; i < known.length; i++) {
      const ch = known[i];
      if (ch.is && word[i] !== ch.is) {
        return false;
      }
      if (ch.isnt && ch.isnt.indexOf(word[i]) >= 0) {
        return false;
      }
    }
    return true;
  }
  checkHas(word) {
    const { has } = this;
    for (let i = 0; i < has.length; i++) {
      if (word.indexOf(has[i]) < 0) {
        return false;
      }
    }
    return true;
  }
  checkHasnt(word) {
    const { hasnt } = this;
    for (let i = 0; i < hasnt.length; i++) {
      if (word.indexOf(hasnt[i]) >= 0) {
        return false;
      }
    }
    return true;
  }  
  checkWord(word) {
    return (
      this.checkKnown(word)
      && this.checkHas(word)
      && this.checkHasnt(word)
    );
  }
  get isNew() {
    return !(this.known.length || this.has.length || this.hasnt.length);
  }

}
