# Zatacka Decomp Web

[Zatacka Decomp](https://github.com/SimonAlling/zatacka-decomp) converted from C++ to JavaScript, so it can run in a browser.

This project translates [zatacka.cpp](https://github.com/SimonAlling/zatacka-decomp/blob/17d557f4b54ac55b0dd05ae0827be1f5e9ff9f52/zatacka.cpp) into [zatacka.js](zatacka.js).

- `#include` is commented out.
- `#define CONSTANT value` is turned into `const CONSTANT = value`.
- `#define macro(x, y) (x + y)` is turned into `const macro = (x, y) => (x + y)`.
- `int x;` is turned into `let x = 0;`.
- `int arr[LENGTH];` is turned into `let arr = Array(LENGTH).fill(0);`.
- `void *arr[LENGTH];` is turned into `let arr = Array(LENGTH);`.
- Inline `asm` is commented out.
