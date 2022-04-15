const BLOCK_SIZE = 32;
const PADDING = 2;

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

class TetrisRenderer {
    constructor(game, canvas, tileSize, skin) {
        this.game = game;

        canvas.width = (game.board.cols * (BLOCK_SIZE + PADDING) + PADDING);
        canvas.height = (game.board.rows * (BLOCK_SIZE + PADDING) + PADDING);
        canvas.style.width = (game.board.cols * (BLOCK_SIZE + PADDING)) + "px";
        canvas.style.height = (game.board.rows * (BLOCK_SIZE + PADDING)) + "px";

        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.skin = skin;

        game.subscribe((name, data) => {
            console.log("event: ", name);
            switch(name) {
                case "update":
                    this.render();
                    break
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
                        16 * tileColor, 0, 16, 16,
                        x * size + PADDING, invertY + PADDING,
                        BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }

        this.drawTiles(block.getTiles(),
        block.x * size + PADDING,
        (board.rows - block.y - 1) * size + PADDING,
        BLOCK_SIZE, block.color - 1, PADDING);
    }

    drawTiles(tiles, x, y, size, color, padding = 0) {
        for(let i=0; i<tiles.length; i++) {
            for(let j=0; j<tiles[i].length; j++) {
                if (tiles[i][j] == 0) continue;

                this.ctx.drawImage(this.skin,
                    16 * color, 0, 16, 16,
                    x + (j * (size + padding)),
                    y - (i * (size + padding)),
                    size, size);
                }
        }
    }
}