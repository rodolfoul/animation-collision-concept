GeneralCollision = new function () {
	this.toggleCollisions = function () {
		if (this.accountForCollisions == this._accountForAllTypes) {
			this.accountForCollisions = this._accountForCanvasOnly;
		} else {
			this.accountForCollisions = this._accountForAllTypes;
		}
	};

	this._accountForAllTypes = function (circles) {
		CanvasCollision.accountForCollisions(circles);
		CircleCollision.accountForCollisions(circles);
	};

	this._accountForCanvasOnly = function (circles) {
		CanvasCollision.accountForCollisions(circles);
	};

	this.accountForCollisions = this._accountForAllTypes;
};

CanvasCollision = {
	accountForCollisions: function (circles) {
		for (circle of circles) {
			let canvasTouches = this.touchesCanvas(circle);
			if (canvasTouches.length > 0) {
				this.repositionAfterTouch(circle, canvasTouches);
			}
		}
	},

	touchesCanvas: function (circle) {
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
	},
	MAX_REPOSITIONS: 20,

	repositionAfterTouch: function (circle, canvasTouches, repositionCount) {
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

		canvasTouches = this.touchesCanvas(circle);
		if (canvasTouches.length > 0) {
			if (repositionCount == null) {
				repositionCount = 1;
			}

			if (repositionCount < this.MAX_REPOSITIONS) {
				this.repositionAfterTouch(circle, canvasTouches, repositionCount + 1);
			} else {
				console.info('Max repositions reached.')
			}
		}
	}
};

CircleCollision = {
	accountForCollisions: function (circles) {
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
			this.repositionAfterTouch(collisions);
		}
	},


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

	calcTouchingDt: function (c1, c2) {
//d^2 = (x1-x2)^2 + (y1-y2)^2
		let dvx = c1.speed.x - c2.speed.x;
		let dvy = c1.speed.y - c2.speed.y;
		let dx0 = c1.pos.x - c2.pos.x;
		let dy0 = c1.pos.y - c2.pos.y;
		let d = c1.radius + c2.radius;

		return -(1 / (dvx ** 2 + dvy ** 2)) * (dvx * dx0 + dvy * dy0 +
			Math.sqrt((dvx * dx0 + dvy * dy0) ** 2 +
				(dvx ** 2 + dvy ** 2) * (d ** 2 - dx0 ** 2 - dy0 ** 2)));
	},

	repositionAfterTouch(collisions) {
		let dt = 0;

		let collidingCircles = new Set();

		let deepTouchingCircles;
		for (let [c1, c2] of collisions) {
			let thisDt = this.calcTouchingDt(c1, c2);

			if (thisDt < dt) {
				dt = thisDt;
				deepTouchingCircles = [c1, c2];
			}

			collidingCircles.add(c1);
			collidingCircles.add(c2);
		}

		collidingCircles.forEach(c => c.positionAfterT(dt));

		this.circleShockVCalc(...deepTouchingCircles);

		collidingCircles.forEach(c => c.positionAfterT(-dt));
	},

	circleShockVCalc: function (c1, c2) {
		const thetaH1 = Math.atan2(c2.pos.y - c1.pos.y, c2.pos.x - c1.pos.x);
		const thetaV1 = Math.atan2(c1.speed.y, c1.speed.x);
		const thetaV2 = Math.atan2(c2.speed.y, c2.speed.x);

		const thetaR1 = thetaV1 - thetaH1;
		const thetaR2 = thetaV2 - thetaH1;

		const v1 = Math.sqrt(c1.speed.x ** 2 + c1.speed.y ** 2);
		const v2 = Math.sqrt(c2.speed.x ** 2 + c2.speed.y ** 2);
		const v1Hit = v1 * Math.cos(thetaR1);
		const v2Hit = v2 * Math.cos(thetaR2);
		const v1Ort = v1 * Math.sin(thetaR1);
		const v2Ort = v2 * Math.sin(thetaR2);

		const rr1 = c1.radius ** 2;
		const rr2 = c2.radius ** 2;
		const dd = rr1 + rr2;

		function simpleShockVCalc(v1, v2) {
			return [(rr1 * v1 - rr2 * (v1 - 2 * v2)) / dd,
				(rr1 * (2 * v1 - v2) + rr2 * v2) / dd];
		}

		const [v1HitF, v2HitF]= simpleShockVCalc(v1Hit, v2Hit);

		c1.speed.x = -v1Ort * Math.sin(thetaH1) + v1HitF * Math.cos(thetaH1);
		c1.speed.y = v1Ort * Math.cos(thetaH1) + v1HitF * Math.sin(thetaH1);

		c2.speed.x = -v2Ort * Math.sin(thetaH1) + v2HitF * Math.cos(thetaH1);
		c2.speed.y = v2Ort * Math.cos(thetaH1) + v2HitF * Math.sin(thetaH1);
	}
};