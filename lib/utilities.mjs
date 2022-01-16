import { readFile } from 'fs/promises';

export const makeResolver = ({ url }) => p => new URL(p, url).pathname;

export const readJson = async jsonFileName => JSON.parse(await readFile(jsonFileName, 'utf8'));
