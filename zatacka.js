/**
 * JavaScript translation of the reconstructed C++ source of "Achtung, die Kurve!" for MS-DOS (ZATACKA.EXE),
 * which was crafted by Simon Alling and Simon Lydell with Claude Opus 5.5 from a disassembly of the original binary.
 * The JavaScript translation was done by Simon Lydell.
 *
 * Source: https://github.com/SimonAlling/zatacka-decomp/blob/17d557f4b54ac55b0dd05ae0827be1f5e9ff9f52/zatacka.cpp
 */
// #include <graphics.h>
// #include <stdlib.h>
// #include <stdio.h>
// #include <conio.h>
// #include <dos.h>
// #include <math.h>

const TSCR_FONT = TRIPLEX_SCR_FONT // Triplex Script, font number 7 in Borland Graphics Interface
const CHAR_SIZE_8X8 =   1 // DEFAULT_FONT at scale 1: 8x8-pixel characters
const CHAR_SIZE_16X16 = 2 // DEFAULT_FONT at scale 2: 16x16-pixel characters

const ID_RED = 0
const ID_YELLOW = 1
const ID_ORANGE = 2
const ID_GREEN = 3
const ID_PINK = 4
const KEYBOARD_PLAYER_COUNT = 5
const ID_BLUE = 5 // uses mouse
const PLAYER_COUNT = 6

const HOLECYCLE_COUNTDOWN_MIN =   100
const HOLECYCLE_COUNTDOWN_RANGE = 200 // countdown 100..299, i.e. cycles of 101..300 ticks
const HOLE_TICKS_MIN =   7
const HOLE_TICKS_RANGE = 5            // 7..11

const SPAWN_MARGIN = 100
const SPAWN_FLICKER_COUNT = 8

const MIN_ROUNDS = 10
#define score_to_win(participants) (((participants) - 1) * MIN_ROUNDS)

const THE_THICKNESS = 3
const TWO = (THE_THICKNESS - 1)

const SCREEN_WIDTH = 640
const SCREEN_HEIGHT = 480
const CANVAS_WIDTH = 559
const BORDER_WIDTH = 4
const SCORE_MARGIN = 9
const SCORE_CLEAR_MARGIN = 6
const SCORE_ROW_HEIGHT = 80 // needs to be at least as large as the digit height

const LOBBY_CONTROLS_X = 80
const LOBBY_READY_X = 240
const LOBBY_READY_CLEAR_RIGHT = 400
const LOBBY_ROW_HEIGHT = 50
#define lobby_row_y(id) ((id) * LOBBY_ROW_HEIGHT + LOBBY_ROW_HEIGHT)

const TURN_RATE = 0.035 // radians per tick

const KEYBOARD_INTERRUPT = 0x09 // interrupt vector number of the keyboard (IRQ 1, which the BIOS maps to vector 8 + 1)
const KEYBOARD_IO_PORT = 0x60 // I/O port for keyboard scancodes
const PIC_COMMAND_PORT = 0x20 // master 8259 PIC
const PIC_EOI =          0x20 // end of interrupt (coincidentally equal to the port)

const VIDEO_INTERRUPT =                     0x10   // BIOS video services
const VIDEO_SET_OVERSCAN_COLOR =            0x1001 // with this in AX, border (overscan) color is set to value in BH
const OVERSCAN_BORDER_COLOR_RAW_DAC_INDEX = 14     // VGA DAC entry, not a BGI color: the game never sets DAC 14 (BGI color 14 is DAC 62)

const MOUSE_INTERRUPT =    0x33 // mouse driver (MOUSE.COM etc.) services
const MOUSE_GET_STATUS =   3    // function number in AX: returns the button bits in BX, the cursor position in CX, DX
const MOUSE_BUTTON_LEFT =  1
const MOUSE_BUTTON_RIGHT = 2

const TEXT_SPLASH = "Achtung, die Kurve !"
const TEXT_READY = "READY"
const TEXT_CONTROLS_RED = "(1 Q)"
const TEXT_CONTROLS_YELLOW = "(L.Ctrl L.Alt)"
const TEXT_CONTROLS_ORANGE = "(M ,)"
const TEXT_CONTROLS_GREEN = "(L.Arrow D.Arrow)"
const TEXT_CONTROLS_PINK = "(/ *)"
const TEXT_CONTROLS_BLUE = "(L.Mouse R.Mouse)"
const TEXT_GAME_OVER = "KONEC HRY"

