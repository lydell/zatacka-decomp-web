// PRIVATE SECTION

let __graphresult = 1;
let __color = 0;
let __fillcolor = 0;
let __ctx = null;
let __pixels = new Map();
let __pal = Array.from({ length: 16 }, () => ({ r: 0, g: 0, b: 0 }));

function __color64to256(v) {
    return Math.round(v / 63 * 255);
}

function __color_to_string({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
}

function __key(x, y) {
    return `${x},${y}`;
}

// PRIVATE SECTION END

const VGA = Symbol("VGA");
const VGAHI = Symbol("VGAHI");
const grOk = 0;
const SOLID_FILL = Symbol("SOLID_FILL");
const COPY_PUT = Symbol("COPY_PUT");
const DEFAULT_FONT = Symbol("DEFAULT_FONT");
const TRIPLEX_SCR_FONT = Symbol("TRIPLEX_SCR_FONT");
const HORIZ_DIR = Symbol("HORIZ_DIR");
const USER_CHAR_SIZE = Symbol("USER_CHAR_SIZE");

function initgraph(gdriver, gmode, egavgabgi_path) {
    if (gdriver !== VGA) {
        __graphresult = 2;
        return;
    }

    if (gmode !== VGAHI) {
        __graphresult = 3;
        return;
    }

    const canvas = document.getElementById("screen");

    if (canvas === null) {
        __graphresult = 4;
        return;
    }

    // Ugly hack: Read zatacka.js’ constants to define the screen size.
    // This allows modding the screen size more easily.
    canvas.width = typeof SCREEN_WIDTH === "number" ? SCREEN_WIDTH : 640;
    canvas.height = typeof SCREEN_HEIGHT === "number" ? SCREEN_HEIGHT : 480;

    __ctx = canvas.getContext("2d", { alpha: false });

    if (__ctx === null) {
        __graphresult = 5;
        return;
    }

    __graphresult = grOk;
}

function graphresult() {
    return __graphresult;
}

function grapherrormsg(errorcode) {
    switch (errorcode) {
    case 1:  return "Graphics not initialized";
    case 2:  return "Only VGA driver is supported";
    case 3:  return "Only VGAHI mode is supported";
    case 4:  return "Not connected to a screen";
    case 5:  return "2D graphics not supported";
    default: return "Unknown error";
    }
}

function closegraph() {
    __ctx.clearRect(0, 0, __ctx.canvas.width, __ctx.canvas.height);
    __ctx = null;
}

function getpalette(pal) {
    pal.colors = __pal;
    pal.size = __pal.length;
}

function setrgbpalette(color, r, g, b) {
    color.r = __color64to256(r);
    color.g = __color64to256(g);
    color.b = __color64to256(b);
}

function setcolor(color) {
    __color = color;
}

function setfillstyle(style, color) {
    if (style !== SOLID_FILL) {
        throw new Error(`Unrecognized fill: ${style}`)
    }
    __fillcolor = color;
}

function bar(x1, y1, x2, y2, __c=__fillcolor) {
    __ctx.fillStyle = __color_to_string(__pal[__c]);
    __ctx.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            __pixels.set(__key(x, y), __fillcolor);
        }
    }
}

function line(x1, y1, x2, y2) {
    if (x1 === x2) {
        bar(x1, y1, x2 + 1, y2, __color);
    } else if (y1 === y2) {
        bar(x1, y1, x2, y2 + 1, __color);
    } else {
        throw new Error(`The line function can only draw straight lines.`)
    }
}

function getpixel(x, y) {
    return __pixels.get(__key(x, y)) ?? 0;
}

function imagesize(x1, y1, x2, y2) {
    return (x2 - x1 + 1) * (y2 - y1 + 1);
}

function getimage(x1, y1, x2, y2, buffer) {
    let i = 0;
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            buffer[i++] = {
                dx: x - x1,
                dy: y - y1,
                color: __pixels.get(__key(x, y)) ?? 0,
            };
        }
    }
}

function putimage(x, y, buffer, mode) {
    if (mode !== COPY_PUT) {
        throw new Error(`Unrecognized mode: ${mode}`);
    }

    // BGI treats an uninitialized buffer as a 1x1 image.
    if (buffer[0] === 0) {
        __pixels.set(__key(x, y), 0);
        __ctx.fillStyle = __color_to_string(__pal[0]);
        __ctx.fillRect(x, y, 1, 1);
        return;
    }

    for (const { dx, dy, color } of buffer) {
        const xi = x + dx;
        const yi = y + dy;
        __pixels.set(__key(xi, yi), color);
        __ctx.fillStyle = __color_to_string(__pal[color]);
        __ctx.fillRect(xi, yi, 1, 1);
    }
}

function outtextxy(x, y, text) {
    // Temporary implementation.
    __ctx.fillStyle = __color_to_string(__pal[__color]);
    __ctx.fillText(Array.isArray(text) ? text.filter(c => c !== 0).join("") : text, x, y + 20);
}

function settextstyle(font, direction, size) {
    // TODO.
}

function setusercharsize(width_numerator, width_denominator, height_numerator, height_denominator) {
    // TODO.
}
