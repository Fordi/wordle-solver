import { readFile } from 'fs/promises';
const { now } = Date;
const origin = Math.floor(new Date(2021, 6 - 1, 20, 0, 0, 0 ,0).getTime() / 864e5);

export const getDayNumber = () => Math.floor(now() / 864e5) - origin;

// The official Wordle list has been encoded as binary to avoid having my repo reveal it.
// I don't pretend this'll keep them out of the public domain, but I want "getting the
// words from my repo" to be at least as hard as getting them from the official site.
export const getTodaysPuzzle = async fileName => {
  const buffer = await readFile(fileName);
  const len = buffer.length / 3 - 1;
  const numAt = n => (buffer[3 * n] << 16) + (buffer[3 * n + 1] << 8) + buffer[3 * n + 2];
  const offset = numAt(0);
  const dayNum = getDayNumber();
  if (dayNum > len) {
    throw new Error("We're officially out of puzzles.  Sorry.");
  }
  const pos = numAt((offset + len - dayNum) % len + 1);
  const word = Array(5);
  for (let i = 4; i >= 0; i--) {
    word.push(Math.floor(pos / 26 ** i) % 26);
  }
  return word.map(o => String.fromCharCode(o + 97)).join("")
}
