const skin = document.getElementById('source');
const canvas = document.getElementById('canvas-game');
const canvasBlockNext = document.getElementById('canvas-block-next');
const canvasBlockHold = document.getElementById('canvas-block-hold');

const tetris = new Tetris();
const gameRenderer = new TetrisRenderer(tetris, canvas, 32, skin, canvasBlockNext, canvasBlockHold);

document.addEventListener('keydown', event => {
    const key = (event.key.length == 1) ? event.key.toLowerCase() : event.key;
    switch(key) {
        case "ArrowRight":
            tetris.moveBlock(1);
            break
        case "ArrowLeft":
            tetris.moveBlock(-1);
            break
        case "ArrowDown":
            tetris.fastDownBlock();
            break
        case "ArrowUp":
            tetris.instantDownBlock();
            break
        case "z":
            tetris.rotateBlock(-1);
            break
        case "x":
            tetris.rotateBlock(1);
            break
        case " ":
            tetris.holdBlock();
            break
        default:
            console.log("key: " + key);
            break
    }
});

tetris.start();