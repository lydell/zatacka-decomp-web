function malloc(size) {
    return Array(size).fill(0);
}

function free(address) {
    address.length = 0;
}

function exit(code) {
    throw new Error(`Program exited with code ${code}`);
}

function random(n) {
    return Math.floor(Math.random() * n);
}

function itoa(i, buffer, base) {
    const string = i.toString(base);
    const length = Math.min(buffer.length, string.length);
    for (let i = 0; i < length; i++) {
        buffer[i] = string[i];
    }
}
