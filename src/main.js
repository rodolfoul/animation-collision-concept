class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Polygon {
	constructor(pos) {
		this.pos = pos;
		this.speed = new Point(0, 0);
	}

	move(pos) {
		this.pos = pos;
	}

	positionAfterT(time) {
		this.pos.x = this.pos.x + this.speed.x * time;
		this.pos.y = this.pos.y + this.speed.y * time;
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

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let polygons = [];
let lastFrame;

function setUp() {
	let c1 = new Circle(new Point(canvas.width / 2 - 40, canvas.height / 2 - 40), 20);
	c1.speed.x = 20;
	c1.speed.y = 20;
	polygons.push(c1);

	let c2 = new Circle(new Point(canvas.width / 2 + 40, canvas.height / 2 + 40), 20);
	c2.speed.x = -20;
	c2.speed.y = -20;
	polygons.push(c2);

	lastFrame = performance.now();
}

let touchEnum = ["UP", "DOWN", "LEFT", "RIGHT"];

function touchesCanvas(circle) {
	let touches = [];
	if (circle.pos.x - circle.radius < 0) {
		touches.push("LEFT");
	} else if (circle.pos.x + circle.radius > canvas.width) {
		touches.push("RIGHT");
	}

	if (circle.pos.y - circle.radius < 0) {
		touches.push("UP");
	} else if (circle.pos.y + circle.radius > canvas.height) {
		touches.push("DOWN");
	}
	return touches;
}

function repositionAfterSchock(circle, canvasTouches) {
	let dt = 0;
	let touch = canvasTouches.shift();
	let definitiveTouch;
	while (touch) {
		let t;
		if (touch == "LEFT") {
			t = (circle.radius - circle.pos.x) / circle.speed.x;
		} else if (touch == "RIGHT") {
			t = (canvas.width - circle.radius - circle.pos.x) / circle.speed.x;
		} else if (touch == "DOWN") {
			t = (canvas.height - circle.radius - circle.pos.y) / circle.speed.y;
		} else if (touch == "UP") {
			t = (circle.radius - circle.pos.y) / circle.speed.y;
		}

		if (t < dt) {
			dt = t;
			definitiveTouch = touch;
		} else if (t == dt) {
			definitiveTouch = [definitiveTouch, touch];
		}

		touch = canvasTouches.shift();
	}

	circle.positionAfterT(dt);

	if (Array.isArray(definitiveTouch)) {
		circle.speed.x = -circle.speed.x;
		circle.speed.y = -circle.speed.y;
	} else if (definitiveTouch == "LEFT" || definitiveTouch == "RIGHT") {
		circle.speed.x = -circle.speed.x;
	} else if (definitiveTouch == "UP" || definitiveTouch == "DOWN") {
		circle.speed.y = -circle.speed.y;
	}

	circle.positionAfterT(-dt);

	canvasTouches = touchesCanvas(circle);
	if (canvasTouches.length > 0) {
		repositionAfterSchock(circle, canvasTouches);
	}
}

CircleCollision = {
	touches: function (c1, c2) {
		let touchingDistance = c1.radius + c2.radius;

		let xDistance = Math.abs(c1.pos.x - c2.pos.x);

		if (touchingDistance < xDistance) {
			return false;
		}

		let yDistance = Math.abs(c1.pos.y - c2.pos.y);
		if (touchingDistance < yDistance) {
			return false;
		}

		return touchingDistance > Math.sqrt(xDistance * xDistance + yDistance * yDistance);
	},

	checkColisions: function (circles) {
		circles = circles.slice(0);

		let collisions = [];
		while (circles.length >= 2) {
			let circle = circles.shift();

			for (c of circles) {
				if (this.touches(circle, c)) {
					collisions.push([c, circle]);
				}
			}
		}

		if (collisions.length > 0) {
			this.repositionAfterSchock(collisions);
		}
	},

	repositionAfterSchock(collisions) {
		let dt = 0;

		let collidingCircles = new Set();

		let deepTouchingCircles;
		for (let [c1, c2] of collisions) {
			//d^2 = (x1-x2)^2 + (y1-y2)^2
			let dvx = c1.speed.x - c2.speed.x;
			let dvy = c1.speed.y - c2.speed.y;
			let dx0 = c1.pos.x - c2.pos.x;
			let dy0 = c1.pos.y - c2.pos.y;
			let d = c1.radius + c2.radius;

			let thisDt = -(1 / (dvx ** 2 + dvy ** 2)) * (dvx * dx0 + dvy * dy0 +
				Math.sqrt((dvx * dx0 + dvy * dy0) ** 2 +
					(dvx ** 2 + dvy ** 2) * (d ** 2 - dx0 ** 2 - dy0 ** 2)));

			if (thisDt < dt) {
				dt = thisDt;
				deepTouchingCircles = [c1, c2];
			}

			collidingCircles.add(c1);
			collidingCircles.add(c2);
		}

		collidingCircles.forEach(c => c.positionAfterT(dt));

		let [c1, c2] = deepTouchingCircles;
		let rr1 = c1.radius ** 2;
		let rr2 = c2.radius ** 2;
		let dd = rr1 + rr2;

		function calculateResultingV(v1, v2) {
			return [(rr1 * v1 - rr2 * (v1 - 2 * v2)) / dd,
				(rr1 * (2 * v1 - v2) + rr2 * v2) / dd];
		}

		[c1.speed.x, c2.speed.x] = calculateResultingV(c1.speed.x, c2.speed.x);
		[c1.speed.y, c2.speed.y] = calculateResultingV(c1.speed.y, c2.speed.y);

		collidingCircles.forEach(c => c.positionAfterT(-dt));
	}
};

function shockAccounting(circles, currentTime) {
	for (circle of circles) {
		let canvasTouches = touchesCanvas(circle);
		if (canvasTouches.length > 0) {
			repositionAfterSchock(circle, canvasTouches);
		}
	}

	CircleCollision.checkColisions(circles);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let t2 = performance.now();
	let dt = (t2 - lastFrame) / 1000;
	lastFrame = t2;

	for (polygon of polygons) {
		polygon.positionAfterT(dt);
	}
	shockAccounting(polygons);

	for (polygon of polygons) {
		polygon.draw(ctx);
	}
}
startAnimation();

function startAnimation() {
	setUp();
	setInterval(draw, 1000 / 60);
}
