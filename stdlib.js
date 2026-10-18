// PRIVATE SECTION

// ZATACKA.EXE never calls `srand` or `randomize` (not implemented here),
// so every game run starts with seed 1 and uses the same random sequence.
let __seed = 1;

// Catch `exit` calls.
window.addEventListener("unhandledrejection", (event) => {
    if (typeof event.reason === "number") {
        event.preventDefault();
        printf(`Exit ${event.reason}\n`);
        printf("Press any key to restart...\n");
        window.addEventListener("keydown", () => {
            window.location.reload();
        })
    }
}, true);

// PRIVATE SECTION END

function malloc(size) {
    return Array(size).fill(0);
}

function free(address) {
    address.length = 0;
}

function exit(code) {
    throw code;
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

// This function is actually from `stdio.h`, not `stdlib.h`. But the "unhandledrejection" handler above depends on it,
// and it’s the only thing from `stdio.h` we use.
function printf(format, ...args) {
    let element = document.createElement("div");
    element.id = "screen";
    const existing = document.getElementById(element.id);
    if (existing !== null) {
        if (existing instanceof HTMLCanvasElement) {
            existing.replaceWith(element);
        } else {
            element = existing;
        }
    } else {
        document.body.appendChild(element);
    }
    let i = 0;
    element.textContent += format.replace(/%s/g, () => args[i++]);
}

// These functions are actually from `math.h`, not `stdlib.h`. But we only use `sin` and `cos` from it,
// so it felt silly having a whole file just for those two. They fit pretty well in a stdlib, too.
function sin(x) {
    return Math.sin(x);
}

function cos(x) {
    return Math.cos(x);
}
