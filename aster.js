const FPS = 60; //frames per second
const FRICTION = 0.7; // friction coefficient of space where 0 = no fric 1 = lot of firc
const LASER_MAX = 10; // maximum number of lasers at the screen
const LASER_SPD = 500; // speed of laster
const LASER_DIST = 0.6; // max laser dist;
const LASER_EXPLODE_DUR = 0.1;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5; //acceleration of the ship in pixel per second
const SHIP_EXPLODE_DUR = 0.3; //duration of the ship explosiobn
const SHIP_INV_DUR = 3;
const SHIP_BLINK_DUR = 0.1;
const TURN_SPEED = 360; //turn speed in degrees per second
const ROIDS_NUM = 5; // starting number of asteroids
const ROIDS_SIZE = 100; // size of asteroids in pixerls
const ROIDS_SPD = 50; // max starting speed of asteroids in pixels per secound
const ROIDS_VERT = 10; //averege number of vert's
const ROIDS_JAG = 0.4; //jaggedness of the asteroids 0 = none; 1 = lots
const SHOW_BOUNDING = false; //show or hide collision bounding 
const colors = [ //Asteroids Color
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#FFFBF6',
    '#031528',
    '#EB8D02',
    '#8F9CAF',
    //'#8F9B1F',
];

/** @type {HTMLCanvasElement} */
var canv = document.getElementById("game");
var ctx = canv.getContext("2d");

//Ship 
var ship = newShip();

//set up asteroids
var roids = [];
var randColor = colors[Math.floor(Math.random() * colors.length)];
createAsteroidBelt();

//Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Game Loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt(){
	roids = [];
	var x,y;
	for (var i = 0; i < ROIDS_NUM; i++){
		do {
			x = Math.floor(Math.random()*canv.width);
			y = Math.floor(Math.random()*canv.height);
		} while (distBetweenPoints(ship.x, ship.y, x, y)< ROIDS_SIZE * 2 + ship.r);
		roids.push(newAsteroid(x,y, Math.ceil(ROIDS_SIZE / 2)));
	}
}

function destroyAsteroid(index){
	var x = roids[index].x;
	var y = roids[index].y;
	var r = roids[index].r;

	//split the asteroid in two if nesessery
	if (r == Math.ceil(ROIDS_SIZE / 2)) {
		score += 50;
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
	} else if (r == Math.ceil(ROIDS_SIZE / 4)) {
		score += 25;
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
	}

	// destroy the asteroid
	roids.splice(index, 1);
	score += 15;
}

function distBetweenPoints(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1,2));
}

function explodeShip(){
	ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
	x = Math.floor(Math.random()*canv.width);
	y = Math.floor(Math.random()*canv.height);
	switch(ev.keyCode) {
		case 37: //left arrow
			ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
			break;
		case 38: //up arrow
			ship.thrusting = true;
			break;
		case 39: //right arroow
			ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
			break;
		case 32: //spacebar
			shootLaser();
			break;	
	}
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
	switch(ev.keyCode) {
		case 37: //left arrow
			ship.rot = 0;
			break;
		case 38: //up arrow
			ship.thrusting = false;
			break;
		case 39: //right arroow
			ship.rot = 0;
			break;
		case 32:
			ship.canShoot = true;
			break
	}
}

function shootLaser() {
	//create the laser object
	if (ship.canShoot && ship.lasers.length < LASER_MAX){
		ship.lasers.push({
			x:ship.x + 4/3 * ship.r * Math.cos(ship.a),
			y:ship.y - 4/3 * ship.r * Math.sin(ship.a),
			xv: LASER_SPD * Math.cos(ship.a) / FPS,
			yv: -LASER_SPD * Math.sin(ship.a) / FPS,
			dist: 0,
			explodeTime: 0
		});
	}
	//prevent further shooting
	ship.canShoot = false;
}

function newAsteroid(x, y, r){
	var roid = {
		x: x,
		y: y,
		xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
		yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
		r: r,
		a: Math.random() * Math.PI * 2, // in radians
		vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
		offs: []
	};

	//create the vertex offsets array
	for (var i = 0; i < roid.vert; i++){
		roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG)
	}

	return roid;
}

