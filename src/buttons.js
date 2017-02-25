function reset() {
	polygons = [];
	updateEnergy();
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

function updateEnergy() {
	let kinectEnergy = 0;
	let potentialEnergy = 0;

	let referencePos = new Point(0, 0);

	if (gravity.y > 0) {
		referencePos = new Point(0, canvas.height);
	} else if (gravity.x > 0) {
		referencePos = new Point(canvas.width, 0);
	}

	for (c of polygons) {
		kinectEnergy += (c.radius ** 2 * (c.speed.x ** 2 + c.speed.y ** 2) / 2) / 1000000;

		let nH = c.pos.minus(referencePos).minus(new Point(c.radius, c.radius));
		let theta = Math.atan2(nH.y, nH.x) - Math.atan2(gravity.y, gravity.x);
		potentialEnergy += (-(c.radius ** 2) * gravity.modulus() * nH.modulus() * Math.cos(theta)) / 1000000;
	}

	$('#kinectEnergy').text(kinectEnergy.toFixed(2));
	$('#potentialEnergy').text(potentialEnergy.toFixed(2));
	$('#totalEnergy').text((potentialEnergy + kinectEnergy).toFixed(2));
}

function randomCircle() {
	let radius = randNm() * 8 + 25;
	if (radius <= 1) {
		radius = 1;
	}
	let position = new Point(randomRange(radius, canvas.width - radius),
		randomRange(radius, canvas.height - radius));
	let c = new Circle(position, radius);

	const maxSpeed = 100;
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