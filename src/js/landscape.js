function Terrain(detail) {
    this.size = Math.pow(2, detail) + 1;
    this.max = this.size - 1;
    this.map = new Float32Array(this.size * this.size);
}

Terrain.prototype.get = function (x, y) {
    if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
    return this.map[x + this.size * y];
};

Terrain.prototype.set = function (x, y, val) {
    console.log('-----------> ' + x);
    const position = x + this.size * y;
    this.map[position] = val;

    console.log(`${x},${y}    this.map[${position}] = ${val}`);
};

Terrain.prototype.generate = function (roughness) {
    const self = this;

    console.log('---------- position = x + size * y');
    console.log('---------- this.map[position] = val');

    this.set(0, 5, self.max);
    this.set(this.max, 5, self.max);
    this.set(this.max, this.max, 0);
    this.set(0, this.max, self.max / 2);

    console.log(`---------------------------------------`);

    divide(this.max);

    function divide(size) {
        const half = size / 2,
            scale = roughness * size;

        let x, y;

        if (half < 1) return;

        for (y = half; y < self.max; y += size) {
            for (x = half; x < self.max; x += size) {
                const offset = Math.random() * scale * 2 - scale,
                    average = getSquareAverage(x, y, half);
                console.log(average);
                self.set(x, y, average + offset);
            }
        }

        for (y = 0; y <= self.max; y += half) {
            for (x = (y + half) % size; x <= self.max; x += size) {
                const offset = Math.random() * scale * 2 - scale,
                    average = getDiamondAverage(x, y, half);
                self.set(x, y, average + offset);
            }
        }

        divide(size / 2);
    }

    function getSquareAverage(x, y, size) {
        const average = getAverage([
            self.get(x - size, y - size),   // upper left
            self.get(x + size, y - size),   // upper right
            self.get(x + size, y + size),   // lower right
            self.get(x - size, y + size)    // lower left
        ]);
        return average;
    }

    function getDiamondAverage(x, y, size) {
        const average = getAverage([
            self.get(x, y - size),      // top
            self.get(x + size, y),      // right
            self.get(x, y + size),      // bottom
            self.get(x - size, y)       // left
        ]);
        return average;
    }

    function getAverage(values) {
        const valid = values.filter((val) => val !== -1),
            total = valid.reduce((sum, val) => sum + val, 0);

        return total / valid.length;
    }
};

Terrain.prototype.draw = function (ctx, width, height) {
    const self = this;

    for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            const val = this.get(x, y),
                top = project(x, y, val),
                bottom = project(x + 1, y, 0),
                style = brightness(x, y, this.get(x + 1, y) - val);

            rect(top, bottom, style);
        }
    }
    function rect(a, b, style) {
        if (b.y < a.y) return;

        ctx.fillStyle = style;
        ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
    }

    function brightness(x, y, slope) {
        if (y === self.max || x === self.max) return '#000';

        const b = ~~(slope * 50) + 128;
        return ['rgba(', b, ',', b, ',', b, ',1)'].join('');
    }

    function iso(x, y) {
        return {
            x: 0.5 * (self.size + x - y),
            y: 0.5 * (x + y)
        };
    }

    function project(flatX, flatY, flatZ) {
        const point = iso(flatX, flatY),
            x0 = width * 0.5,
            y0 = height * 0.2,
            z = self.size * 0.5 - flatZ + point.y * 0.75,
            x = (point.x - self.size * 0.5) * 6,
            y = (self.size - point.y) * 0.005 + 1;
        return {
            x: x0 + x / y,
            y: y0 + z / y
        };
    }
};

const display = document.getElementById('contextTwo'),
    ctx = display.getContext('2d'),
    width = display.width = window.innerWidth,
    height = display.height = window.innerHeight;

const terrain = new Terrain(8);
terrain.generate(0.7);
terrain.draw(ctx, width, height);
