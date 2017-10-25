var sketch = function (p) {

    var canv = $("#candiv");
    var wimg = $("#row1 img, #row2 img");
    var bimg = $("#bases img");
    var prec = canv[0].getBoundingClientRect();

    var curWidth = canv.width();
    var curHeight = canv.height();

    var ship;
    var welcome;
    var score;
    var fontRegular;

    var started = false; //marks whether level has started
    var paused = false;
    var shot = false; //marks whether player has been shot

    var invaders = []; //array for all icons
    var delInvader = []; //array of icons being deleted
    var mylaser = []; //array for all shots from player
    var laser = []; //array for all shots from invaders
    var bases = []; //array for base icons
    var myimgs = []; //array for images
    var mybase = []; //array for base images
    var browser;

    var rInvade = p.floor(wimg[0].width / 2); //radius of invaders
    var pInvade = 0.001; //starting probability of firing laser

    var level = 1; //starting level
    var hiscore = 0; //default hiscore

    //this checks whether the game is being played as a chrome extension, and sets and gets hi-score
    if (location.protocol == "chrome-extension:") {
        chrome.storage.local.get("hiscore", function (result) {
            hiscore = result.hiscore;
            if (hiscore === undefined) {
                chrome.storage.local.set({
                    "hiscore": 0
                });
                hiscore = 0;
            }
        });
    }

    //preloads the images and the font
    p.preload = function () {
        fontRegular = p.loadFont("fonts/PressStart2P-Regular.ttf");

        browser = p.loadImage("imgs/chrome.png");

        var myIcons = $("#row1 img, #row2 img");
        for (var i = 0; i < myIcons.length; i++) {
            myimgs[i] = p.loadImage(myIcons[i].src);
        }

        var myBases = $("#bases img");
        for (var j = 0; j < myBases.length; j++) {
            mybase[j] = p.loadImage(myBases[j].src);
        }
    };

    p.setup = function () {
        p.createCanvas(curWidth, curHeight);
        p.background("#212121");
        score = new p.Score(0, hiscore);
        ship = new p.Ship();
        p.setinvaders(pInvade);
        p.setBases();
        welcome = new p.Welcome("WELCOME, PLAYER", "PRESS ENTER");
    };

    p.draw = function () {
        p.background("#212121");

        //Next Level
        if (invaders.length == 0) {
            started = false;
            ship.setDir(0);
            ship.x = p.width / 2;
            mylaser = [];
            laser = [];
            p.setinvaders(pInvade * 5);
            p.setBases();
            welcome = new p.Welcome("LEVEL " + ++level, "PRESS ENTER");
        }

        // Show Welcome Screen
        if (!started) {
            welcome.show();
            //p.noLoop();
        }

        //Always show score and ship
        score.show();
        ship.show();
        ship.move();

        //ship can't go beyond canvas
        if (ship.x + 10 > p.width || ship.x - 10 < 0) {
            ship.setDir(0);
        }

        //mylaser
        for (var i = mylaser.length - 1; i >= 0; i--) {
            // if mylaser goes off screen
            if (mylaser[i].y < 0) {
                mylaser[i].evaporate();
            }

            //if mylaser hits Invader
            if (!mylaser[i].toDelete) {
                for (var j = invaders.length - 1; j >= 0; j--) {
                    if (mylaser[i].hits(invaders[j])) {
                        score.myscore++;
                        delInvader.push(invaders[j]);
                        invaders.splice(j, 1);
                        mylaser[i].evaporate();
                        break;
                    }
                }
            }

            //if mylaser hits base
            if (!mylaser[i].toDelete) {
                for (var k = 0; k < bases.length; k++) {
                    if (mylaser[i].hits(bases[k])) {
                        bases[k].jitter();
                        mylaser[i].evaporate();
                        break;
                    }
                }
            }

            // Delete if marked for deletion, otherwise show and move
            if (mylaser[i].toDelete) {
                mylaser.splice(i, 1);
            } else {
                mylaser[i].move();
                mylaser[i].show();
            }
        }

        //LASERS
        for (var m = laser.length - 1; m >= 0; m--) {
            // if laser goes off screen
            if (laser[m].y > p.height) {
                laser[m].evaporate();
            }

            // if laser hits base
            if (!laser[m].toDelete) {
                for (var n = 0; n < bases.length; n++) {
                    if (laser[m].hits(bases[n])) {
                        bases[n].jitter();
                        laser[m].evaporate();
                        break;
                    }
                }
            }

            // if laser hits ship
            if (!laser[m].toDelete) {
                if (laser[m].destroys(ship)) {
                    shot = true;
                }
            }

            // Delete if marked for deletion, otherwise show and fall
            if (laser[m].toDelete) {
                laser.splice(m, 1);
            } else {
                laser[m].fall();
                laser[m].show();
            }
        }


        //hit animation && delete once done
        if (delInvader.length > 0) {
            for (var o = delInvader.length - 1; o >= 0; o--) {
                if (delInvader[o].r > 5) {
                    delInvader[o].jitter();
                    delInvader[o].show();
                } else {
                    delInvader.splice(o, 1);
                }
            }
        }


        var edge = false;
        for (var q = 0; q < invaders.length; q++) {
            invaders[q].show();
            if (started) {
                invaders[q].move();
                // check if Invader hits side
                if (invaders[q].x > p.width - rInvade || invaders[q].x < rInvade) {
                    edge = true;
                }
                //chance for each Invader to shoot laser
                if (p.random() < invaders[q].pInvade) {
                    laser.push(new p.myLasers(invaders[q].x, invaders[q].y + rInvade, true));
                }
                //if Invader hits ship or base
                if (invaders[q].destroys(ship) || invaders[q].y > p.height - invaders[q].r) {
                    shot = true;
                } else if (bases.length > 0) {
                    for (var s = bases.length - 1; s >= 0; s--) {
                        if (invaders[q].collides(bases[s])) {
                            bases.splice(s, 1);
                            break;
                        }
                    }
                }
            }
        }

        // if Invader hits side shiftDown
        if (edge) {
            for (var t = 0; t < invaders.length; t++) {
                invaders[t].shiftDown();
            }
        }

        // show or remove bases
        for (var v = bases.length - 1; v >= 0; v--) {
            if (bases[v].r < 20) {
                bases.splice(v, 1);
            } else {
                bases[v].show();
            }
        }


        // if ship is hit
        if (shot) {
            started = false;
            ship.setDir(0);
            ship.x = p.width / 2;
            mylaser = [];
            laser = [];
            shot = false;
            p.setinvaders(pInvade);
            p.setBases();

            level = 1;
            if (hiscore < score.myscore) {
                welcome = new p.Welcome("NEW HI-SCORE", "PRESS ENTER");
                chrome.storage.local.set({
                    "hiscore": score.myscore
                });
                score.hiscore = score.myscore;
            } else {
                welcome = new p.Welcome("YOU DIED", "PRESS ENTER");
            }
            score.myscore = 0;
            score.show();
        }

    };

    // OBJECT DEFINITIONS & OTHER FUNCTIONS

    p.Ship = function () {
        this.x = p.width / 2;
        this.xdir = 0;
        this.r = 40;

        this.show = function () {
            p.imageMode(p.CENTER);
            p.image(browser, this.x, p.height, this.r * 2, this.r * 2);
        };

        this.setDir = function (dir) {
            this.xdir = dir;
        };

        this.move = function () {
            this.x += this.xdir * 5;
        };

    };

    p.Invader = function (x, y, r, power, icon, iconNum) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.pInvade = power;
        this.toDelete = false;
        this.iconNum = iconNum;
        this.xdir = 1;

        this.shiftDown = function () {
            this.xdir *= -1;
            this.y += this.r;
        };

        this.move = function () {
            this.x = this.x + this.xdir;
        };

        this.jitter = function () {
            this.r -= 5;
        };

        //if Invader hits the ship
        this.destroys = function (ship) {
            var d = p.dist(this.x, this.y, ship.x, p.height);
            if (d < this.r + ship.r) {
                return true;
            } else {
                return false;
            }
        };

        this.collides = function (base) {
            var d = p.dist(this.x, this.y, base.x, base.y);
            if (d < this.r + base.r) {
                return true;
            } else {
                return false;
            }
        };

        this.show = function () {
            p.imageMode(p.CENTER);
            p.image(icon, this.x, this.y, this.r * 2, this.r * 2);
        };


    };

    p.myLasers = function (x, y, islaser) {
        this.x = x;
        this.y = y;
        this.r = 8;
        this.toDelete = false;
        this.islaser = islaser;

        this.show = function () {
            p.noStroke();
            if (this.islaser) {
                p.fill(255, 255, 255);
            } else {
                p.fill("#F44336");
            }
            p.ellipse(this.x, this.y, this.r * 2, this.r * 2);
        };

        this.evaporate = function () {
            this.toDelete = true;
        };

        this.hits = function (Invader) {
            var d = p.dist(this.x, this.y, Invader.x, Invader.y);
            if (d < this.r + Invader.r) {
                return true;
            } else {
                return false;
            }
        };

        this.destroys = function (ship) {
            var d = p.dist(this.x, this.y, ship.x, p.height);
            if (d < this.r + ship.r) {
                return true;
            } else {
                return false;
            }
        };

        this.move = function () {
            this.y = this.y - 5;
        };

        this.fall = function () {
            this.y = this.y + 5;
        };

    };

    p.Welcome = function (mytext, mytext2) {

        this.mytext2 = mytext2;
        this.mytext = mytext;
        this.show = function () {
            p.push();
            p.fill(21, 248, 28);

            p.textAlign(p.CENTER);
            p.textFont(fontRegular);

            p.textSize(45);
            p.text(this.mytext, p.width / 2, 375);
            p.text(this.mytext2, p.width / 2, 425);

            p.pop();
        };
    };

    p.Score = function (myscore, hiscore) {
        this.myscore = myscore;
        this.hiscore = hiscore;

        this.show = function () {
            var s = "000" + this.myscore;
            var mytext = s.substr(s.length - 4);

            var h = "000" + this.hiscore;
            var myhiscore = h.substr(h.length - 4);

            //console.log(this.hiscore);

            p.textSize(15);
            p.fill(255, 255, 255);
            p.textAlign(p.LEFT);
            p.textFont(fontRegular);
            p.text("SCORE<1>", 10, 25);
            p.text(mytext, 10, 50);
            p.textAlign(p.RIGHT);
            p.text("HI-SCORE  SCORE<2>", p.width - 10, 25);
            p.text(myhiscore, p.width - 10, 50);

        };

    };

    p.setinvaders = function (power) {

        var pos = p.getIconPos(wimg);
        var myx, myy;

        for (var i = 0; i < pos.length; i++) {
            myx = (pos[i].left - prec.left) + rInvade;
            myy = (pos[i].top - prec.top) + rInvade;
            invaders[i] = new p.Invader(myx, myy, rInvade, power, myimgs[i], i);
        }
    };

    p.setBases = function () {
        var pos = p.getIconPos(bimg);
        var myx, myy;

        for (var i = 0; i < pos.length; i++) {
            myx = (pos[i].left - prec.left) + rInvade;
            myy = (pos[i].top - prec.top) + rInvade;
            bases[i] = new p.Invader(myx, myy, rInvade, 0, mybase[i], i);
        }
    };

    p.getIconPos = function (imgset) {
        var pos = [];
        for (var i = 0; i < imgset.length; i++) {
            pos.push(imgset[i].getBoundingClientRect());
        }
        return pos;
    };

    p.windowResized = function () {
        p.noLoop();
        paused = true;
        var newWidth = canv.width();
        var newHeight = canv.height();

        p.resizeCanvas(newWidth, newHeight);

        var wpos = p.getIconPos(wimg);
        for (var i = 0; i < invaders.length; i++) {
            invaders[i].x = (wpos[invaders[i].iconNum].left - prec.left) + rInvade;
            invaders[i].y = (wpos[invaders[i].iconNum].top - prec.top) + rInvade;
        }

        var bpos = p.getIconPos(bimg);
        for (var j = 0; j < bases.length; j++) {
            bases[j].x = (bpos[bases[j].iconNum].left - prec.left) + rInvade;
            bases[j].y = (bpos[bases[j].iconNum].top - prec.top) + rInvade;
        }

        ship.x = p.width / 2;
        p.redraw();
    };

    //This changes the direction of the ship based on arrows
    p.keyReleased = function () {
        if (started && (p.keyCode === p.RIGHT_ARROW || p.keyCode === p.LEFT_ARROW)) {
            ship.setDir(0);
        }
    };

    p.keyPressed = function () {
        if (started) {
            switch (p.keyCode) {
            case 32:
                if (mylaser.length < 5) {
                    var dlaser = new p.myLasers(ship.x, p.height - 60, false);
                    mylaser.push(dlaser);
                }
                break;
            case p.RIGHT_ARROW:
                if (ship.x + ship.r < p.width) {
                    ship.setDir(1);
                }
                break;
            case p.LEFT_ARROW:
                if (ship.x - ship.r > 0) {
                    ship.setDir(-1);
                }
                break;
            case p.ESCAPE:
                if (!paused) {
                    paused = true;
                    welcome.mytext = "PAUSED";
                    started = false;
                    p.noLoop();
                    p.redraw();
                }
                break;
            }
        } else if (p.keyCode === p.ENTER) {
            //start the game
            started = true;
            paused = false;
            welcome.mytext = "WELCOME, PLAYER";
            p.loop();
        }
        
        if (p.keyCode === p.DELETE) {
            //console.log("Should be DELETED");
            canv.toggleClass("hider");
            $("#sidePanel").toggleClass("collapsed myMease");
            $("#iconPanel").toggleClass("col-lg-9 col-md-8 col-lg-12 col-md-12 myWease");
            $("#baseSpace").slideToggle();
            $(".button").fadeToggle();
            p.remove();
        }
    };
};