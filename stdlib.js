// PRIVATE SECTION

// ZATACKA.EXE never calls `srand` or `randomize` (not implemented here),
// so every game run starts with seed 1 and uses the same random sequence.
let __seed = 1;

// PRIVATE SECTION END

function malloc(size) {
    return Array(size).fill(0);
}

function free(address) {
    address.length = 0;
}

function exit(code) {
    throw new Error(`Program exited with code ${code}`);
}

// Sources:
// https://jacobfilipp.com/DrDobbs/articles/CUJ/1995/9509/becker/becker.htm
// https://oeis.org/A384432
// https://tasvideos.org/GameResources/DOS/MarioTeachesTyping
function random(n) {
  __seed = (Math.imul(__seed, 0x015a4e35) + 1) | 0;
  return Math.trunc((((__seed >>> 16) & 0x7fff) * ((n << 16) >> 16)) / 0x8000);
}

function itoa(i, buffer, base) {
    const string = i.toString(base);
    const length = Math.min(buffer.length, string.length);
    for (let i = 0; i < length; i++) {
        buffer[i] = string[i];
    }
}
