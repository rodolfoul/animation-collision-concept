class Point {
	constructor(x, y) {
		if (typeof(x) != "number" || typeof(y) != "number") {
			throw "Not a number";
		}
		this.x = x;
		this.y = y;
	}

	modulus() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	minus(p) {
		return new Point(this.x - p.x, this.y - p.y);
	}

	toString() {
		return 'x:' + this.x + ', y:' + this.y;
	}
}

class Polygon {
	constructor(pos) {
		this.pos = pos;
		this.speed = new Point(0, 0);
		this.accel = new Point(0, 0);
	}

	move(pos) {
		this.pos = pos;
	}

	positionAfterT(time) {
		this.pos.x = this.pos.x + this.speed.x * time + this.accel.x * time ** 2 / 2;
		this.pos.y = this.pos.y + this.speed.y * time + this.accel.y * time ** 2 / 2;
		this.speed.x = this.speed.x + this.accel.x * time;
		this.speed.y = this.speed.y + this.accel.y * time;
	}
}

class Circle extends Polygon {
	constructor(pos, radius) {
		super(pos);
		this.radius = radius;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
	}
}