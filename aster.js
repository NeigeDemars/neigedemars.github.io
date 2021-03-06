const FPS = 60; //frames per second
const GAME_LIVES = 3; //starting number of lifes
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
const ROIDS_NUM = 1; // starting number of asteroids
const ROIDS_SIZE = 100; // size of asteroids in pixerls
const ROIDS_SPD = 50; // max starting speed of asteroids in pixels per secound
const ROIDS_VERT = 10; //averege number of vert's
const ROIDS_JAG = 0.4; //jaggedness of the asteroids 0 = none; 1 = lots
const ROIDS_PTS =  25;
const SHOW_BOUNDING = false; //show or hide collision bounding 
const TEXT_FADE_TIME = 2.5; //time of fading in sec
const TEXT_SIZE = 40; //text font height in pixels
const SAVE_KEY_SCORE = "highscore";
const SOUND_ON = true;
const MUSIC_ON = true;
const colors = [ //Asteroids Color
	'#FA0567',
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

//set up sound effects
var fxExplode = new Sound("explode.m4a", 1, 0.3);
var fxLaser = new Sound("laser.m4a", 5, 0.05);
var fxHit = new Sound("hit.m4a", 5, 0.05);
var fxThrust = new Sound("thrust.m4a", 1, 0.05);

//set up the music
var music = new Music("music-low.m4a", "music-high.m4a");
var roidsLeft, roidsTotal;

// set up the game parameters
var level, roids, ship, text, textAlpha, lives, score, highScore;
newGame();

//Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Game Loop
setInterval(update, 1000 / FPS);

function Music(srclow, srchigh){
	this.soundLow = new Audio(srclow);
	this.soundLow.volume = 0.1;
	this.soundHigh = new Audio(srchigh);
	this.soundHigh.volume = 0.1;
	this.low = true;
	this.tempo = 1.0; //second per bit
	this.beatTime = 0; //frame left until beat

	this.play = function(){
		if (MUSIC_ON){
			if (this.low) {
				this.soundLow.play();
			} else {
				this.soundHigh.play();
			}
			this.low = !this.low;
			}
		}
	this.setAsteroidRatio = function(ratio) {
		this.tempo = 1.0 - 0.75 * (1.0 - ratio);
	}

	this.tick = function(){
		if (this.beatTime == 0) {
			this.play();
			this.beatTime = Math.ceil(this.tempo * FPS);
		} else {
			this.beatTime--;
		}
	}
}

function Sound(src, maxStreams = 1, vol = 1.0) {
	this.streamNum = 0;
	this.streams = [];
	for (var i = 0; i < maxStreams; i++){
		this.streams.push(new Audio(src));
		this.streams[i].volume = vol;
	}

	this.play = function() {
		if (SOUND_ON) {
		this.streamNum = (this.streamNum + 1) % maxStreams;
		this.streams[this.streamNum].play();
		}
	}
	this.stop = function(){
		this.streams[this.streamNum].pause();
		this.streams[this.streamNum].currentTime = 0;
	}
}

function createAsteroidBelt(){
	roids = [];
	roidsTotal = (ROIDS_NUM + level) * 7;
	roidsLeft = roidsTotal;
	var x,y;
	for (var i = 0; i < ROIDS_NUM + level; i++){
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
	fxHit.play();
	//split the asteroid in two if nesessery
	if (r == Math.ceil(ROIDS_SIZE / 2)) {
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
		score += ROIDS_PTS;
	} else if (r == Math.ceil(ROIDS_SIZE / 4)) {
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
		roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
		score += ROIDS_PTS * 2;
	}
	score += ROIDS_PTS * 4;
	// Check high score
	if (score > highScore) {
		highScore = score;
		localStorage.setItem(SAVE_KEY_SCORE, highScore);
	}

	// destroy the asteroid
	roids.splice(index, 1);
	//calculate the ratio of remaining asteroids
	roidsLeft--;
	music.setAsteroidRatio(roidsLeft == 0 ? 1 : roidsLeft / roidsTotal);

	// new level when no more asteroids
	if (roids.length == 0) {
		level++;
		newLevel();
	}
}

function distBetweenPoints(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1,2));
}