const KEYUP_BITMASK =            0x80
const KEYDOWN_ESC =              0x01
const KEYUP_ESC =                (KEYDOWN_ESC | KEYUP_BITMASK)
const KEYDOWN_SPACE =            0x39
const KEYUP_SPACE =              (KEYDOWN_SPACE | KEYUP_BITMASK)
const KEYDOWN_M =                0x32
const KEYUP_M =                  (KEYDOWN_M | KEYUP_BITMASK)
const KEYDOWN_COMMA =            0x33
const KEYUP_COMMA =              (KEYDOWN_COMMA | KEYUP_BITMASK)
const KEYDOWN_LEFT_CTRL =        0x1D
const KEYUP_LEFT_CTRL =          (KEYDOWN_LEFT_CTRL | KEYUP_BITMASK)
const KEYDOWN_LEFT_ALT =         0x38
const KEYUP_LEFT_ALT =           (KEYDOWN_LEFT_ALT | KEYUP_BITMASK)
const KEYDOWN_LEFT_ARROW =       0x4B
const KEYUP_LEFT_ARROW =         (KEYDOWN_LEFT_ARROW | KEYUP_BITMASK)
const KEYDOWN_DOWN_ARROW =       0x50
const KEYUP_DOWN_ARROW =         (KEYDOWN_DOWN_ARROW | KEYUP_BITMASK)
const KEYDOWN_NUMPAD_SLASH =     0x35
const KEYUP_NUMPAD_SLASH =       (KEYDOWN_NUMPAD_SLASH | KEYUP_BITMASK)
const KEYDOWN_NUMPAD_ASTERISK =  0x37
const KEYUP_NUMPAD_ASTERISK =    (KEYDOWN_NUMPAD_ASTERISK | KEYUP_BITMASK)
const KEYDOWN_1 =                0x02
const KEYUP_1 =                  (KEYDOWN_1 | KEYUP_BITMASK)
const KEYDOWN_Q =                0x10
const KEYUP_Q =                  (KEYDOWN_Q | KEYUP_BITMASK)

// How the colors are used in the game (BGI color numbers, i.e. indices into palette):
const CANVAS_COLOR = 0
#define border_color(i) (7 - (i))
#define player_color(id) (8 + (id))
const SCOREBOARD_COLOR = 14
const TEXT_COLOR = 15

#define is_obstacle(x, y) (getpixel(x, y) > player_color(0) - 1) // likely intention: player colors; actual meaning: also scoreboard color (but not its border) and text

int palette[16][3] = { // DS:00AA  6-bit VGA DAC R,G,B per BGI color
    { 0,  0,  0}, // CANVAS_COLOR (black)
    { 8,  8,  8}, // unused
    {12, 12, 12}, // unused
    {16, 16, 16}, // unused
    {20, 20, 20}, // border_color(3)
    {24, 24, 24}, // border_color(2)
    {28, 28, 28}, // border_color(1)
    {32, 32, 32}, // border_color(0)
    {63, 10,  0}, // player_color(ID_RED)
    {48, 48,  0}, // player_color(ID_YELLOW)
    {63, 30,  0}, // player_color(ID_ORANGE)
    { 0, 50,  0}, // player_color(ID_GREEN)
    {55, 20, 45}, // player_color(ID_PINK)
    { 0, 40, 50}, // player_color(ID_BLUE)
    {15, 15, 15}, // SCOREBOARD_COLOR (gray)
    {63, 63, 63}, // TEXT_COLOR (white)
};

