function reset() {
	polygons = [];
	updateTotalEnergy();
}

function toggleGravity() {
	if (gravity == 0) {
		gravity = 700;
	} else {
		gravity = 0;
	}
	for (c of polygons) {
		c.accel.y = gravity;
	}
}

function updateTotalEnergy() {
	systemEnergy = 0;
	for (c of polygons) {
		systemEnergy += c.radius ** 2 * (c.speed.x ** 2 + c.speed.y ** 2);
	}

	$('#totalEnergy').text((systemEnergy / 1000).toLocaleString('fr-FR', {maximumFractionDigits: 2}));
}

function randomCircle() {
	let radius = randNm() * 10 + 25;
	if (radius <= 1) {
		radius = 1;
	}
	let position = new Point(randomRange(radius, canvas.width - radius),
		randomRange(radius, canvas.height - radius));
	let c = new Circle(position, radius);

	const maxSpeed = 100;
	c.speed.x = randomRange(-maxSpeed, maxSpeed);
	c.speed.y = randomRange(-maxSpeed, maxSpeed);
	c.accel.y = gravity;
	polygons.push(c);
	updateTotalEnergy();
}

function randNm() {
	let u = 1 - Math.random();
	let v = 1 - Math.random();

	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomRange(min, max) {
	return Math.random() * (max - min) + min;
}