class Player {
  spriteLibrary = {
    sprite1: {
      spriteSheet: "./assets/adventurer_sprite_sheet_v1.1.png",
      spriteWidth: 32,
      spriteHeight: 32,
      states: [
        {
          name: "idle",
          row: 0,
          column: { min: 1, max: 13, paddingX: 0, paddingY: 0 },
        },
        {
          name: "run",
          row: 1,
          column: { min: 1, max: 8, paddingX: 0, paddingY: 0 },
        },
        {
          name: "skip",
          row: 5,
          column: { min: 1, max: 6, paddingX: 0, paddingY: 0 },
        },
        {
          name: "slashAngle",
          row: 3,
          column: { min: 1, max: 10, paddingX: 0, paddingY: 0 },
        },
        {
          name: "look",
          row: 0,
          column: { min: 1, max: 13, paddingX: 0, paddingY: 0 },
        },
        {
          name: "slashUp",
          row: 2,
          column: { min: 1, max: 10, paddingX: 0, paddingY: 0 },
        },
        {
          name: "slashForward",
          row: 4,
          column: { min: 1, max: 10, paddingX: 0, paddingY: 0 },
        },
        {
          name: "hit",
          row: 6,
          column: { min: 1, max: 4, paddingX: 0, paddingY: 0 },
        },
        {
          name: "hitKO",
          row: 7,
          column: { min: 1, max: 7, paddingX: 0, paddingY: 0 },
        },
      ],
    },
    sprite2: {
      spriteSheet: "./assets/b9fe2deac829fac6b9480983478e4109e3993e87.png",
      spriteWidth: 45,
      spriteHeight: 72,
      states: [
        {
          name: "idle",
          row: 3,
          column: { min: 1, max: 2, paddingX: 32, paddingY: 4 },
          loc: [
            {
              sx: 25,
              sy: 220,
              sw: 42,
              sh: 72,
            },
            {
              sx: 257,
              sy: 220,
              sw: 42,
              sh: 72,
            },
          ],
        },
        {
          name: "run",
          row: 5,
          column: { min: 1, max: 8, paddingX: 32, paddingY: 4 },
          loc: [
            {
              sx: 25,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 70,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 122,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 167,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 212,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 257,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 302,
              sy: 364,
              sw: 45,
              sh: 72,
            },
            {
              sx: 347,
              sy: 364,
              sw: 44,
              sh: 72,
            },
          ],
        },
        {
          name: "jump",
          row: 3,
          column: { min: 1, max: 7, paddingX: 32, paddingY: 4 },
          loc: [
            {
              sx: 25,
              sy: 220,
              sw: 42,
              sh: 72,
            },
            {
              sx: 65,
              sy: 220,
              sw: 43,
              sh: 72,
            },
            {
              sx: 102,
              sy: 220,
              sw: 44,
              sh: 72,
            },
            {
              sx: 144,
              sy: 220,
              sw: 39,
              sh: 72,
            },
            {
              sx: 181,
              sy: 220,
              sw: 44,
              sh: 72,
            },
            {
              sx: 219,
              sy: 220,
              sw: 45,
              sh: 72,
            },
            {
              sx: 257,
              sy: 220,
              sw: 42,
              sh: 72,
            },
          ],
        },
        {
          name: "kneel",
          row: 3,
          column: { min: 1, max: 4, paddingX: 32, paddingY: 4 },
          loc: [
            {
              sx: 25,
              sy: 220,
              sw: 42,
              sh: 72,
            },
            {
              sx: 181,
              sy: 220,
              sw: 42,
              sh: 72,
            },
            {
              sx: 219,
              sy: 220,
              sw: 45,
              sh: 72,
            },
            {
              sx: 257,
              sy: 220,
              sw: 42,
              sh: 72,
            },
          ],
        },
        {
          name: "block",
          row: 0,
          column: { min: 1, max: 7, paddingX: 32, paddingY: 4 },
          loc: [
            {
              sx: 20,
              sy: 220,
              sw: 45,
              sh: 72,
            },
            {
              sx: 65,
              sy: 220,
              sw: 43,
              sh: 72,
            },
            {
              sx: 102,
              sy: 220,
              sw: 44,
              sh: 72,
            },
            {
              sx: 144,
              sy: 220,
              sw: 39,
              sh: 72,
            },
            {
              sx: 181,
              sy: 220,
              sw: 44,
              sh: 72,
            },
            {
              sx: 219,
              sy: 220,
              sw: 45,
              sh: 72,
            },
            {
              sx: 257,
              sy: 220,
              sw: 43,
              sh: 72,
            },
          ],
        },
      ],
    },
  };

  constructor(width, height, x = 0, y = 0, DEFAULT_FPS = 14) {
    this.sprite = this.spriteLibrary.sprite1;

    this.ctx = null;
    this.image = null;
    this.x = x;
    this.y = y;
    this.spriteWidth = 0;
    this.spriteHeight = 0;
    this.frame = 1;
    this.frameSpeed = DEFAULT_FPS;
    this.DEFAULT_FPS = DEFAULT_FPS;
    this.width = width;
    this.height = height;
    this.stateIndex = 0;
    this.setState();
  }

  incrementX(inc) {
    this.x += inc ?? 1;
  }

  draw(ctx) {
    this.ctx = ctx;
    const width = this.width ?? this.spriteWidth;
    const height = this.height ?? this.spriteHeight;

    const framePos =
      Math.floor((this.frame - 1) / this.frameSpeed) % this.state.column.max;
    // console.log({ framePos });

    const frameX =
      this.state?.loc?.[framePos]?.sx ??
      this.spriteWidth * framePos + (this.state.column.paddingX ?? 0);

    const frameY =
      this.state?.loc?.[framePos]?.sy ??
      this.spriteHeight * this.state.row + (this.state.column.paddingY ?? 0);

    const frameWidth = this.state?.loc?.[framePos]?.sw ?? this.spriteWidth;
    const frameHeight = this.state?.loc?.[framePos]?.sh ?? this.spriteHeight;

    // if (this.state.column.max === this.state.loc.length) {
    //   console.log(this.state.loc, this.frame);
    // } else {
    //   this.state.loc.push({
    //     sx: frameX,
    //     sy: frameY,
    //     sw: this.spriteWidth,
    //     sh: this.spriteHeight,
    //   });
    // }

    ctx.drawImage(
      this.image,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
      this.x,
      this.y,
      width,
      height
    );
    this.nextFrame();
  }

  spawn(ctx, frameSpeed, spriteName = "sprite1") {
    this.sprite = this.spriteLibrary[spriteName] ?? this.spriteLibrary.sprite1;
    this.spriteWidth = this.sprite.spriteWidth;
    this.spriteHeight = this.sprite.spriteHeight;

    const playerImage = new Image();
    playerImage.style.objectFit = "contain";
    playerImage.src = this.sprite.spriteSheet;

    this.image = playerImage;

    this.frameSpeed = frameSpeed ?? this.frameSpeed ?? this.DEFAULT_FPS;
    this.ctx = ctx;
    this.draw(ctx);
  }

  nextFrame() {
    this.setState();
    this.frame += 1;
  }

  setState(state, frameSpeed) {
    state = state ?? this.stateIndex;
    frameSpeed = frameSpeed ?? this.frameSpeed;

    this.stateIndex = state;
    this.frameSpeed = frameSpeed;
    this.state = this.sprite.states[this.stateIndex];
  }
}
