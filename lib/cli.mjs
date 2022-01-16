import { basename } from 'path';

const OPTIONS_MAP = {
  's': ['solveToday', `Solve today's puzzle`, true],
  't': ['tweet', `Solve today's puzzle and tweet about it`, true],
  'p': ['partial', `Find the next 10 word candidates given a history, e.g., -p weary--?-- pills+?--- vague-+---`, '*'],
  'S': ['solve', `Solve an arbitrary puzzle, e.g., -S cigar`, 1],
  'e': ['tweetEod', `Tweet WordleBot's EOD message`, true],
  'd': ['dryRun', `Do everything, but don't send the tweet`, true],
};
const parseCliOptions = (args) => {
  const mappers = Object.keys(OPTIONS_MAP).reduce((o, k) => {
    o[`-${k}`] = o[`--${OPTIONS_MAP[k][0]}`] = OPTIONS_MAP[k];
    return o;
  }, {});
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const [name, desc, reader] = (mappers[arg] || []);
    if (reader) {
      if (reader === true) {
        options[name] = true;
      } else if (!Number.isNaN(parseInt(reader))) {
        if (args.length - i - 1 < reader) {
          throw new Error(`${arg} expects ${reader} arguments; got ${args.length - i - 1}`);
        }
        options[name] = args.slice(i + 1, i + 1 + reader);
        i += reader;
      } else if (reader === '*') {
        options[name] = args.slice(i + 1);
        i = args.length;
      } else {
        throw new Error('Invalid config: ', mappers[arg]);
      }
    } else {
      throw new Error('Invalid option: ', args[i]);
    }
  }
  return options;
}

export const usage = (message) => {
  if (message) {
    console.warn(message);
  }
  const rows = Object.keys(OPTIONS_MAP).map(key => {
    const [name, description, reader] = OPTIONS_MAP[key];
    let fmtReader;
    if (reader === true) {
      fmtReader = '';
    } else if (!Number.isNaN(parseInt(reader))) {
      fmtReader = `arg${reader > 1 ? `x${reader}` : ''}`;
    } else if (reader === '*') {
      fmtReader = '...';
    }
    return [`-${key}|--${name} ${fmtReader}`, description];
  });
  const columnWidths = rows.reduce((w, row) => {
    row.forEach((c, i) => {
      w[i] = Math.max(w[i] || 0, c.length);
    });
    return w;
  }, []);
  console.log([
    `Usage: node ${basename(process.argv[1])} ...`,
    ...rows.map(row => '    ' + row.map((col, i) => col.padEnd(columnWidths[i])).join(' ').trim())
  ].join('\n'));
  process.exit(-1);
}

export const getCliOptions = () => {
  try {
    if (process.argv.length === 2) {
      usage();
    } else {
      return parseCliOptions(process.argv.slice(2));
    }
  } catch (e) {
    usage(e.message);
  }
};
