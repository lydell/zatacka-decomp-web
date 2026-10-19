# Zatacka Decomp Web

[Zatacka Decomp](https://github.com/SimonAlling/zatacka-decomp) converted from C++ to JavaScript, so it can run in a browser.

This project translates [zatacka.cpp](https://github.com/SimonAlling/zatacka-decomp/blob/17d557f4b54ac55b0dd05ae0827be1f5e9ff9f52/zatacka.cpp) into [zatacka.js](zatacka.js).

- `#include file.h` lines are replaced with `<script src="file.js"></script>` in [index.html](./index.html). `file.js` implements what’s needed to run the game, not the library in full.
- `#define CONSTANT value` is turned into `const CONSTANT = value`.
- `#define macro(x, y) (x + y)` is turned into `const macro = (x, y) => (x + y)`.
- `int x;` is turned into `let x = 0;`.
- `int arr[LENGTH];` is turned into `let arr = Array(LENGTH).fill(0);`.
- `float arr[LENGTH];` is turned into `let arr = new Float32Array(LENGTH);`, so that values are rounded to 32-bit floats like in C.
- `void *arr[LENGTH];` is turned into `let arr = Array(LENGTH);`.
- `int x = a_float;` is turned into `let x = Math.trunc(a_float);`.
- Integer division `an_int / 2` is turned into `Math.trunc(an_int / 2)`.
- Inline `asm` is commented out.
- Functions: The return type is replaced with the `function` keyword, and the parameter types are removed.
- `label_name:` is turned into `function label_name() {` (with a matching `}`).
- `goto label_name;` is turned into `return label_name();`.
- Extra `return label_name();` are inserted where the code previously fell into the next labelled block.
- `delay(ms);` is turned into `await delay(ms);`
- `while (!key_space);` is turned into `await wait_for_input(() => key_space);`.

To see all changes compared to `zatacka.cpp`:

    git diff --color-words='define|const|let|function|return|switch|while|do|goto|int|unsigned|struct|void|char|palettetype|PLAYER_ID|img_head|background under the head|image in each player|.' 814cfce228406e391163f80686a8ebd264de98d1... zatacka.js

The goal of this project is to make the original C++ code run in the browser with as few changes as possible. You can try it on [lydell.github.io/zatacka-decomp-web](https://lydell.github.io/zatacka-decomp-web/). When playing the game for fun, I recommend [kurve.se](https://kurve.se/), which is a faithful re-implementation with multiple quality of life tweaks.
