const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
};

let game = {
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  cols: 1,
  rows: 1,
  width: 640,
  height: 360,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  score: 0,
  running: true,
  init: function () {
    this.ctx = document.getElementById("myCanvas").getContext("2d");
    this.setEvent();
  },

  preload(callback) {
    let loaded = 0;
    let required = Object.keys(this.sprites).length;

    let onImageLoaded = () => {
      loaded++;
      if (loaded >= required) {
        callback();
      }
    };

    for (const key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;

      this.sprites[key].addEventListener("load", onImageLoaded);
    }
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.ball,
      0,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.width,
      this.ball.height
    );
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },
  renderBlocks() {
    for (let block of this.blocks) {
      if (block.active) {
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
      }
    }
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          active: true,
          x: 64 * col + 65,
          y: 24 * row + 35,
          width: 60,
          height: 20,
        });
      }
    }
  },
  end(message) {
    alert(message);
    game.running = false;
    window.location.reload();
  },
  setEvent() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.platform.stop();
    });
  },
  addScore() {
    this.score++;
    if (this.score >= this.blocks.length) {
      this.end('WIN');
    }
  },
  update() {
    this.collideBlock();
    this.collidePlatform();
    this.ball.collideWorldBounds();
    this.platform.collideWorldBounds();
    this.ball.move();
    this.platform.move();
  },
  collideBlock() {
    for (const block of this.blocks) {
      if (this.ball.collide(block) && block.active) {
        this.ball.bumbBlock(block);
        this.addScore();
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumbPlatform(this.platform);
    }
  },

  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update();
        this.render();
        this.run();
      });
    }

  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  start: function () {
    this.init();
    this.preload(() => {
      this.create();
      this.run();
    });
  },
};

game.ball = {
  velocity: 4,
  dy: 0,
  dx: 0,
  x: 320,
  y: 280,
  width: 20,
  height: 20,

  start() {
    this.dy = -this.velocity;
    this.dx = game.random(-this.velocity, this.velocity);
  },

  move() {
    if (this.dy) {
      this.y += this.dy;
    }
    if (this.dx) {
      this.x += this.dx;
    }
  },

  collide(element) {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (
      x < element.x + element.width &&
      y < element.y + element.height &&
      x + this.width > element.x &&
      y + this.height > element.y
    ) {
      return true;
    }
  },
  collideWorldBounds() {
    let x = this.x + this.dx;
    let y = this.y + this.dy;
    let ballLeft = x;
    let ballRight = x + this.width;
    let ballTop = y;
    let ballBottom = y + this.height;

    if (ballLeft < 0) {
      this.dx *= -1;
    } else if (ballRight > game.width) {
      this.dx *= -1;
    } else if (ballTop < 0) {
      this.dy *= -1;
    } else if (ballBottom > game.height) {
      game.end('game over!');
    }
  },
  bumbBlock(block) {
    this.dy *= -1;
    block.active = false;
  },

  bumbPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx;
    }
    if (this.dy > 0) {
      this.dy = -this.velocity;
      let touchX = this.x + this.width / 2;
      this.dx = this.velocity * game.platform.getTouchOffset(touchX);
    }

  },
};

game.platform = {
  velocity: 6,
  dx: 0,
  x: 280,
  y: 300,
  width: 100,
  height: 14,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },

  start(e) {
    if (e === KEYS.LEFT) {
      this.dx = -this.velocity;
    } else if (e === KEYS.RIGHT) {
      this.dx = this.velocity;
    }
  },

  stop() {
    this.dx = 0;
  },

  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;

      }
    }
  },
  collideWorldBounds() {
    let x = this.x + this.dx;
    let platformLeft = x;
    let platformRight = platformLeft + this.width;

    if (platformLeft < 0 || platformRight > game.width) {
      this.dx = 0;
    }
  },
  getTouchOffset(touchX) {
    let diff = this.x + this.width - touchX;
    let offset = this.width - diff;
    let result = (2 * offset) / this.width;
    return result - 1;
  },
};

window.addEventListener("load", () => {
  game.start();
});
