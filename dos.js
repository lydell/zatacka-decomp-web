// PRIVATE SECTION

let __b = 0;
let __noop = () => {};
let __vect = __noop;
let __waiting = __noop;

window.addEventListener("keydown", (event) => {
    if (__vect !== __noop) {
        event.preventDefault();
    }
    __b = __scancode(event.code);
    __vect();
    __waiting();
});

window.addEventListener("keyup", (event) => {
    if (__vect !== __noop) {
        event.preventDefault();
    }
    __b = __scancode(event.code) | 0x80;
    __vect();
    __waiting();
});

// Sources:
// https://www.freebasic.net/wiki/GfxScancodes
// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
function __scancode(code) {
    switch (code) {
    case "Escape":         return 0x01;
    case "Digit1":         return 0x02;
    case "Digit2":         return 0x03;
    case "Digit3":         return 0x04;
    case "Digit4":         return 0x05;
    case "Digit5":         return 0x06;
    case "Digit6":         return 0x07;
    case "Digit7":         return 0x08;
    case "Digit8":         return 0x09;
    case "Digit9":         return 0x0A;
    case "Digit0":         return 0x0B;
    case "Minus":          return 0x0C;
    case "Equal":          return 0x0D;
    case "Backspace":      return 0x0E;
    case "Tab":            return 0x0F;
    case "KeyQ":           return 0x10;
    case "KeyW":           return 0x11;
    case "KeyE":           return 0x12;
    case "KeyR":           return 0x13;
    case "KeyT":           return 0x14;
    case "KeyY":           return 0x15;
    case "KeyU":           return 0x16;
    case "KeyI":           return 0x17;
    case "KeyO":           return 0x18;
    case "KeyP":           return 0x19;
    case "BracketLeft":    return 0x1A;
    case "BracketRight":   return 0x1B;
    case "Enter":          return 0x1C;
    case "ControlLeft":    return 0x1D;
    case "KeyA":           return 0x1E;
    case "KeyS":           return 0x1F;
    case "KeyD":           return 0x20;
    case "KeyF":           return 0x21;
    case "KeyG":           return 0x22;
    case "KeyH":           return 0x23;
    case "KeyJ":           return 0x24;
    case "KeyK":           return 0x25;
    case "KeyL":           return 0x26;
    case "Semicolon":      return 0x27;
    case "Quote":          return 0x28;
    case "Backquote":      return 0x29;
    case "ShiftLeft":      return 0x2A;
    case "Backslash":      return 0x2B;
    case "KeyZ":           return 0x2C;
    case "KeyX":           return 0x2D;
    case "KeyC":           return 0x2E;
    case "KeyV":           return 0x2F;
    case "KeyB":           return 0x30;
    case "KeyN":           return 0x31;
    case "KeyM":           return 0x32;
    case "Comma":          return 0x33;
    case "Period":         return 0x34;
    case "Slash":          return 0x35;
    case "ShiftRight":     return 0x36;
    case "NumpadMultiply": return 0x37;
    case "AltLeft":        return 0x38;
    case "Space":          return 0x39;
    case "CapsLock":       return 0x3A;
    case "F1":             return 0x3B;
    case "F2":             return 0x3C;
    case "F3":             return 0x3D;
    case "F4":             return 0x3E;
    case "F5":             return 0x3F;
    case "F6":             return 0x40;
    case "F7":             return 0x41;
    case "F8":             return 0x42;
    case "F9":             return 0x43;
    case "F10":            return 0x44;
    // case "SC_NUMLOCK":  return 0x45; // Not supported on the web.
    case "ScrollLock":     return 0x46;
    case "Home":           return 0x47;
    case "ArrowUp":        return 0x48;
    case "PageUp":         return 0x49;
    case "ArrowLeft":      return 0x4B;
    // case "SC_CLEAR":    return 0x4C; // Not supported on the web.
    // case "SC_CENTER":   return 0x4C; // Not supported on the web.
    case "ArrowRight":     return 0x4D;
    // case "SC_PLUS":     return 0x4E; // Not supported on the web.
    case "End":            return 0x4F;
    case "ArrowDown":      return 0x50;
    case "PageDown":       return 0x51;
    case "Insert":         return 0x52;
    case "Delete":         return 0x53;
    case "F11":            return 0x57;
    case "F12":            return 0x58;
    default:               return 0;
    }
}

let __bx = 0;

window.addEventListener("mousedown", (event) => {
    if (__vect !== __noop) {
        event.preventDefault();
    }
    __bx = event.buttons;
    __waiting();
});

window.addEventListener("mouseup", (event) => {
    if (__vect !== __noop) {
        event.preventDefault();
    }
    __bx = event.buttons;
    __waiting();
});


// PRIVATE SECTION END

let _AX = 0;
let _BX = 0;

function inportb(port) {
    switch (port) {
    case 0x60:
        return __b;
    default:
        throw new Error(`Unrecognized port: ${port}`);
    }
}

function geninterrupt(interrupt) {
    switch (interrupt) {
    case 0x33:
        switch (_AX) {
        case 3:
            _BX = __bx;
            break;
        default:
            throw new Error(`Unrecognized _AX: ${_AX}`);
        }
        break;
    default:
        throw new Error(`Unrecognized interrupt: ${interrupt}`);
    }
}

function getvect(interrupt) {
    switch (interrupt) {
    case 0x09:
        return __vect;
    default:
        throw new Error(`Unrecognized interrupt: ${interrupt}`);
    }
}

function setvect(interrupt, isr) {
    switch (interrupt) {
    case 0x09:
        __vect = isr;
        break;
    default:
        throw new Error(`Unrecognized interrupt: ${interrupt}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Extension for JavaScript, since we can’t do things like `while (!key_space);` there.
function wait_for_input(f) {
    const { promise, resolve, reject } = Promise.withResolvers();
    if (__waiting === __noop) {
        __waiting = () => {
            const ret = f();
            if (ret) {
                __waiting = __noop;
                resolve(ret);
            }
        };
        __waiting();
    } else {
        reject(new Error("Already waiting for input"));
    }
    return promise;
}