function explodeShip(){
	fxExplode.play();
	score -= 200;
	ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function gameOver(){
	ship.dead = true;
	text = "Game Over";
	textAlpha = 1.0;
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
	if (ship.dead) {
		if(ev.keyCode === 82) {
			newGame();
		}
	}
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
	if (ship.dead) {
		if(ev.keyCode === 82) {
			newGame();
		}
	}
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
		fxLaser.play();
	}
	//prevent further shooting
	ship.canShoot = false;
}

function newAsteroid(x, y, r){
	var lvlMult = 1 + 0.1 * level;
	var roid = {
		x: x,
		y: y,
		xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
		yv: Math.random() * ROIDS_SPD * lvlMult/ FPS * (Math.random() < 0.5 ? 1 : -1),
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

function newGame() {
	score = 0;
	level = 0;
	lives = GAME_LIVES;
	ship = newShip();
	var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
	if (scoreStr == null) {
		highScore = 0;
	} else {
		highScore = parseInt(scoreStr);
	}
	newLevel();

}

function newLevel() {
	var levScore = 150 * level;
	score += levScore;
	text = "Level: " + (level + 1) + "   !" + levScore + "PTS!"; 
	textAlpha = 1.0; 
	createAsteroidBelt();
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
		dead: false,
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

function drawShip(x,y,a, color = "white"){
	ctx.strokeStyle = color;
	ctx.lineWidth = SHIP_SIZE / 20;
	ctx.beginPath();
	ctx.moveTo( // nose of the ship
		x + 4/3 * ship.r * Math.cos(a),
		y - 4/3 * ship.r * Math.sin(a)
		);
	ctx.lineTo( // rear left
		x - ship.r * (2/3 * Math.cos(a) + Math.sin(a)),
		y + ship.r * (2/3 * Math.sin(a) - Math.cos(a))
		);
	ctx.lineTo( // rear right
		x - ship.r * (2/3 * Math.cos(a) - Math.sin(a)),
		y + ship.r * (2/3 * Math.sin(a) + Math.cos(a))
		);
	ctx.closePath();
	ctx.stroke();
}

Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

function update(){
	var blinkOn = ship.blinkNum % 2 == 0;
	var exploding = ship.explodeTime > 0;

	music.tick();
	//draw space
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canv.width, canv.height);
	//thrust the ship
	if (ship.thrusting && !ship.dead){
		ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
		ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
		fxThrust.play();

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
		//Apply friction
		ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
		ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
		fxThrust.stop();
	}
	//draw triangular ship
	if (!exploding) {
		if (blinkOn && !ship.dead) {
			drawShip(ship.x, ship.y, ship.a);
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
		if (ship.blinkNum == 0 && !ship.dead){
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
			lives--;
			if (lives == 0){
				gameOver();
			} else {
				ship = newShip();
			}
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
		ctx.strokeStyle = colors[0];
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
			ctx.fillStyle = "yellow";
			ctx.beginPath();
			ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.50, 0, Math.PI *2, false);
			ctx.fill();
			ctx.fillStyle = "red";
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
	///
	///Draw Game Text
	///
	if (textAlpha >= 0) {
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "rgba(128,0,0, " + textAlpha + ")";
		ctx.font = "small-caps " + TEXT_SIZE + "px Kremlin";
		ctx.fillText(text, canv.width / 2, canv.height * 0.75);
		textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
	} else if (ship.dead) {
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "rgb(128,0,0)";
		ctx.font = "small-caps " + TEXT_SIZE + "px Kremlin";
		ctx.fillText("Press «R» to Restart the Game", canv.width / 2, canv.height * 0.75);
		//newGame();
	}
	///
	///Draw the Lives
	///
	var lifeColor;
	for (var i = 0; i< lives; i++) {
		lifeColor = exploding && i == lives - 1 ? "red" : "white";
		drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
	}
	///
	///Draw the Score
	///
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "white";
	ctx.font = TEXT_SIZE + "px Kremlin";
	ctx.fillText(score, canv.width - SHIP_SIZE * 0.25, SHIP_SIZE);	
	///
	///Draw the High Score
	///
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "white";
	ctx.font = (TEXT_SIZE * 0.75) + "px Kremlin";
	ctx.fillText("BEST: " + highScore, canv.width - SHIP_SIZE * 0.25, canv.height - 17);	
}