volatile int key_esc;                                   // DS:0EBE
volatile int key_space;                                 // DS:0EC0
int unused_0EC2[12];                                    // DS:0EC2  24 bytes never referenced by the game code; type unknown
int mouse_left;                                         // DS:0EDA  nonzero while the left or middle button is down (mouse buttons with the right bit cleared)
int mouse_right;                                        // DS:0EDC  nonzero while the right or middle button is down (mouse buttons with the left bit cleared)
int px[PLAYER_COUNT];                                   // DS:0EDE  head pixel x (left column of the 3x3) after the last accepted move
int py[PLAYER_COUNT];                                   // DS:0EEA  head pixel y (top row of the 3x3) after the last accepted move
int hole_ticks[PLAYER_COUNT];                           // DS:0EF6  hole length in ticks
int score[PLAYER_COUNT];                                // DS:0F02
int joined[PLAYER_COUNT];                               // DS:0F0E
int holecycle_countdown[PLAYER_COUNT];                  // DS:0F1A  counts down: solid while > hole_ticks, then hole until 0, where both are re-rolled
int dead[PLAYER_COUNT];                                 // DS:0F26  1 = dead or not playing
volatile int keyL[KEYBOARD_PLAYER_COUNT];               // DS:0F32
volatile int keyR[KEYBOARD_PLAYER_COUNT];               // DS:0F3C
int prev_px[PLAYER_COUNT];                              // DS:0F46  px before this tick
int prev_py[PLAYER_COUNT];                              // DS:0F52  py before this tick
int alive_count;                                        // DS:0F5E
int participating_count;                                // DS:0F60
int cur_player;                                         // DS:0F62
int loop_i;                                             // DS:0F64  scratch loop variable
float x[PLAYER_COUNT];                                  // DS:0F66  exact head position; px is the truncated value
float y[PLAYER_COUNT];                                  // DS:0F7E  exact head position; py is the truncated value
float dir[PLAYER_COUNT];                                // DS:0F96  direction in radians (0 = down, grows counter-clockwise)
void *img_head[PLAYER_COUNT];                           // DS:0FAE  3x3 image in each player's color
void *img_bg[PLAYER_COUNT];                             // DS:0FBA  background under the head; malloc'd, never initialized
void interrupt (*old_keyboard_isr)(...);                // DS:0FC6

// CS:02C2  read the scancode, set (make code) or clear (break code) the flag
// should only write to `volatile` variables, or a modern compiler might optimize `while (…)` into an infinite loop (Borland C++ 3.1 doesn't)
void interrupt keyboard_isr(...)
{
    unsigned char scancode = inportb(KEYBOARD_IO_PORT);

    switch (scancode) {
    case KEYDOWN_ESC:             key_esc = 1; break;
    case KEYUP_ESC:               key_esc = 0; break;
    case KEYDOWN_SPACE:           key_space = 1; break;
    case KEYUP_SPACE:             key_space = 0; break;
    // The following cases are not in player order, but this is the order in the original:
    case KEYDOWN_M:               keyL[ID_ORANGE] = 1; break;
    case KEYUP_M:                 keyL[ID_ORANGE] = 0; break;
    case KEYDOWN_COMMA:           keyR[ID_ORANGE] = 1; break;
    case KEYUP_COMMA:             keyR[ID_ORANGE] = 0; break;
    case KEYDOWN_LEFT_CTRL:       keyL[ID_YELLOW] = 1; break;
    case KEYUP_LEFT_CTRL:         keyL[ID_YELLOW] = 0; break;
    case KEYDOWN_LEFT_ALT:        keyR[ID_YELLOW] = 1; break;
    case KEYUP_LEFT_ALT:          keyR[ID_YELLOW] = 0; break;
    case KEYDOWN_LEFT_ARROW:      keyL[ID_GREEN] = 1; break;
    case KEYUP_LEFT_ARROW:        keyL[ID_GREEN] = 0; break;
    case KEYDOWN_DOWN_ARROW:      keyR[ID_GREEN] = 1; break;
    case KEYUP_DOWN_ARROW:        keyR[ID_GREEN] = 0; break;
    case KEYDOWN_NUMPAD_SLASH:    keyL[ID_PINK] = 1; break;
    case KEYUP_NUMPAD_SLASH:      keyL[ID_PINK] = 0; break;
    case KEYDOWN_NUMPAD_ASTERISK: keyR[ID_PINK] = 1; break;
    case KEYUP_NUMPAD_ASTERISK:   keyR[ID_PINK] = 0; break;
    case KEYDOWN_1:               keyL[ID_RED] = 1; break;
    case KEYUP_1:                 keyL[ID_RED] = 0; break;
    case KEYDOWN_Q:               keyR[ID_RED] = 1; break;
    case KEYUP_Q:                 keyR[ID_RED] = 0; break;
    }

    // Acknowledge IRQ 1: send EOI to the master PIC.  Inline asm because outportb() would load the port into DX; the original uses the immediate-port form of OUT.
    asm mov al, PIC_EOI
    asm out PIC_COMMAND_PORT, al
}

