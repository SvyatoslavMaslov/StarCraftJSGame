var MyApp = {
    Units: {
        player: {
            img: null,
            posX: 0,
            posY: 0,
            step: 10,
            sprite: 0,
            size: 80,
            shootSound: null,
            deathSound: null,
            mineralSound: null,
            recharge: 61,
            curRechargeValue: 0,
            isRecharging: false
        },
        enemy: {
            img: null,
            posX: 720,
            posY: 720,
            step: 3,
            sprite: 0,
            nav: null,
            size: 80,
            deathSound: null
        },
        bullet: {
            img: null,
            posX: 0,
            posY: 0,
            step: 10,
            spriteX: 0,
            spriteY: 0,
            nav: null,
            size: 20,
            pause: 3
        },
        bang: {
            img: null,
            posX: 0,
            posY: 0,
            sprite: 0,
            size: 80,
            pause: 3,
            currPause: 0,
        },
        bangBattleCruiser: {
            img: null,
            posX: 0,
            posY: 0,
            sprite: 0,
            size: 80,
            pause: 3,
            currPause: 0,
        },
    },
    DOM: {
        portrait: null,
        deathPortrait: null,
        kill: null,
        crystals: null,
        status: null,
        mark: null,
        hideClass: 'hide',
        mainClass: 'portrait',
        deathMsg: 'DEAD',
        readyMsg: 'Ready',
        winMsg: 'You are WINNER',
    },
    BulletsArray: [],
    BangArray: [],
    Canvas: {
        ctx: null
    },
    Location: {
        map: null,
        size: null,
        cell: null,
        wall: null,
        crystalsArray: null,
        crystal: null,
    },
    BackGround: {
        img1: new Image(),
        img2: new Image(),
        coord1: null,
        coord2: null,
        speed: 1
    },
    PauseGame: false,
    Death: false,
    Kill: 0,
    Cristalls: 0
};

