let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let polygons = [];
let lastFrame;
let mousePos = new Point(0, 0);
let gravity = new Point(0, 0);
let updateFrameTime = 1000 / 60;

document.getElementsByTagName("body")[0].addEventListener('mousemove', function (evt) {
	mousePos = new Point(evt.clientX, evt.clientY);
});

function setUp() {
	lastFrame = performance.now();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let t2 = performance.now();
	let dt = (t2 - lastFrame) / 1000;
	lastFrame = t2;

	for (polygon of polygons) {
		polygon.positionAfterT(dt);
	}
	GeneralCollision.accountForCollisions(polygons);

	for (polygon of polygons) {
		polygon.draw(ctx);
	}

	drawMousePos();
	updateEnergy();
}

function drawMousePos() {
	ctx.font = '10pt Calibri';
	ctx.fillStyle = 'black';
	ctx.fillText(mousePos, 10, 25);
}

function drawMouseSpeed() {

}

function startAnimation() {
	setUp();
	setInterval(draw, updateFrameTime);
}

startAnimation();
