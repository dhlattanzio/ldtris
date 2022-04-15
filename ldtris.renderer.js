const BLOCK_SIZE = 32;
const PADDING = 2;
const IMAGE_TILE_SIZE = 32;

class LDTrisRenderer {
    constructor(game, canvas, tileSize, skin, canvasBlockNext, canvasBlockHold) {
        this.game = game;

        canvas.width = (game.board.cols * (BLOCK_SIZE + PADDING) + PADDING);
        canvas.height = (game.board.rows * (BLOCK_SIZE + PADDING) + PADDING);
        canvas.style.width = (game.board.cols * (BLOCK_SIZE + PADDING)) + "px";
        canvas.style.height = (game.board.rows * (BLOCK_SIZE + PADDING)) + "px";

        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        canvasBlockNext.width = (5 * (BLOCK_SIZE + PADDING) + PADDING);
        canvasBlockNext.height = (5 * (BLOCK_SIZE + PADDING) + PADDING);
        this.ctxBlockNext = canvasBlockNext.getContext("2d");
        this.ctxBlockNext.imageSmoothingEnabled = false;

        canvasBlockHold.width = (5 * (BLOCK_SIZE + PADDING) + PADDING);
        canvasBlockHold.height = (5 * (BLOCK_SIZE + PADDING) + PADDING);
        this.ctxBlockHold = canvasBlockHold.getContext("2d");
        this.ctxBlockHold.imageSmoothingEnabled = false;

        this.skin = skin;

        game.subscribe((name, data) => {
            //console.log("event: ", name, data);
            switch(name) {
                case "update":
                    this.render();
                    break
                case "block_new":
                    data.color = 1 + Math.floor(Math.random() * 7);
                    break
                case "block_change":
                    this.drawBlockInContainer(this.ctxBlockNext, data[1]);
                    break
                case "block-hold":
                    this.drawBlockInContainer(this.ctxBlockHold, data);
                    break
                case "block_move":
                    break;
                case "block_rotate:":
                    break;
            }
        })
    }

    render() {
        const size = (BLOCK_SIZE + PADDING);

        const board = this.game.board;
        const block = this.game.block;

        this.ctx.fillStyle = "#1e1e1e";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        // all board
        for(let y=0;y<board.rows;y++) {
            let invertY = (board.rows - y - 1) * size;
            for(let x=0;x<board.cols;x++) {
                const a = (board.rows - y - 1);
                const tmp = a < 10 ? "0" + a : "" + a;
                this.ctx.fillStyle = "#121212";
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(
                    x * size + PADDING,
                    invertY + PADDING,
                    BLOCK_SIZE, BLOCK_SIZE
                );

                let tileColor = board.tiles[y][x];
                if (tileColor > 0) {
                    tileColor -= 1;
                    this.ctx.drawImage(this.skin,
                        IMAGE_TILE_SIZE * tileColor, 0, IMAGE_TILE_SIZE, IMAGE_TILE_SIZE,
                        x * size + PADDING, invertY + PADDING,
                        BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }

        // Current block
        this.drawTiles(this.ctx, block.getTiles(),
        block.x * size + PADDING,
        (board.rows - block.y - 1) * size + PADDING,
        BLOCK_SIZE, block.color - 1, PADDING);

        // Curent block - end position
        this.ctx.globalAlpha = 0.2;
        this.drawTiles(this.ctx, block.getTiles(),
        block.x * size + PADDING,
        (board.rows - this.game.currentEndY - 1) * size + PADDING,
        BLOCK_SIZE, block.color - 1, PADDING);
        this.ctx.globalAlpha = 1.0;
    }

    drawTiles(ctx, tiles, x, y, size, color, padding = 0) {
        for(let i=0; i<tiles.length; i++) {
            for(let j=0; j<tiles[i].length; j++) {
                if (tiles[i][j] == 0) continue;

                ctx.drawImage(this.skin,
                    IMAGE_TILE_SIZE * color, 0, IMAGE_TILE_SIZE, IMAGE_TILE_SIZE,
                    x + (j * (size + padding)),
                    y - (i * (size + padding)),
                    size, size);
                }
        }
    }

    drawBlockInContainer(ctx, block) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawTiles(ctx, block.getTiles(), 30, 80, BLOCK_SIZE, block.color - 1, PADDING);
    }
}