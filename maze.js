const canvas = document.getElementById('canvas');

const app = new PIXI.Application({
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

const { stage, view, ticker, renderer } = app;

document.body.appendChild(view);

const GRID_WIDTH = 21;
const GRID_HEIGHT = 21;
const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

const TILE_SIZE = 18;

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

var complete = false;

var tiles = [];
var current;
var exit;

var stack = [];

document.addEventListener('keydown', keyHandler, false);

function keyHandler(e) {
    if (complete) {
        switch (e.key) {
            case 'd':
                if (checkMove(current, EAST)) {
                    var c = getTile(index(current.x + 1, current.y));
                    if (c != "no tile") {
                        current.removeHighlight();
                        current = c;
                        current.highlight();
                    }
                }
                break;

            case 'a':
                if (checkMove(current, WEST)) {
                    var c = getTile(index(current.x - 1, current.y));
                    if (c != "no tile") {
                        current.removeHighlight();
                        current = c;
                        current.highlight();
                    }
                }
                break;

            case 's':
                if (checkMove(current, SOUTH)) {
                    var c = getTile(index(current.x, current.y + 1));
                    if (c != "no tile") {
                        current.removeHighlight();
                        current = c;
                        current.highlight();
                    }
                }
                break;

            case 'w':
                if (checkMove(current, NORTH)) {
                    var c = getTile(index(current.x, current.y - 1));
                    if (c != "no tile") {
                        current.removeHighlight();
                        current = c;
                        current.highlight();
                    }
                }
                break;
        }
    }
}

function grid() {
    for (var y = 0; y < GRID_HEIGHT; y++) {
        for (var x = 0; x < GRID_WIDTH; x++) {
            tiles.push(new tile(x, y, TILE_SIZE));
        }
    }

    exit = new exitTile(GRID_WIDTH - 1, GRID_HEIGHT, TILE_SIZE);
    tiles[GRID_SIZE - 1].disableWall(SOUTH);

    var t = tiles[0];
    t.visit();
    stack.push(t);
}

function index(x, y) {
    if (x == exit.x && y == exit.y) {
        return tiles.length - 1;
    }
    if (x < 0 || y < 0 || x > GRID_WIDTH - 1 || y > GRID_HEIGHT - 1) {
        return -1;
    }
    return x + y * GRID_WIDTH;
}

function getTile(i) {
    if (i == tiles.length - 1) {
        return tiles[tiles.length - 1];
    }
    if (i > GRID_SIZE || i < 0) {
        return "no tile";
    } else {
        return tiles[i];
    }
}

class tile {
    constructor(x, y, s) {
        this.x = x;
        this.y = y;
        this.w = s;
        this.h = s;
        this.visited = false;
        this.tile = new PIXI.Container();
        this.tile.position.set(this.x * this.w + this.w / 2, this.y * this.h + this.h / 2);

        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0x808080);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.bg.endFill();
        this.tile.addChild(this.bg);

        this.activeWalls = [true, true, true, true];
        this.walls = [new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics()];


        this.walls[NORTH].lineStyle(2, 0xffffff);
        this.walls[NORTH].moveTo(-this.w / 2, -this.h / 2);
        this.walls[NORTH].lineTo(this.w / 2, -this.h / 2);
        this.tile.addChild(this.walls[NORTH]);

        this.walls[EAST].lineStyle(2, 0xffffff);
        this.walls[EAST].moveTo(this.w / 2, -this.h / 2);
        this.walls[EAST].lineTo(this.w / 2, this.h / 2);
        this.tile.addChild(this.walls[EAST]);

        this.walls[SOUTH].lineStyle(2, 0xffffff);
        this.walls[SOUTH].moveTo(this.w / 2, this.h / 2);
        this.walls[SOUTH].lineTo(-this.w / 2, this.h / 2);
        this.tile.addChild(this.walls[SOUTH]);

        this.walls[WEST].lineStyle(2, 0xffffff);
        this.walls[WEST].moveTo(-this.w / 2, this.h / 2);
        this.walls[WEST].lineTo(-this.w / 2, -this.h / 2);
        this.tile.addChild(this.walls[WEST]);

        stage.addChild(this.tile);

    }

    checkNeighbors() {
        var neighbors = [];

        var top = getTile(index(this.x, this.y - 1));
        var right = getTile(index(this.x + 1, this.y));
        var bottom = getTile(index(this.x, this.y + 1));
        var left = getTile(index(this.x - 1, this.y));

        if (top != "no tile") {
            if (!top.visited) {
                neighbors.push(top);
            }
        }

        if (right != "no tile") {
            if (!right.visited) {
                neighbors.push(right);
            }
        }
        if (bottom != "no tile") {
            if (!bottom.visited) {
                neighbors.push(bottom);
            }
        }
        if (left != "no tile") {
            if (!left.visited) {
                neighbors.push(left);
            }
        }

        if (neighbors.length > 0) {
            return neighbors[Math.floor(Math.random() * neighbors.length)];
        } else {
            return undefined;
        }
    }

    visit() {
        this.bg.clear();
        this.bg.beginFill(0x800080);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.bg.endFill();
        this.visited = true;
    }

    highlight() {
        this.bg.clear();
        this.bg.beginFill(0xFF0000);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.bg.endFill();
    }

    removeHighlight() {
        this.bg.clear();
        this.bg.beginFill(0x800080);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.bg.endFill();
    }

    disableWall(wall) {
        this.tile.removeChild(this.walls[wall]);
        this.activeWalls[wall] = false;
    }
}

class exitTile extends tile {
    constructor(x, y, s) {
        super(x, y, s);
        this.disableWall(NORTH);
        this.enable();
    }

    enable() {
        this.bg.clear();
        this.bg.beginFill(0x00FF00);
        this.bg.drawRect(-this.w / 2, -this.h / 2, this.w, this.h);
        this.bg.endFill();
    }
}

grid();

ticker.add(() => {
    if (stack.length > 0) {
        if (current) {
            current.removeHighlight();
        }
        current = stack.pop();
        if (current) {
            current.highlight();
        }
        var next = current.checkNeighbors();
        if (next) {

            stack.push(current);
            removeWalls(current, next);
            next.visit();
            stack.push(next);
        }
    } else {
        if (!complete) {
            complete = true;
            tiles.push(exit);
        }
    }
});

function checkMove(tile, dir) {
    switch (dir) {

        case NORTH:
            var d = getTile(index(tile.x, tile.y - 1));
            if (d == 'no tile') {
                return false;
            }
            if (tile.activeWalls[NORTH] || d.activeWalls[SOUTH]) {
                return false;
            }
            break;

        case EAST:
            var d = getTile(index(tile.x + 1, tile.y));
            if (d == 'no tile') {
                return false
            }
            if (tile.activeWalls[EAST] || d.activeWalls[WEST]) {
                return false;
            }
            break;

        case SOUTH:
            var d = getTile(index(tile.x, tile.y + 1));
            if (d == 'no tile') {
                return false
            }
            if (tile.activeWalls[SOUTH] || d.activeWalls[NORTH]) {
                return false;
            }
            break;

        case WEST:
            var d = getTile(index(tile.x - 1, tile.y));
            if (d == 'no tile') {
                return false
            }
            if (tile.activeWalls[WEST] || d.activeWalls[EAST]) {
                return false;
            }
            break;
    }
    return true;
}

function removeWalls(a, b) {
    var x = a.x - b.x;
    if (x === 1) {
        a.disableWall(WEST);
        b.disableWall(EAST);
    } else if (x === -1) {
        a.disableWall(EAST);
        b.disableWall(WEST);
    }
    var y = a.y - b.y;
    if (y === 1) {
        a.disableWall(NORTH);
        b.disableWall(SOUTH);
    } else if (y === -1) {
        a.disableWall(SOUTH);
        b.disableWall(NORTH);
    }
}