// CS:048A  score text with the current color/font
void draw_int_text(int x, int y, int value)
{
    char buf[10];

    itoa(value, buf, 10);
    outtextxy(x, y, buf);
}

// CS:04B8  Blue steers with the mouse; the middle button counts as both
void poll_mouse_buttons(void)
{
    _AX = MOUSE_GET_STATUS;
    geninterrupt(MOUSE_INTERRUPT);
    mouse_left = _BX & ~MOUSE_BUTTON_RIGHT; // left or middle, to be precise
    mouse_right = _BX & ~MOUSE_BUTTON_LEFT; // right or middle, to be precise
}

// CS:04CE  also leaves the fill color set for later bar() calls
void clear_screen_color(int color)
{
    setfillstyle(SOLID_FILL, color);
    bar(0, 0, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1);
}

// CS:04F6  collision test of the 3x3 head when dx is not 0
int crashes_when_dx_is_not_zero(int x, int y, int dy)
{
    if (dy == -1) {
        if (is_obstacle(x, y)) return 1;
    } else if (dy == 1) {
        if (is_obstacle(x, y + TWO)) return 1;
    } else {
        if (is_obstacle(x, y) || is_obstacle(x, y + TWO)) return 1;
    }
    return 0;
}

// CS:056F  accept the new pixel position of cur_player or kill it; every survivor scores
void move_or_die(void)
{
    int xi = x[cur_player]; // BUG: rounding toward zero ⇒ possible to be almost 1px outside left edge (but still draw entirely within canvas)
    int yi = y[cur_player]; // BUG: rounding toward zero ⇒ possible to be almost 1px outside top edge (but still draw entirely within canvas)
    int dx = xi - px[cur_player];
    int dy = yi - py[cur_player];
    int j;

    if (xi == -1 || xi == CANVAS_WIDTH - TWO || yi == -1 || yi == SCREEN_HEIGHT - TWO)
        goto label_die;
    if (dx < 0) {
        if (crashes_when_dx_is_not_zero(xi, yi, dy)) goto label_die;
    } else if (dx > 0) {
        if (crashes_when_dx_is_not_zero(xi + TWO, yi, dy)) goto label_die;
    } else if (dy == -1) {
        if (is_obstacle(xi, yi) || is_obstacle(xi + TWO, yi)) goto label_die;
    } else if (dy == 1) {
        if (is_obstacle(xi, yi + TWO) || is_obstacle(xi + TWO, yi + TWO)) goto label_die;
    }
    px[cur_player] = xi;
    py[cur_player] = yi;
    return;

label_die:
    dead[cur_player] = 1;
    alive_count--;
    for (j = 0; j < PLAYER_COUNT; j++)
        if (!dead[j]) {
            setfillstyle(SOLID_FILL, SCOREBOARD_COLOR);
            loop_i = j * SCORE_ROW_HEIGHT; // surprising use of global loop variable
            bar(CANVAS_WIDTH + BORDER_WIDTH + SCORE_CLEAR_MARGIN, loop_i, SCREEN_WIDTH - 1, loop_i + SCORE_ROW_HEIGHT - 1);
            setcolor(player_color(j));
            draw_int_text(CANVAS_WIDTH + BORDER_WIDTH + SCORE_MARGIN, loop_i, ++score[j]);
        }
}

