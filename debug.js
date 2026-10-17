function main() {
    initgraph(VGA, VGAHI, "");
    const errorcode = graphresult();
    if (errorcode != grOk) {
        printf("Graphics error: %s\n", grapherrormsg(errorcode));
        exit(1);
    }
    const pal = {};
    getpalette(pal);
    for (let i = 0; i < pal.size; i++)
        setrgbpalette(pal.colors[i], palette[i][0], palette[i][1], palette[i][2]);
    setcolor(15);
    setfillstyle(SOLID_FILL, 8);
    bar(0, 0, 3, 3);
    line(3, 3, 3, 100)
    line(3, 100, 100, 100)
    const s = 10;
    const size = imagesize(0, 0, s, s);
    const buffer = malloc(size);
    getimage(0, 0, s, s, buffer);
    putimage(10, 0, buffer, COPY_PUT);
    outtextxy(20, 20, "Hello, world!");
    outtextxy(20, 40, "Buffer".split(""));
    console.log("pixel 0,0", getpixel(0, 0));
}
