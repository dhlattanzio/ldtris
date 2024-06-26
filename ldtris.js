class LDTris {
    constructor(cols = 10, rows = 20) {
        this._subscribers = [];
        this.board = new Board(cols, rows);
        this.downTime = 0.3;

        this.currentEndY;
        this.nextBlocks = [];

        this.blockHold = null;
        this.canUseHold = true;
    }

    subscribe(listener) {
        this._subscribers.push(listener);
    }

    emit(name, data) {
        this._subscribers.map(sub => sub(name, data));
    }

    start() {
        this.nextBlock();
        this.update();
    }

    pause() {

    }

    resume() {
    }

    moveBlock(move) {
        this.block.x += move;
        if (this.board.overlap(this.block)) {
            this.block.x -= move;
        } else {
            this.calculateCurrentEndY();
            this.emit("block_move", this.block);
        }
    }

    rotateBlock(dir) {
        const rotate = dir % 2;
        this.block.rotate(rotate);
        if (this.board.overlap(this.block)) {
            this.block.rotate(-rotate);
        } else {
            this.calculateCurrentEndY();
            this.emit("block_rotate", this.block);
        }
    }

    holdBlock() {
        const prevX = this.block.x;
        if (this.canUseHold) {
            if (!this.hold) {
                this.hold = this.block;
                this.nextBlock();
            } else {
                const tmp = this.hold;
                this.hold = this.block;
                this.block = tmp;

                this.block.x = Math.min(Math.max(prevX, this.block.offsetX), this.board.cols - this.block.width);
                this.block.y = this.board.rows - 1;
            }
            this.hold.resetRotation();
            this.calculateCurrentEndY();
            this.canUseHold = false;
            this.emit("block-hold", this.hold);
        }
    }

    downBlock() {
        const prevY = this.block.y;
        const nextY = this.block.y - 1;

        this.block.y = nextY;
        if (this.board.overlap(this.block)) {
            this.block.y = prevY;
        }
        
        return prevY != this.block.y;
    }

    putBlockInboard() {
        this.canUseHold = true;
        this.board.putBlock(this.block);

        this.checkForLines(this.block.getBot(), this.block.height);
        this.nextBlock();
    }

    checkForLines(y, height) {
        const linesComplete = [];
        for(let i=y+height-1;i>=y;i--) {
            if (this.board.checkLine(i)) {
                linesComplete.push(i);
            }
        }

        if (linesComplete.length > 0) {
            this.emit("lines-complete", linesComplete);
        }
    }

    fastDownBlock() {
        const stepDown = this.downBlock();
        if (!stepDown) this.putBlockInboard();
    }

    instantDownBlock() {
        this.block.y = this.currentEndY;
        this.putBlockInboard();
    }

    createBlock() {
        if (this.nextBlocks.length <= 1) {
            const blocks = {
                0: () => new Block([[1, 1], [1, 1]]), // O
                1: () => new Block([[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]), // I
                2: () => new Block([[1, 1, 0], [0, 1, 1]]), // S
                3: () => new Block([[0, 1, 1], [1, 1, 0]]), // Z
                4: () => new Block([[0, 0, 0], [1, 1, 1], [1, 0, 0]]), // L
                5: () => new Block([[1, 0, 0], [1, 1, 1], [0, 0, 0]]), // J
                6: () => new Block([[0, 1, 0], [1, 1, 1]])  // T
            }
    
            for(let i=0;i<20;i++) {
                const randomNumber = Math.floor(Math.random() * Object.keys(blocks).length);
                const newBlock = blocks[randomNumber]();
                newBlock.type = randomNumber;
                newBlock.color = 1;
                this.emit("block_new", newBlock);
                this.nextBlocks.push(newBlock);
            }
        }

        const block = this.nextBlocks.shift();
        this.emit("block_change", [block, this.nextBlocks[0]]);
        return block;
    }

    getNextBlock() {
        return this.nextBlocks[0];
    }

    nextBlock() {
        const prevX = this.block != null ? this.block.x : 4;
        this.block = this.createBlock();
        
        this.block.x = Math.min(Math.max(prevX, this.block.offsetX), this.board.cols - this.block.width);
        this.block.y = this.board.rows - 1;

        this.calculateCurrentEndY();
    }

    calculateCurrentEndY() {
        const prevY = this.block.y;
        while(this.downBlock());

        this.currentEndY = this.block.y;
        this.block.y = prevY;
    }

    update(delta = 0.017) {
        this.downTime -= 0.017;
        if (this.downTime <= 0) {
            const stepDown = this.downBlock();
            if (!stepDown) {
                this.board.putBlock(this.block);
                this.nextBlock();
                // TODO
            }

            this.downTime = 0.5;
        }

        //requestAnimationFrame(this.draw.bind(this));
        this.emit("update");
        setTimeout(() => requestAnimationFrame(this.update.bind(this)), 17);
    }
}

class Board {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.tiles = Array(rows).fill().map(() => Array(cols).fill(0));
    }

    checkLine(y) {
        if (y >= this.tiles.length) return false;

        const line = this.tiles[y];
        if (line.every(x => x > 0)) {
            this.tiles.splice(y, 1);
            this.tiles.push(line.fill(0));
            return true;
        }
        return false;
    }

    overlap(block) {
        const tiles = block.getTiles();
        for(let y=block.offsetY;y<block.height+block.offsetY;y++) {
            for(let x=block.offsetX;x<block.width+block.offsetX;x++) {
                if (tiles[y][x] == 0) continue;
                const tx = block.x + x;
                const ty = block.y + y;
                if (tx < 0 || tx >= this.cols) return true;
                if (ty >= this.rows) continue;

                if (ty < 0 || this.tiles[ty][tx] > 0)
                    return true;
            }
        }
        return false;
    }

    putBlock(block) {
        const tiles = block.getTiles();
        for(let y=0;y<block.height+block.offsetY;y++) {
            for(let x=0;x<block.width+block.offsetX;x++) {
                if (tiles[y][x] == 0) continue;
                const tx = block.x + x;
                const ty = block.y + y;
                if (ty >= this.rows) continue;

                this.tiles[ty][tx] = block.color;
            }
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
        //this.tiles.reverse();

        this.color = 0;
        this.allRotations = this.calculateRotation(tiles);
        this.currentIndex = 0;

        this.width = 1;
        this.height = 1;
        this.offsetX = 0;
        this.offsetY = 0;
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
        this.updateSize();
    }

    resetRotation() {
        this.currentIndex = 0;
        this.updateSize();
    }

    updateSize() {
        this.width = 0;
        this.height = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.getTiles().map((value, index) => {
            const someInX = value.some(x => x > 0);
            if (!someInX && this.offsetY == index) {
                this.offsetY += 1;
            }
            if (someInX) this.height = index + 1;

            const someInY = this.getTiles().some(x => x[index] > 0);
            if (!someInY && this.offsetX == index) {
                this.offsetX += 1;
            }
            if (someInY) this.width = index + 1;
        });
        this.width -= this.offsetX;
        this.height -= this.offsetY;
    }

    getLeft() {
        return this.x + this.offsetX;
    }

    getRight() {
        return this.getLeft() + this.width;
    }

    getTop() {
        return this.getBot() + this.height;
    }

    getBot() {
        return (this.y + this.offsetY);
    }
}
