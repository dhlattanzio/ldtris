const skin = document.getElementById('source');
const canvas = document.getElementById('canvas');

const tetris = new Tetris();
const gameRenderer = new TetrisRenderer(tetris, canvas, 32, skin);

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
            tetris.rotateBlock(1);
            break
        case "x":
            tetris.rotateBlock(-1);
            break
        default:
            console.log(key);
            break
    }
});

tetris.start();