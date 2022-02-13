import { makeResolver, readJson } from './utilities.mjs';

const resolver = makeResolver(import.meta);
export const frequencyData = await readJson(resolver('../freq_map.json'));
const totalEntropy = Object.keys(frequencyData).reduce((sum, word) => sum + Math.log2(frequencyData[word] + 1), 0);

const sigmoid = p => {
      return 1 / (1 + Math.exp(-p));
};      
export const wordWeight = word => {
  const f = frequencyData[word];
  const l = Math.log2(f + 1);
  const p = l / totalEntropy;
  const s = sigmoid(p);
  if (isNaN(s)) {
    console.log({ f, l, p, s });
    throw new Error();
  }
  return s;
};