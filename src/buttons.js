function reset() {
	polygons = [];
	updateTotalEnergy();
}

function setGravity(direction) {
	let gravityModule = 700;

	if (typeof (direction) == "string") {
		if (direction == "UP") {
			gravity = new Point(0, -gravityModule);
		} else if (direction == "DOWN") {
			gravity = new Point(0, gravityModule);
		} else if (direction == "LEFT") {
			gravity = new Point(-gravityModule, 0);
		} else if (direction == "RIGHT") {
			gravity = new Point(gravityModule, 0);
		} else if (direction == "NONE") {
			gravity = new Point(0, 0);
		}

	} else if (direction instanceof Point) {
		gravity = direction;
	}

	for (c of polygons) {
		c.accel = gravity;
	}
}

function updateTotalEnergy() {
	let systemEnergy = new Big(0);
	for (c of polygons) {
		systemEnergy = systemEnergy.plus(new Big(c.radius ** 2 * (c.speed.x ** 2 + c.speed.y ** 2)));
	}

	$('#totalEnergy').text(systemEnergy.div(1000).toFixed(2));
}

function randomCircle() {
	let radius = randNm() * 5 + 25;
	if (radius <= 1) {
		radius = 1;
	}
	let position = new Point(randomRange(radius, canvas.width - radius),
		randomRange(radius, canvas.height - radius));
	let c = new Circle(position, radius);

	const maxSpeed = 50;
	c.speed.x = randomRange(-maxSpeed, maxSpeed);
	c.speed.y = randomRange(-maxSpeed, maxSpeed);

	c.accel = gravity;
	polygons.push(c);
}

function randNm() {
	let u = 1 - Math.random();
	let v = 1 - Math.random();

	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}