// CS:06FC
void main(void)
{
    int gdriver = VGA, gmode = VGAHI; // 640x480x16
    int errorcode;
    struct palettetype pal;
    unsigned size;
    register int xi, yi;

    initgraph(&gdriver, &gmode, ""); // look for EGAVGA.BGI in current directory
    errorcode = graphresult();
    if (errorcode != grOk) {
        printf("Graphics error: %s\n", grapherrormsg(errorcode));
        printf("Press any key to halt:");
        getch();
        exit(1);
    }

    // Configure overscan border:
    asm mov ax, VIDEO_SET_OVERSCAN_COLOR
    asm mov bh, OVERSCAN_BORDER_COLOR_RAW_DAC_INDEX // probably meant scoreboard color; actually shows the BIOS default for DAC 14 (probably EGA 001110, which is yellow; can be seen when running native/unemulated on a CRT)
    asm int VIDEO_INTERRUPT

    // Setup keyboard ISR:
    old_keyboard_isr = getvect(KEYBOARD_INTERRUPT);
    setvect(KEYBOARD_INTERRUPT, keyboard_isr);

    // Initialize BGI palette:
    getpalette(&pal);
    for (loop_i = 0; loop_i < pal.size; loop_i++)
        setrgbpalette(pal.colors[loop_i], palette[loop_i][0], palette[loop_i][1], palette[loop_i][2]); // BGI color i gets the RGB values in palette[i]

    // Initialize head sprites:
    size = imagesize(0, 0, TWO, TWO);
    for (loop_i = 0; loop_i < PLAYER_COUNT; loop_i++) {
        setfillstyle(SOLID_FILL, player_color(loop_i));
        bar(0, 0, TWO, TWO); // a scratchpad of sorts
        img_head[loop_i] = malloc(size);
        img_bg[loop_i] = malloc(size);
        getimage(0, 0, TWO, TWO, img_head[loop_i]);

        // BUG: cur_player (still 0), not loop_i: only Red gets timers.  The others start with holecycle_countdown = hole_ticks = 0, so their first tick takes the hole branch (which re-rolls the timers) and puts img_bg before anything has been stored in it: the fresh (zero-filled) buffer, which BGI reads as a 1x1 image, i.e. a single black pixel.
        holecycle_countdown[cur_player] = HOLECYCLE_COUNTDOWN_MIN + random(HOLECYCLE_COUNTDOWN_RANGE);
        hole_ticks[cur_player] = HOLE_TICKS_MIN + random(HOLE_TICKS_RANGE);
    }
    setfillstyle(SOLID_FILL, CANVAS_COLOR);
    bar(0, 0, TWO, TWO); // restore scratchpad

label_splash: // CS:08B9
    clear_screen_color(CANVAS_COLOR);
    setcolor(TEXT_COLOR);
    settextstyle(TSCR_FONT, HORIZ_DIR, USER_CHAR_SIZE);
    setusercharsize(3, 2, 2, 1); // arguments: width numerator, width denominator, height numerator, height denominator
    outtextxy(60, 170, TEXT_SPLASH);
    // new game with some state implicitly carried over from the previous one
    alive_count = 0;
    participating_count = 0;
    for (loop_i = 0; loop_i < PLAYER_COUNT; loop_i++) {
        dead[loop_i] = 1;
        score[loop_i] = 0;
        joined[loop_i] = 0;
    }
    delay(1000);
    while (!key_space)
        if (key_esc) goto label_quit;

    // lobby: left key joins, right key leaves; SPACE starts with at least 2 players
    clear_screen_color(CANVAS_COLOR);
    settextstyle(DEFAULT_FONT, HORIZ_DIR, CHAR_SIZE_8X8);
    setcolor(player_color(ID_RED));    outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_RED), TEXT_CONTROLS_RED);
    setcolor(player_color(ID_YELLOW)); outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_YELLOW), TEXT_CONTROLS_YELLOW);
    setcolor(player_color(ID_ORANGE)); outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_ORANGE), TEXT_CONTROLS_ORANGE);
    setcolor(player_color(ID_GREEN));  outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_GREEN), TEXT_CONTROLS_GREEN);
    setcolor(player_color(ID_PINK));   outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_PINK), TEXT_CONTROLS_PINK);
    setcolor(player_color(ID_BLUE));   outtextxy(LOBBY_CONTROLS_X, lobby_row_y(ID_BLUE), TEXT_CONTROLS_BLUE);
    settextstyle(DEFAULT_FONT, HORIZ_DIR, CHAR_SIZE_16X16);
    do {
        if (key_esc) goto label_quit;
        for (loop_i = 0; loop_i < KEYBOARD_PLAYER_COUNT; loop_i++) {
            if (keyL[loop_i] && !joined[loop_i]) {
                joined[loop_i] = 1;
                dead[loop_i] = 0;
                setcolor(player_color(loop_i));
                outtextxy(LOBBY_READY_X, lobby_row_y(loop_i), TEXT_READY);
                alive_count++;
                participating_count++;
            }
            if (keyR[loop_i] && joined[loop_i]) {
                joined[loop_i] = 0;
                dead[loop_i] = 1;
                bar(LOBBY_READY_X, lobby_row_y(loop_i), LOBBY_READY_CLEAR_RIGHT, lobby_row_y(loop_i) + LOBBY_ROW_HEIGHT - 1);
                alive_count--;
                participating_count--;
            }
        }
        poll_mouse_buttons();
        if (mouse_left && !joined[ID_BLUE]) {
            joined[ID_BLUE] = 1;
            dead[ID_BLUE] = 0;
            setcolor(player_color(ID_BLUE));
            outtextxy(LOBBY_READY_X, lobby_row_y(ID_BLUE), TEXT_READY);
            alive_count++;
            participating_count++;
        }
        if (mouse_right && joined[ID_BLUE]) {
            joined[ID_BLUE] = 0;
            dead[ID_BLUE] = 1;
            bar(LOBBY_READY_X, lobby_row_y(ID_BLUE), LOBBY_READY_CLEAR_RIGHT, lobby_row_y(ID_BLUE) + LOBBY_ROW_HEIGHT - 1);
            alive_count--;
            participating_count--;
        }
    } while (!key_space || participating_count <= 1);
    settextstyle(TSCR_FONT, HORIZ_DIR, USER_CHAR_SIZE); // the user char size from the splash screen still applies

