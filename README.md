# WordleBot

A solver for Wordle, written in NodeJS using modules and classes and other fancy stuff.

## How to use it

Run `npm ci` before trying to use it.  Ideally, have [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) installed and run `nvm use` before doing that.

Set up the `twitter.json` file before trying to tweet with it.

```
Usage: node index.mjs ...
    -s|--solveToday  Solve today's puzzle
    -t|--tweet       Solve today's puzzle and tweet about it
    -p|--partial ... Find the next 10 word candidates given a history, e.g., -p weary--?-- pills+?--- vague-+---
    -S|--solve arg   Solve an arbitrary puzzle, e.g., -S cigar
    -e|--tweetEod    Tweet WordleBot's EOD message
    -d|--dryRun      Do everything, but don't send the tweet
```

Partial states represent a guess and its results, e.g., `weary--?-+` means:

* You tried "weary"
* The "a" is present but misplaced
* The "y" is right where it needs to be
* "w", "e" and "r" are absent

## How it works

In this repository, there's a `wordList.json` that contains every word that Wordle considers valid.  Most of these are not solutions.

The bot is, at the highest level, a bare-bones clone of the game, and a solver.

The game is simple - it knows the answer and, if you guess, it will tell you how wrong you are.  Just like the real thing.

The solver reads the full list, and makes a frequency table containing letter-position tuples (e.g., { 'a:0': 52 }, meaning 'a' is in the first position in 52 words).  It then sorts its word list by the words' "scores" - which are just a sum of the frequency of each letter/position.  The first item in the list should be the "best" guess.

After each guess, the solver filters the word list, rebuilds the frequency table and re-sorts what's left.

There's also `wordleWords.bin`, which is an obfuscated representation of solutions for days 0 - 2,314 (they're on the game page too - at least as well hidden as I've got 'em).  This allows the solver to solve for the day without actually visiting the site (it also allows me to make changes to the algorithm and find how fast / successful the solver is likely to be, and to run reports on guess count frequency, etc).

## Twitter?

You'll need your Twitter API keys to use the tweet features of this bot.

1. Copy `twitter.template.json` to `twitter.json`
2. Go to https://developer.twitter.com/en/portal/projects-and-apps, and click (+ Create App).
3. Name your app, then grab the `apiKey` and `apiSecret`; put these in `twitter.json`
4. In the sidebar, click on your new app's name, then on the "Keys and tokens" tab.
5. (Revoke) the Bearer Token; you won't be needing one.
5. Under "Access Token and Secret", generate the `accessToken` and `accessTokenSecret`, and put those into `twitter.json`.

## How'd you do the encoding?

Not telling.  If you're smart, you can parse through `lib/getTodaysPuzzle.mjs` and work it out.  If you're the author of Wordle and want to use something like this to hide the words, let me know and I'll share source.

## What's this about profiling?

You'll note there's an exclusion for `private/` in `.gitignore`.  That prevents me from committing the wordle solutions list and the scripts I run for doing stuff with it, and for profiling the bot.

No, you can't have those.

## Hey!  I ran it for day X, and it output something different than what it tweeted!

Yeah.  I've been futzing with it since the first tweet.  What about it?
Wordle 210 5/6
