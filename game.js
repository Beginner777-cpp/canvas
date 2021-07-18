let game = {
  ctx: null,
  platform: null,
  ball: null,
  sprites: {
    background: null,
    ball: null,
    platform: null,
  },

  init: function () {
    this.ctx = document.getElementById("myCanvas").getContext("2d");
  },

  preload(callback) {
    let loaded = 0;
    let required = Object.keys(this.sprites).length;
    for (const key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;

      this.sprites[key].addEventListener("load", () => {
        loaded++;
        if (loaded >= required) {
          callback();
        }
      });
    }
  },
  render() {
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
  },
  run() {
    window.requestAnimationFrame(() => {
      this.render();
    });
  },

  start: function () {
    this.init();
    this.preload(()=>{
      this.run();
    });
  },
};

game.platform = {
  x: 280,
  y: 300,
}
game.ball = {
  x: 320,
  y: 280,
}

window.addEventListener("load", () => {
  game.start();
});
