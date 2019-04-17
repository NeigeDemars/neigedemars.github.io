const FPS = 60; //frames per second
const FRICTION = 0.7; // friction coefficient of space where 0 = no fric 1 = lot of firc
const SHIP_SIZE = 30;
const SHIP_THRUST = 5; //acceleration of the ship in pixel per second
const TURN_SPEED = 360; //turn speed in degrees per second
const ROIDS_NUM = 10; // starting number of asteroids
const ROIDS_SIZE = 100; // size of asteroids in pixerls
const ROIDS_SPD = 50; // max starting speed of asteroids in pixels per secound
const ROIDS_VERT = 10; //averege number of vert's
const ROIDS_JAG = 0.4; //jaggedness of the asteroids 0 = none; 1 = lots
const colors = [
	null,
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
];

/** @type {HTMLCanvasElement} */
var canv = document.getElementById("game");
var ctx = canv.getContext("2d");

var ship = {
	x: canv.width / 2,
	y: canv.height / 2,
	r: SHIP_SIZE / 2,
	a: 90 / 180 * Math.PI, // convert to radians
	rot: 0,
	thrusting: false,
	thrust: {
		x: 0,
		y: 0
	}
}

//set up asteroids
var roids = [];
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
		roids.push(newAsteroid(x,y));
	}
}

function distBetweenPoints(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1,2));
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
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
	}
}

function newAsteroid(x, y){
	var roid = {
		x: x,
		y: y,
		xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
		yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
		r: ROIDS_SIZE / 2,
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

function update(){
	//draw space
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canv.width, canv.height);
	//thrust the ship
	if (ship.thrusting){
		ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
		ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

		// draw thruster
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
	} else {
		ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
		ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
	}
	//draw triangular ship
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
	//rotate ship
	ship.a += ship.rot;
	//move the ship
	ship.x += ship.thrust.x;
	ship.y += ship.thrust.y;

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
		//move the asteroid
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
	// centre dot
	//ctx.fillStyle = "red";
	//ctx.fillRect(ship.x - 1, ship.y -1, 2, 2);
}
}