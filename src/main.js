let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let polygons = [];
let lastFrame;
let mousePos = new Point(0, 0);
let gravity = 0;
let systemEnergy = 0;

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
	shockAccounting(polygons);

	for (polygon of polygons) {
		polygon.draw(ctx);
	}

	drawMousePos();
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
	setInterval(draw, 1000 / 60);
}

startAnimation();