function newShip() {
	return {
		x: canv.width / 2,
		y: canv.height / 2,
		r: SHIP_SIZE / 2,
		a: 90 / 180 * Math.PI, // convert to radians
		blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
		blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
		canShoot: true,
		explodeTime: 0,
		lasers:[],
		rot: 0,
		thrusting: false,
		thrust: {
			x: 0,
			y: 0
		}
	}
}

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

function update(){
	var blinkOn = ship.blinkNum % 2 == 0;
	var exploding = ship.explodeTime > 0;
	//draw space
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canv.width, canv.height);
	//thrust the ship
	if (ship.thrusting){
		ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
		ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

		// draw thruster
		if (!exploding && blinkOn){
			ctx.fillStyle = "red";
			ctx.strokeStyle = "yellow";
			ctx.lineWidth = SHIP_SIZE / 10;
			ctx.beginPath();
			ctx.moveTo( // rear left
				ship.x - ship.r * (2.4/3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
				ship.y + ship.r * (2.4/3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
				);
			ctx.lineTo( // rear center behind the ship
				ship.x - ship.r * 5/3 * Math.cos(ship.a),
				ship.y + ship.r * 5/3 * Math.sin(ship.a)
				);
			ctx.lineTo( // rear right
				ship.x - ship.r * (2.4/3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
				ship.y + ship.r * (2.4/3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
				);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	} else {
		ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
		ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
	}
	//draw triangular ship
	if (!exploding) {
		if (blinkOn) {
			ctx.strokeStyle = "white";
			ctx.lineWidth = SHIP_SIZE / 20;
			ctx.beginPath();
			ctx.moveTo( // nose of the ship
				ship.x + 4/3 * ship.r * Math.cos(ship.a),
				ship.y - 4/3 * ship.r * Math.sin(ship.a)
				);
			ctx.lineTo( // rear left
				ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)),
				ship.y + ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a))
				);
			ctx.lineTo( // rear right
				ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)),
				ship.y + ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a))
				);
			ctx.closePath();
			ctx.stroke();
		}
		if (ship.blinkNum > 0) {
			//reduce the blink time
			ship.blinkTime--;
			if (ship.blinkTime == 0) {
				ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
				ship.blinkNum--;
			}
		}
	} else {
		//draw the explosion
		ctx.fillStyle = "darkred";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r * 1.7, 0,Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r * 1.4, 0,Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "tomato";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r * 1.1, 0,Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "yellow";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r * 0.8, 0,Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r * 0.5, 0,Math.PI * 2, false);
		ctx.fill();
	}
	// check for asteroid collisions
	if(!exploding) {
		if (ship.blinkNum == 0){
			for (var i = 0; i < roids.length; i++){
				if (distBetweenPoints(ship.x,ship.y,roids[i].x,roids[i].y) < ship.r + roids[i].r){
					explodeShip();
					destroyAsteroid(i);
					break;
				}
			}
		}
		//rotate ship
		ship.a += ship.rot;
		//move the ship
		ship.x += ship.thrust.x;
		ship.y += ship.thrust.y;
	} else {
		ship.explodeTime--;
		if (ship.explodeTime == 0) {
			ship = newShip();
		}
	}
	// handle edge of screen
	if (ship.x < 0 - ship.r){
		ship.x = canv.width + ship.r;
	} else if (ship.x > canv.width + ship.r) {
		ship.x = 0 - ship.r;
	}
	if (ship.y < 0 - ship.r){
		ship.y = canv.height + ship.r;
	} else if (ship.y > canv.height + ship.r) {
		ship.y = 0 - ship.r;
	}

	// Move the lasers
	for (var i = ship.lasers.length-1; i  >= 0; i--){
		// check distance travelled
		if (ship.lasers[i].dist > LASER_DIST * canv.width) {
			ship.lasers.splice(i, 1);
			continue;
		}
		//handle the explosion
		if (ship.lasers[i].explodeTime > 0) {
			ship.lasers[i].explodeTime--;

			//destory the laser after duration is up
			if (ship.lasers[i].explodeTime == 0) {
				ship.lasers.splice(i,1);
				continue;
			}
		} else {

		ship.lasers[i].x += ship.lasers[i].xv;
		ship.lasers[i].y += ship.lasers[i].yv;

		// calcutale the trabel distance
		ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv,2)+Math.pow(ship.lasers[i].yv,2));
		}
		//handle edge of screen
		if (ship.lasers[i].x < 0) {
			ship.lasers[i].x  = canv.width;
		} else if (ship.lasers[i].x > canv.width) {
			ship.lasers[i].x = 0;
		}
		if (ship.lasers[i].y < 0) {
			ship.lasers[i].y  = canv.height;
		} else if (ship.lasers[i].y > canv.height) {
			ship.lasers[i].y = 0;
		}
	}

	if (SHOW_BOUNDING){
		ctx.strokeStyle = "lime";
		ctx.beginPath();
		ctx.arc(ship.x,ship.y,ship.r,0,Math.PI * 2, false);
		ctx.stroke();
	}
	//move the asteroid
	for (var i = 0; i < roids.length ; i++){
		roids[i].x += roids[i].xv;
		roids[i].y += roids[i].yv;
		//handle edge of screen
		if (roids[i].x < 0 - roids[i].r) {
			roids[i].x = canv.width + roids[i].r;
		} else if (roids[i].x > canv.width + roids[i].r){
			roids[i].x = 0 - roids[i].r;
		}
		if (roids[i].y < 0 - roids[i].r) {
			roids[i].y = canv.height + roids[i].r;
		} else if (roids[i].y > canv.height + roids[i].r){
			roids[i].y = 0 - roids[i].r;
		}
	}
	//
	// Draw the asteroids
	//
	//ctx.strokeStyle = "purple";
	//ctx.lineWidth = SHIP_SIZE / 20;
	var x,y,r,a,vert, offs;
	for (var i = 0; i < roids.length; i++){
		//get the asteroid properties
		ctx.strokeStyle = colors[i];
		ctx.lineWidth = SHIP_SIZE / 20;
		x = roids[i].x;
		y = roids[i].y;
		r = roids[i].r;
		a = roids[i].a;
		vert = roids[i].vert;
		offs = roids[i].offs;
		//draw a path
		ctx.beginPath();
		ctx.moveTo(
			x + r * offs[0] * Math.cos(a),
			y + r * offs[0] * Math.sin(a)
		);

		//draw the polygon
		for(var j = 1; j<vert; j++){
			ctx.lineTo(
				x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
				y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
			);
		}
		ctx.closePath();
		ctx.stroke();

		if (SHOW_BOUNDING){
		ctx.strokeStyle = "lime";
		ctx.beginPath();
		ctx.arc(x,y,r,0,Math.PI * 2, false);
		ctx.stroke();
		}
	}
	///
	/// Draw the Lasers
	///
	for (var i = 0; i < ship.lasers.length; i++){
		if (ship.lasers[i].explodeTime == 0) {
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI *2, false);
			ctx.fill();
		} else {
			// draw the explosion
			ctx.fillStyle = "orangered";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI *2, false);
			ctx.fill();
			ctx.fillStyle = "orange";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.50, 0, Math.PI *2, false);
			ctx.fill();
			ctx.fillStyle = "yellow";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI *2, false);
			ctx.fill();
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.15, 0, Math.PI *2, false);
			ctx.fill();
		}
	}
	// Detect laster hits
	var ax,ay, ar, lx,ly;
	for (var i = roids.length - 1; i >= 0; i--){
		//grab the asteroid properties
		ax = roids[i].x;
		ay = roids[i].y;
		ar = roids[i].r;
		//loop over the lasers
		for (var j = ship.lasers.length - 1; j >= 0; j--){
			//grab the lasers properties
			lx = ship.lasers[j].x;
			ly = ship.lasers[j].y;

			//detect hits
			if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
				//remove asteroid
				destroyAsteroid(i);
				ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
				break;
			}
		}
	}
}