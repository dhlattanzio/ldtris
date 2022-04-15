const skin = document.getElementById('source');
const canvas = document.getElementById('canvas-game');
const canvasBlockNext = document.getElementById('canvas-block-next');
const canvasBlockHold = document.getElementById('canvas-block-hold');

const ldtris = new LDTris();
const gameRenderer = new LDTrisRenderer(ldtris, canvas, 32, skin, canvasBlockNext, canvasBlockHold);

document.addEventListener('keydown', event => {
    const key = (event.key.length == 1) ? event.key.toLowerCase() : event.key;
    switch(key) {
        case "ArrowRight":
            ldtris.moveBlock(1);
            break
        case "ArrowLeft":
            ldtris.moveBlock(-1);
            break
        case "ArrowDown":
            ldtris.fastDownBlock();
            break
        case "ArrowUp":
            ldtris.instantDownBlock();
            break
        case "z":
            ldtris.rotateBlock(-1);
            break
        case "x":
            ldtris.rotateBlock(1);
            break
        case " ":
            ldtris.holdBlock();
            break
        default:
            console.log("key: " + key);
            break
    }
});

ldtris.start();