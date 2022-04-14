const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 32;
const PADDING = 2;

const canvas = document.getElementById('canvas');
canvas.width = (BOARD_WIDTH * (BLOCK_SIZE + PADDING) + PADDING);
canvas.height = (BOARD_HEIGHT * (BLOCK_SIZE + PADDING) + PADDING);
canvas.style.width = (BOARD_WIDTH * (BLOCK_SIZE + PADDING)) + "px";
canvas.style.height = (BOARD_HEIGHT * (BLOCK_SIZE + PADDING)) + "px";

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const image = document.getElementById('source');

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.board = new Board(10, 20);
        this.downTime = 0.3;

        this.nextBlock();
    }

    moveBlock(move) {
        this.block.x = Math.min(Math.max(this.block.x + move, 0), this.board.cols - this.block.width);
    }

    rotateBlock(dir) {
        this.block.rotate(dir % 2);
    }

    downBlock() {
        const prevY = this.block.y;
        const nextY = Math.max(this.block.height - 1, this.block.y - 1);

        this.block.y = nextY;
        if (this.board.overlap(this.block)) {
            this.block.y = prevY;
        }
        
        return prevY != this.block.y;
    }

    fastDownBlock() {
        const stepDown = this.downBlock();
        if (!stepDown) {
            this.board.putBlock(this.block);
            this.nextBlock();
            // TODO
        }
    }

    instantDownBlock() {
        console.log("instant!");

        const prevY = this.block.y;
        for(let y=this.block.y;y>=0;y--) {
            this.block.y = y;
            if (this.board.overlap(this.block) || y == 0) {
                this.block.y += 1;
                this.board.putBlock(this.block);
                this.nextBlock();
                break;
            }
        }
    }

    createBlock() {
        const blocks = {
            0: () => new Block([[1, 1], [1, 1]]), // O
            1: () => new Block([[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]), // I
            2: () => new Block([[1, 1, 0], [0, 1, 1]]), // S
            3: () => new Block([[0, 1, 1], [1, 1, 0]]), // Z
            4: () => new Block([[0, 0, 0], [1, 1, 1], [1, 0, 0]]), // L
            5: () => new Block([[1, 0, 0], [1, 1, 1], [0, 0, 0]]), // J
            6: () => new Block([[0, 1, 0], [1, 1, 1]])  // T
        }
        const randomNumber = Math.floor(Math.random() * Object.keys(blocks).length);
        const randomColor = 1 + Math.floor(Math.random() * 7);

        const newBlock = blocks[randomNumber]();
        newBlock.color = randomColor;
        return newBlock;
    }

    nextBlock() {
        const prevX = this.block != null ? this.block.x : 0;
        this.block = this.createBlock();
        this.block.x = prevX;
        this.block.y = this.board.rows - 1;
    }

    draw() {
        const deltaTime = 1.0 / 60.0;
        let tileColor = 0;

        this.ctx.fillStyle = "#1e1e1e";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        // all board
        const size = (BLOCK_SIZE + PADDING);
        for(let y=0;y<this.board.rows;y++) {
            let blockY = (this.board.rows - y - 1) * size;
            for(let x=0;x<this.board.cols;x++) {
                this.ctx.fillStyle = "#121212";
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(
                    x * size + PADDING,
                    blockY + PADDING,
                    BLOCK_SIZE, BLOCK_SIZE
                );

                tileColor = this.board.tiles[y][x];
                if (tileColor > 0) {
                    tileColor -= 1;
                    this.ctx.drawImage(image,
                        16 * tileColor, 0, 16, 16,
                        x * size + PADDING, blockY + PADDING,
                        BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }

        // current block
        /*for(const tile of this.block.tiles) {
            tileColor = this.block.color - 1;

            this.ctx.drawImage(image,
                16 * tileColor, 0, 16, 16,
                (this.block.x + tile[0]) * size + PADDING,
                ((this.board.rows - 1 + tile[1]) * size) - (this.block.y * size) + PADDING,
                BLOCK_SIZE, BLOCK_SIZE);
        }*/


        tileColor = this.block.color - 1;
        const tiles = this.block.getTiles();
        for(let y=0;y<this.block.height;y++) {
            for(let x=0;x<this.block.width;x++) {
                if (tiles[y][x] == 0) continue;

                this.ctx.drawImage(image,
                    16 * tileColor, 0, 16, 16,
                    (this.block.x + x) * size + PADDING,
                    ((this.board.rows - 1 + y) * size) - (this.block.y * size) + PADDING,
                    BLOCK_SIZE, BLOCK_SIZE);
                }
        }

        // tmp: down block every x time
        this.downTime -= deltaTime;
        if (this.downTime <= 0) {
            const stepDown = this.downBlock();
            if (!stepDown) {
                this.board.putBlock(this.block);
                this.nextBlock();
                // TODO
            }

            this.downTime = 10.5;
        }

        //requestAnimationFrame(this.draw.bind(this));
        setTimeout(() => requestAnimationFrame(this.draw.bind(this)), 17);
    }
}

class Board {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.tiles = Array(rows).fill().map(() => Array(cols).fill(0));
    }

    overlap(block) {
        for(const tile of block.tiles) {
            const y = block.y - tile[1];
            if (y < 0 || this.tiles[y][tile[0] + block.x] > 0) return true;
        }
        return false;
    }

    putBlock(block) {
        console.log("put", block);
        for(const tile of block.tiles) {
            this.tiles[block.y - tile[1]][tile[0] + block.x] = block.color;
        }
    }
}

class Block {
    constructor(tiles) {
        this.x = 0;
        this.y = 0;

        this.tiles = tiles;
        while (this.tiles.length < this.tiles[0].length) {
            this.tiles.push(Array(this.tiles[0].length).fill().map(() => 0));
        }

        this.color = 0;
        this.allRotations = this.calculateRotation(tiles);
        this.currentIndex = 0;

        this.width = 1;
        this.height = 1;
        this.updateSize();
    }

    calculateRotation(matrix, origin) {
        //if (!origin) return [matrix, matrix, matrix, matrix];

        let todos = [];
        for(let i=0;i<4;i++) {
            todos.push(matrix);
            matrix = matrix[0].map((value, index) => matrix.map(value => value[index]).reverse());
        }
        return todos;
    }

    getTiles() {
        return this.allRotations[this.currentIndex];
    }

    rotate(dir) {
        this.currentIndex = (this.allRotations.length + this.currentIndex + dir) % this.allRotations.length;
        console.log("new: ", this.currentIndex);
    }

    updateSize() {
        /*const size = this.tiles.reduce((acc, tile) => {
            acc[0] = Math.max(acc[0], tile[0] + 1);
            acc[1] = Math.max(acc[1], tile[1] + 1);
            return acc;
        }, [0, 0]);*/

        this.width = this.getTiles()[0].length;
        this.height = this.getTiles().length;
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

document.addEventListener('keydown', event => {
    switch(event.key) {
        case "ArrowRight":
            game.moveBlock(1);
            break
        case "ArrowLeft":
            game.moveBlock(-1);
            break
        case "ArrowDown":
            game.fastDownBlock();
            break
        case "ArrowUp":
            game.instantDownBlock();
            break
        case "z":
            game.rotateBlock(-1);
            break
        case "x":
            game.rotateBlock(1);
            break
    }
})

document.addEventListener("keypress", event => {

})