label_round: // CS:0BDD
    clear_screen_color(CANVAS_COLOR);

    // Draw scoreboard:
    for (loop_i = 0; loop_i < BORDER_WIDTH; loop_i++) { // border lines in assorted gray colors
        setcolor(border_color(loop_i));
        line(loop_i + CANVAS_WIDTH, 0, loop_i + CANVAS_WIDTH, SCREEN_HEIGHT - 1);
    }
    setfillstyle(SOLID_FILL, SCOREBOARD_COLOR);
    bar(CANVAS_WIDTH + BORDER_WIDTH, 0, SCREEN_WIDTH - 1, SCREEN_HEIGHT - 1); // score panel

    // Draw initial scores:
    for (cur_player = 0; cur_player < PLAYER_COUNT; cur_player++)
        if (joined[cur_player]) {
            setcolor(player_color(cur_player));
            draw_int_text(CANVAS_WIDTH + BORDER_WIDTH + SCORE_MARGIN, cur_player * SCORE_ROW_HEIGHT, score[cur_player]);
        }

    setfillstyle(SOLID_FILL, CANVAS_COLOR);

    // Spawn players:
    for (cur_player = 0; cur_player < PLAYER_COUNT; cur_player++)
        if (joined[cur_player]) {
            xi = SPAWN_MARGIN + random(CANVAS_WIDTH - 2 * SPAWN_MARGIN + 2); // weird; unknown why 2 is added, or how exactly that was written in the original
            yi = SPAWN_MARGIN + random(SCREEN_HEIGHT - 2 * SPAWN_MARGIN);
            x[cur_player] = xi;
            y[cur_player] = yi;
            px[cur_player] = prev_px[cur_player] = xi;
            py[cur_player] = prev_py[cur_player] = yi;
            for (loop_i = 0; loop_i < SPAWN_FLICKER_COUNT; loop_i++) { // blink the start position
                putimage(px[cur_player], py[cur_player], img_head[cur_player], COPY_PUT);
                delay(50);
                bar(px[cur_player], py[cur_player], px[cur_player] + TWO, py[cur_player] + TWO);
                delay(50);
            }
            putimage(px[cur_player], py[cur_player], img_head[cur_player], COPY_PUT);
            dir[cur_player] = random(31415) / 10000.0; // random direction in [0, pi) – never westward
        }

    // Main game loop:
    for (;;) { // CS:0E14  one tick = 1 px per player
        for (cur_player = 0; cur_player < PLAYER_COUNT; cur_player++) {
            if (dead[cur_player])
                continue;

            // Update internal position:
            x[cur_player] = x[cur_player] + sin(dir[cur_player]);
            y[cur_player] = y[cur_player] + cos(dir[cur_player]);

            // Update pixel position:
            move_or_die();
            if (alive_count == 1)
                goto label_round_over;

            // Update hole status and draw:
            if (holecycle_countdown[cur_player] > hole_ticks[cur_player]) { // solid (head leaves permanent trail)
                putimage(px[cur_player], py[cur_player], img_head[cur_player], COPY_PUT);
                getimage(px[cur_player], py[cur_player], px[cur_player] + TWO, py[cur_player] + TWO, img_bg[cur_player]);
                holecycle_countdown[cur_player]--;
            } else { // hole (head leaves no trail)
                if (holecycle_countdown[cur_player] == 0) {
                    holecycle_countdown[cur_player] = HOLECYCLE_COUNTDOWN_MIN + random(HOLECYCLE_COUNTDOWN_RANGE);
                    hole_ticks[cur_player] = HOLE_TICKS_MIN + random(HOLE_TICKS_RANGE);
                } else
                    holecycle_countdown[cur_player]--;
                putimage(prev_px[cur_player], prev_py[cur_player], img_bg[cur_player], COPY_PUT);
                getimage(px[cur_player], py[cur_player], px[cur_player] + TWO, py[cur_player] + TWO, img_bg[cur_player]);
                putimage(px[cur_player], py[cur_player], img_head[cur_player], COPY_PUT);
            }
            prev_px[cur_player] = px[cur_player];
            prev_py[cur_player] = py[cur_player];

            // Handle player input:
            if (cur_player < KEYBOARD_PLAYER_COUNT) { // steering is sampled after the move
                if (keyL[cur_player]) dir[cur_player] = dir[cur_player] + TURN_RATE;
                if (keyR[cur_player]) dir[cur_player] = dir[cur_player] - TURN_RATE;
            } else {
                poll_mouse_buttons();
                if (mouse_left) dir[cur_player] = dir[cur_player] + TURN_RATE;
                if (mouse_right) dir[cur_player] = dir[cur_player] - TURN_RATE;
            }
        }
        delay(15 - alive_count / 2); // fewer players alive: longer frames
    }

