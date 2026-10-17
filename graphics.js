const VGA = Symbol("VGA");
const VGAHI = Symbol("VGAHI");
const grOk = Symbol("grOk");
const SOLID_FILL = Symbol("SOLID_FILL");
const COPY_PUT = Symbol("COPY_PUT");
const DEFAULT_FONT = Symbol("DEFAULT_FONT");
const TRIPLEX_SCR_FONT = Symbol("TRIPLEX_SCR_FONT");
const HORIZ_DIR = Symbol("HORIZ_DIR");
const USER_CHAR_SIZE = Symbol("USER_CHAR_SIZE");

function initgraph(gdriver, gmode, egavgabgi_path) {}

function graphresult() {}

function grapherrormsg(errorcode) {}

function closegraph() {}

function getpalette(pal) {}

function setrgbpalette(color, r, g, b) {}

function setcolor(color) {}

function setfillstyle(style, color) {}

function bar(x1, y1, x2, y2) {}

function line(x1, y1, x2, y2) {}

function getpixel(x, y) {}

function imagesize(x1, y1, x2, y2) {}

function getimage(x1, y1, x2, y2, buffer) {}

function putimage(x, y, buffer, mode) {}

function outtextxy(x, y, text) {}

function settextstyle(font, direction, size) {}

function setusercharsize(width_numerator, width_denominator, height_numerator, height_denominator) {}
