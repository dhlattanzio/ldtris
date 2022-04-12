const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 32;
const PADDING = 1;

const canvas = document.getElementById('canvas');
canvas.width = (BOARD_WIDTH * (BLOCK_SIZE + PADDING));
canvas.height = (BOARD_HEIGHT * (BLOCK_SIZE + PADDING));
canvas.style.width = (BOARD_WIDTH * (BLOCK_SIZE + PADDING)) + "px";
canvas.style.height = (BOARD_HEIGHT * (BLOCK_SIZE + PADDING)) + "px";

const ctx = canvas.getContext("2d");

const image = document.getElementById('source');

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.board = new Board(10, 20);

        this.block = new Block([[0, 1], [1, 1], [2, 1], [2, 0]])
        this.block.y = this.board.rows - 1;
    }

    draw() {
        // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = "lightgray";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        for(let y=0;y<this.board.rows;y++) {
            for(let x=0;x<this.board.cols;x++) {
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    x * BLOCK_SIZE + (x * PADDING),
                    y * BLOCK_SIZE + (y * PADDING),
                    BLOCK_SIZE + PADDING, BLOCK_SIZE + PADDING
                );
            }
        }

        // void ctx.drawImage(image, dx, dy, dWidth, dHeight);
        const mult = BLOCK_SIZE + PADDING;
        for(const tile of this.block.tiles) {
            this.ctx.drawImage(image,
                (this.block.x + tile[0]) * mult,
                ((this.board.rows - 1 + tile[1]) * mult) - (this.block.y * mult),
                BLOCK_SIZE, BLOCK_SIZE);
        }

        this.block.y = Math.max(0, this.block.y - 1);

        console.log("das");
        setTimeout(() => requestAnimationFrame(this.draw.bind(this)), 17 * 40);
    }
}

class Board {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
    }
}

class Block {
    constructor(tiles) {
        this.x = 0;
        this.y = 0;
        this.width = 1;
        this.height = 1;
        this.tiles = tiles;
        this.updateSize();
    }

    updateSize() {
        const size = this.tiles.reduce((acc, tile) => {
            acc[0] = Math.max(acc[0], tile[0]);
            acc[1] = Math.max(acc[1], tile[1]);
            return acc;
        }, [0, 0]);

        this.width = size[0];
        this.height = size[1];
    }

    getLeft() {
        return this.x;
    }

    getRight() {
        return this.x + this.width;
    }

    getTop() {
        return this.y;
    }

    getBot() {
        return getTop() - this.height;
    }
}

const game = new Game(ctx);
game.draw();