(function ($, undefined) {
    'use strict';
    var w = window,
        requestAnimationFrame = w.requestAnimationFrame ||
            w.webkitRequestAnimationFrame ||
            w.msRequestAnimationFrame ||
            w.mozRequestAnimationFrame;

    window.onload = function () {
        var startButton = document.getElementById('Start'),
            restartButton = document.getElementById('TryAgain'),
            winButton = document.getElementById('StartAgain');

        $.DOM.portrait = document.getElementById('Portrait1');
        $.DOM.deathPortrait = document.getElementById('Portrait2');
        $.DOM.kill = document.getElementById('Kill');
        $.DOM.crystals = document.getElementById('Crystals');
        $.DOM.status = document.getElementById('Status');
        $.DOM.mark = document.getElementById('Mark');

        startButton.onclick = startApp;
        restartButton.onclick = restart;
        winButton.onclick = restart;
    };

    /* MAIN METHODS */

    function startApp() {
        var audio = new Audio(),
            dialog = document.getElementById('StartDialog');
        dialog.style.display = 'none';
        audio.src = 'audio/The_Deal.mp3';
        audio.autoplay = true;
        initGameParams($);
        initUnits($);
        render();
        window.addEventListener('keydown', handler, false);
        window.addEventListener('keyup', spaceHandler, false);
    }

    function restart() {
        var deadDialog = document.getElementById('DeadDialog'),
            winDialog = document.getElementById('WinDialog');
        deadDialog.style.display = 'none';
        winDialog.style.display = 'none';
        resetGame();
        initUnits($);
    }

    function render() {
        requestAnimationFrame(render);
        renderMap();
        renderUnit($.Units.enemy);
        if (!$.PauseGame) {
            renderBangs();
            renderBullets();
            renderUnit($.Units.player);
            moveEnemy();
            moveBullets();
            playerRechargePause();
        }
        if ($.Death) {
            renderShipBang();
        }
    }

    /* END MAIN METHODS */

    /* INITIALIZATION */

    function initGameParams($) {
        var canvas = document.getElementById("Canvas"),
			ctx = canvas.getContext('2d'),
            width = 800,
            cell = width / 10,
            wall = new Image(),
            crystal = new Image(),
            bg1 = $.BackGround.img1,
            bg2 = $.BackGround.img2,
            map = [
                [1, 1],
                [1, 2],
                [2, 2],
                [2, 3],
                [3, 3],
                [3, 4],
                [6, 0],
                [6, 1],
                [6, 2],
                [5, 2],
                [8, 1],
                [8, 2],
                [0, 5],
                [7, 4],
                [8, 4],
                [6, 5],
                [9, 6],
                [1, 8],
                [2, 7],
                [3, 8],
                [8, 8],
                [6, 9],
            ],
            crystals = [
                [2, 8],
                [5, 1],
                [9, 0],
                [8, 9],
                [5, 6]
            ];

        $.Location.map = map;
        $.Location.size = width;
        $.Location.cell = cell;
        $.Location.wall = wall;
        $.Location.crystal = crystal;
        $.Location.crystalsArray = crystals;
        $.Canvas.ctx = ctx;

        $.BackGround.coord1 = 0;
        $.BackGround.coord2 = width;


        canvas.width = width;
        canvas.height = width;
        ctx.fillRect(0, 0, width, width);

        bg1.src = 'images/1.jpg';
        bg1.onload = function () {
            ctx.drawImage(bg1, 0, 0, width, width);
            bg2.src = 'images/2.jpg';
            bg2.onload = function () {
                wall.src = 'images/wall.png';
                wall.onload = function () {
                    crystal.src = 'images/crystal.png';
                };
            };
        };
    }

    function initUnits($) {
        var player = new Image(),
            enemy = new Image(),
            bang = new Image(),
            bullet = new Image(),
            battleCruiserBang = new Image(),
            shootSound = new Audio(),
            archonDeathSound = new Audio(),
            shipDeathSound = new Audio(),
            mineralSound = new Audio(),
            startSound = new Audio();

        startSound.src = 'audio/start.mp3';
        startSound.play();
        archonDeathSound.src = 'audio/Archon_Death.mp3';
        shipDeathSound.src = 'audio/bang.mp3';
        shootSound.src = 'audio/shot.mp3';
        mineralSound.src = 'audio/mineral.mp3';
        battleCruiserBang.src = 'images/bangBC.png';
        bang.src = 'images/bang.png';
        player.src = 'images/BattleCruiser.png';
        enemy.src = 'images/archon.png';
        bullet.src = 'images/fire.png';
        $.Units.player.img = player;
        $.Units.enemy.img = enemy;
        $.Units.bullet.img = bullet;
        $.Units.player.shootSound = shootSound;
        $.Units.player.deathSound = shipDeathSound;
        $.Units.player.mineralSound = mineralSound;
        $.Units.enemy.deathSound = archonDeathSound;
        $.Units.bangBattleCruiser.img = battleCruiserBang;
        $.Units.bang.img = bang;

        $.DOM.deathPortrait.style.display = 'none';
        $.DOM.portrait.style.display = 'block';
        $.DOM.kill.textContent = 0;
        $.DOM.crystals.textContent = 0;
        $.DOM.status.textContent = $.DOM.readyMsg;
        $.DOM.mark.style.width = '0px';
    }

    /* END INITIALIZATION */

    function resetGame() {
        $.Units = {
            player: {
                img: null,
                posX: 0,
                posY: 0,
                step: 10,
                sprite: 0,
                size: 80,
                shootSound: null,
                deathSound: null,
                mineralSound: null,
                recharge: 61,
                curRechargeValue: 0,
                isRecharging: false
            },
            enemy: {
                img: null,
                posX: 720,
                posY: 720,
                step: 10,
                sprite: 0,
                nav: null,
                size: 80,
                deathSound: null
            },
            bullet: {
                img: null,
                posX: 0,
                posY: 0,
                step: 10,
                spriteX: 0,
                spriteY: 0,
                nav: null,
                size: 20,
                pause: 3
            },
            bang: {
                img: null,
                posX: 0,
                posY: 0,
                sprite: 0,
                size: 80,
                pause: 3,
                currPause: 0,
            },
            bangBattleCruiser: {
                img: null,
                posX: 0,
                posY: 0,
                sprite: 0,
                size: 80,
                pause: 3,
                currPause: 0,
            }
        };
        $.Location.crystalsArray = [
            [2, 8],
            [5, 1],
            [9, 0],
            [8, 9],
            [5, 6],
        ];
        $.BulletsArray = [];
        $.BangArray = [];
        $.PauseGame = false;
        $.Death = false;
        $.Kill = 0;
        $.Cristalls = 0;
    }

    function getRandomInt(min, max) {
        return (Math.floor(Math.random() * (max - min + 1)) + min).toFixed(0);
    }

    /* SHOOTING PART */

    function playerRechargePause() {
        var player = $.Units.player;
        if (player.isRecharging === true) {
            player.curRechargeValue = player.curRechargeValue + 1;
            $.DOM.mark.style.width = parseInt($.DOM.mark.style.width, 10) + 1 + 'px';
        }
        if (player.curRechargeValue > player.recharge) {
            player.isRecharging = false;
            player.curRechargeValue = 0;
        }
    }

    function setFireBall($) {
        var bullets = $.BulletsArray,
            copy = Object.assign({}, $.Units.bullet),
            cell = $.Location.cell,
            player = $.Units.player;
        player.shootSound.play();
        copy.nav = convertSpriteCoordsToDirection(player.sprite);
        copy.posX = player.posX + (cell / 2) - 10;
        copy.posY = player.posY + (cell / 2) - 10;
        copy.spriteY = getBulletDirectionSprite(copy.nav);
        copy.spriteX = 0;
        bullets.push(copy);
    }

    /* END SHOOTING PART */

    /* MOVING PART */

    function movePlayer($, deltaX, deltaY) {
        var player = $.Units.player,
            canMove = checkUnitCollision($, player, deltaX, deltaY);
        if (canMove === true) {
            player.posX = player.posX + deltaX;
            player.posY = player.posY + deltaY;
        }
        checkCrystalCollision(player.posX, player.posY, player.size);
    }

    function moveEnemy() {
        var direction,
            bool = true,
            player = $.Units.player,
            deadDialog,
            enemy = $.Units.enemy;
        if (!enemy.nav) {
            enemy.nav = getRandomInt(1, 4);
        }
        do {
            direction = getDirection(enemy.nav);
            if (!checkUnitCollision($, enemy, direction[0], direction[1])) {
                enemy.nav = getRandomInt(1, 4);
            } else {
                enemy.posX = enemy.posX + direction[0];
                enemy.posY = enemy.posY + direction[1];

                if (checkObjectsCollision(player, enemy)) {
                    player.deathSound.play();
                    $.Units.bangBattleCruiser.posX = player.posX;
                    $.Units.bangBattleCruiser.posY = player.posY;
                    $.DOM.deathPortrait.style.display = 'block';
                    $.DOM.portrait.style.display = 'none';
                    $.DOM.status.textContent = $.DOM.deathMsg;
                    deadDialog = document.getElementById('DeadDialog');
                    deadDialog.style.display = 'block';
                    $.PauseGame = true;
                    $.Death = true;
                }
                bool = false;
            }
        } while (bool);
    }

    function moveBullets() {
        var bArray = $.BulletsArray,
            size = $.Units.bullet.size,
            length = bArray.length,
            direction,
            enemy = $.Units.enemy,
            bang = Object.assign({}, $.Units.bang),
            i;
        if (length > 0) {
            for (i = 0; i < length; i = i + 1) {
                if (bArray[i]) {
                    direction = getDirection(bArray[i].nav);
                    bArray[i].posX = bArray[i].posX + direction[0];
                    bArray[i].posY = bArray[i].posY + direction[1];
                    if (checkObjectsCollision(bArray[i], enemy)) {
                        bang.posX = enemy.posX;
                        bang.posY = enemy.posY;
                        $.BangArray.push(bang);
                        enemy.posX = 720;
                        enemy.posY = 720;
                        bArray.splice(i, 1);
                        enemy.deathSound.play();
                        $.DOM.kill.textContent = +$.DOM.kill.textContent + 1;
                        bArray.splice(i, 1);
                        continue;
                    }
                    if (!checkWallsCollision(bArray[i].posX, bArray[i].posY, size)) {
                        bArray.splice(i, 1);
                    }
                }
            }
        }
    }

    /* END MOVING PART */

    /* DIRECTION PART */

    function getDirection(nav) {
        var direction = [0, 0],
            enemyStep = $.Units.enemy.step;
        switch (nav) {
        case '1':
            direction[1] = -enemyStep;
            break;
        case '2':
            direction[0] = enemyStep;
            break;
        case '3':
            direction[1] = enemyStep;
            break;
        case '4':
            direction[0] = -enemyStep;
            break;
        }
        return direction;
    }

    function convertSpriteCoordsToDirection(spriteCoords) {
        var direction;
        switch (spriteCoords) {
        case 0:
            direction = '1';
            break;
        case 80:
            direction = '2';
            break;
        case 160:
            direction = '3';
            break;
        case 240:
            direction = '4';
            break;
        }
        return direction;
    }

    function getBulletDirectionSprite(nav) {
        var direction;
        switch (nav) {
        case '1':
            direction = 60;
            break;
        case '2':
            direction = 40;
            break;
        case '3':
            direction = 0;
            break;
        case '4':
            direction = 20;
            break;
        }
        return direction;
    }

    /* END DIRECTION PART */

    /* MANIPULATE PART */

    function handler(event) {
        var KEY_CODE = {
            LEFT: 37,
            DOWN: 38,
            RIGHT: 39,
            UP: 40,
            SPACE: 32
        },
            step = $.Units.player.step;
        switch (event.keyCode) {
        case KEY_CODE.LEFT:
            $.Units.player.sprite = 240;
            movePlayer($, -step, 0);
            break;
        case KEY_CODE.UP:
            $.Units.player.sprite = 160;
            movePlayer($, 0, step);
            break;
        case KEY_CODE.RIGHT:
            $.Units.player.sprite = 80;
            movePlayer($, step, 0);
            break;
        case KEY_CODE.DOWN:
            $.Units.player.sprite = 0;
            movePlayer($, 0, -step);
            break;
        }
    }

    function spaceHandler(event) {
        var player = $.Units.player;
        switch (event.keyCode) {
        case 32:
            if (player.isRecharging === false) {
                player.isRecharging = true;
                $.DOM.mark.style.width = '1px';
                setFireBall($);
            }
            break;
        }
    }

    /* END MANIPULATE PART */

    /* COLLISION PART */

    function checkUnitCollision($, unit, deltaX, deltaY) {
        var player = unit,
            width = $.Location.size,
            cell = $.Location.cell,
            boolCanMove = false,
            destPosX,
            destPosY;
        if (deltaX > 0) {
            if (player.posX < (width - cell)) {
                boolCanMove = true;
            }
        } else if (deltaX < 0) {
            if (player.posX > 0) {
                boolCanMove = true;
            }
        }
        if (deltaY > 0) {
            if (player.posY < (width - cell)) {
                boolCanMove = true;
            }
        } else if (deltaY < 0) {
            if (player.posY > 0) {
                boolCanMove = true;
            }
        }
        if (boolCanMove === true) {
            destPosX = player.posX + deltaX;
            destPosY = player.posY + deltaY;
            boolCanMove = checkWallsCollision(destPosX, destPosY, player.size);
        }
        return boolCanMove;
    }

    function checkObjectsCollision(objA, objB) {
        var collision = false,
            sizeA = objA.size,
            sizeB = objB.size;
        if ((objA.posX > objB.posX && objA.posX < objB.posX + sizeB) ||
            (objA.posX + sizeA > objB.posX && objA.posX + sizeA < objB.posX + sizeB) ||
            ((objA.posX === objB.posX))) {
            if ((objA.posY > objB.posY && objA.posY < objB.posY + sizeB) ||
                (objA.posY + sizeA > objB.posY && objA.posY + sizeA < objB.posY + sizeB) ||
                ((objA.posY === objB.posY))) {
                collision = true;
            }
        }
        return collision;
    }

    function checkWallsCollision(x, y, size) {
        var array = $.Location.map,
            length = array.length,
            i,
            canMove = true,
            cell = $.Location.cell,
            coordWallX1,
            coordWallY1,
            coordWallX2,
            coordWallY2;
        for (i = 0; i < length; i = i + 1) {
            coordWallX1 = array[i][0] * cell;
            coordWallY1 = array[i][1] * cell;
            coordWallX2 = (array[i][0] * cell) + cell;
            coordWallY2 = (array[i][1] * cell) + cell;

            if ((x > coordWallX1 && x < coordWallX2) ||
                (x + size > coordWallX1 && x + size < coordWallX2) ||
                ((x === coordWallX1))) {
                if ((y > coordWallY1 && y < coordWallY2) ||
                    (y + size > coordWallY1 && y + size < coordWallY2) ||
                    ((y === coordWallY1))) {
                    canMove = false;
                }
            }
        }
        return canMove;
    }

    function checkCrystalCollision(x, y, size) {
        var array = $.Location.crystalsArray,
            length = array.length,
            i,
            cell = $.Location.cell,
            winMsg = $.DOM.winMsg,
            winDialog,
            cristals = $.DOM.crystals,
            coordWallX1,
            coordWallY1,
            coordWallX2,
            coordWallY2;
        if (length) {
            for (i = 0; i < length; i = i + 1) {
                if (array[i]) {
                    coordWallX1 = array[i][0] * cell;
                    coordWallY1 = array[i][1] * cell;
                    coordWallX2 = (array[i][0] * cell) + cell;
                    coordWallY2 = (array[i][1] * cell) + cell;

                    if ((x > coordWallX1 && x < coordWallX2) ||
                        (x + size > coordWallX1 && x + size < coordWallX2) ||
                        ((x === coordWallX1))) {
                        if ((y > coordWallY1 && y < coordWallY2) ||
                            (y + size > coordWallY1 && y + size < coordWallY2) ||
                            ((y === coordWallY1))) {
                            $.Units.player.mineralSound.play();
                            array.splice(i, 1);
                            cristals.textContent = parseInt(cristals.textContent, 10) + 1;
                        }
                    }
                }
            }
        } else {
            $.PauseGame = true;
            $.DOM.status.textContent = winMsg;
            winDialog = document.getElementById('WinDialog');
            winDialog.style.display = 'block';
        }
    }

    /* END COLLISION PART */

    /* RENDER PART */

    function renderMap() {
        var ctx = $.Canvas.ctx,
            step = $.BackGround.speed,
            width = $.Location.size,
            bg1 = $.BackGround.img1,
            bg2 = $.BackGround.img2,
            wall = $.Location.wall,
            map = $.Location.map,
            length = map.length,
            crystal = $.Location.crystal,
            crystals = $.Location.crystalsArray,
            crystalLength = crystals.length,
            cell = $.Location.cell,
            i,
            coord1,
            coord2;
        $.BackGround.coord1 = $.BackGround.coord1 - step;
        $.BackGround.coord2 = $.BackGround.coord2 - step;
        coord1 = $.BackGround.coord1;
        coord2 = $.BackGround.coord2;
        if (coord1 < -width) {
            $.BackGround.coord1 = width;
        }
        if (coord2 < -width) {
            $.BackGround.coord2 = width;
        }
        ctx.drawImage(bg1, 0, 0, width, width, coord1, 0, width, width);
        ctx.drawImage(bg2, 0, 0, width, width, coord2, 0, width, width);

        for (i = 0; i < length; i++) {
            ctx.drawImage(wall, (map[i][0] * cell), (map[i][1] * cell), cell, cell);
        }

        for (i = 0; i < crystalLength; i++) {
            ctx.drawImage(crystal, (crystals[i][0] * cell), (crystals[i][1] * cell), cell, cell);
        }
    }

    function renderUnit(unit) {
        var img = unit.img,
            sprite = unit.sprite,
            ctx = $.Canvas.ctx,
            cell = $.Location.cell;
        ctx.drawImage(img, sprite, 0, cell, cell, unit.posX, unit.posY, cell, cell);
    }

    function renderBullets() {
        var length = $.BulletsArray.length,
            i;
        if (length > 0) {
            for (i = 0; i < length; i = i + 1) {
                if ($.BulletsArray[i]) {
                    renderBullet($.BulletsArray[i]);
                }
            }
        }
    }

    function renderBangs() {
        var arr = $.BangArray,
            length = arr.length,
            ctx = $.Canvas.ctx,
            posX,
            posY,
            cell = $.Location.cell,
            i;
        if (length > 0) {
            for (i = 0; i < length; i = i + 1) {
                if (arr[i]) {
                    posX = arr[i].posX;
                    posY = arr[i].posY;
                    ctx.drawImage(arr[i].img, arr[i].sprite, 0, cell, cell, posX, posY, cell, cell);
                    arr[i].currPause = arr[i].currPause + 1;
                    if (arr[i].pause < arr[i].currPause) {
                        arr[i].sprite = arr[i].sprite + 80;
                        arr[i].currPause = 0;
                        if (arr[i].sprite > 640) {
                            arr.splice(i, 1);
                        }
                    }
                }
            }
        }
    }

    function renderShipBang() {
        var bang = $.Units.bangBattleCruiser,
            size = bang.size,
            ctx = $.Canvas.ctx;
        ctx.drawImage(bang.img, bang.sprite, 0, size, size, bang.posX, bang.posY, size, size);
        bang.currPause = bang.currPause + 1;
        if (bang.pause < bang.currPause) {
            bang.sprite = bang.sprite + 80;
            if (bang.sprite > 1040) {
                bang.sprite = 0;
            }
            bang.currPause = 0;
        }
    }

    function renderBullet(bullet) {
        var img = bullet.img,
            spriteX = bullet.spriteX,
            spriteY = bullet.spriteY,
            ctx = $.Canvas.ctx;
        ctx.drawImage(img, spriteX, spriteY, 20, 20, bullet.posX, bullet.posY, 20, 20);
        bullet.spriteX = bullet.spriteX + bullet.size;
        bullet.pause = bullet.pause + 1;
        if (bullet.spriteX > 60) {
            bullet.spriteX = 0;
        }
    }

    /* END RENDER PART */

})(MyApp);