label_round_over: // CS:1125
    for (loop_i = 0; loop_i < PLAYER_COUNT; loop_i++) {
        if (score[loop_i] > score_to_win(participating_count) - 1) {
            while (!key_space) // no ESC check here
                ;
            goto label_game_over;
        }
        if (joined[loop_i])
            dead[loop_i] = 0;
    }
    alive_count = participating_count;
    delay(1000);
    while (!key_space)
        if (key_esc) goto label_splash; // ESC between rounds: back to splash screen
    goto label_round;

label_game_over: // CS:119B
    clear_screen_color(CANVAS_COLOR);
    setcolor(TEXT_COLOR);
    outtextxy(180, 400, TEXT_GAME_OVER);
    settextstyle(DEFAULT_FONT, HORIZ_DIR, CHAR_SIZE_16X16);
    for (loop_i = 0; loop_i < PLAYER_COUNT; loop_i++)
        if (joined[loop_i]) {
            setcolor(player_color(loop_i));
            draw_int_text(250, loop_i * 40 + 80, score[loop_i]);
        }
    delay(1000);
    while (!key_space)
        if (key_esc) goto label_quit;
    goto label_splash;

label_quit: // CS:123F
    for (loop_i = 0; loop_i < PLAYER_COUNT; loop_i++) {
        free(img_head[loop_i]);
        free(img_bg[loop_i]);
    }
    setvect(KEYBOARD_INTERRUPT, old_keyboard_isr);
    closegraph();
    exit(0);
}
