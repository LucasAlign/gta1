import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { WorldScene } from "./scenes/WorldScene";

// Full-viewport, no-scroll config. Scale.RESIZE makes the canvas track the
// window exactly, so there's never a scrollbar or letterbox — the browser
// "clunkiness" the game is meant to avoid.
const config: Phaser.Types.Core.GameConfig = {
  // Canvas renderer (not WebGL): runs on the weakest hardware, has no framebuffer
  // setup to fail on odd/embedded mounts, and is plenty fast for a 2D top-down
  // game with a few dozen sprites. Matches this project's compatibility-first history.
  type: Phaser.CANVAS,
  parent: "game",
  backgroundColor: "#0d0f12",
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  render: { antialias: true, roundPixels: false },
  scene: [BootScene, WorldScene],
};

// Don't boot until the container actually has a non-zero size. Some embeds
// (background tabs, the Claude preview pane) briefly report a 0x0 layout, which
// makes the initial WebGL framebuffer incomplete and crashes scene setup.
function boot() {
  const parent = document.getElementById("game")!;
  const ready = () => parent.clientWidth > 0 && parent.clientHeight > 0;

  const start = () => {
    config.scale!.width = parent.clientWidth;
    config.scale!.height = parent.clientHeight;
    const game = new Phaser.Game(config);
    (window as unknown as { game: Phaser.Game }).game = game;
  };

  if (ready()) {
    start();
    return;
  }
  const ro = new ResizeObserver(() => {
    if (ready()) {
      ro.disconnect();
      start();
    }
  });
  ro.observe(parent);
}

boot();
