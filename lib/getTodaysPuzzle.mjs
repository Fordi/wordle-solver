import { readFile } from 'fs/promises';
const { now } = Date;
const origin = new Date(2021, 6 - 1, 20, 0, 0, 0 ,0);

export const getDayNumber = (now = new Date()) => {
  const start = new Date(origin.getTime());
  let sum = 1;
  while (
    start.getMonth() !== now.getMonth()
    && start.getFullYear() !== now.getFullYear()
  ) {
    const date = start.getDate();
    start.setMonth(start.getMonth() + 1, 0);
    sum += start.getDate() - date + 1;
    start.setMonth(start.getMonth() + 1, 1);
  }
  sum += now.getDate() - start.getDate();
  return sum;
};

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
