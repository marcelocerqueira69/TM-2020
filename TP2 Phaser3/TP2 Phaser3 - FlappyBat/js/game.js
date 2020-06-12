
const configurations = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    parent: 'canvas',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const assets = {
    bat: {
        red: 'bat-red',
        yellow: 'bat-yellow',
        blue: 'bat-blue'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bo'
            }
        }
    },
    scene: {
        width: 144,
        background: {
            day: 'background-day',
            night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button',
        messageInitial: 'message-initial'
    },
    scoreboard: {
        width: 25,
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        bat: {
            red: {
                clapWings: 'red-clap-wings',
                stop: 'red-stop'
            },
            blue: {
                clapWings: 'blue-clap-wings',
                stop: 'blue-stop'
            },
            yellow: {
                clapWings: 'yellow-clap-wings',
                stop: 'yellow-stop'
            }
        },
        ground: {
            moving: 'moving-ground',
            stop: 'stop-ground'
        }
    }
}

// Game
const game = new Phaser.Game(configurations)

let gameOver
let gameStarted
let upButton
let restartButton
let gameOverBanner
let messageInitial

// Bat
let player
let batName
let framesMoveUp

// Background
let backgroundDay
let backgroundNight
let ground
let groundDay

// pipes
let pipesGroup
let gapsGroup
let nextPipes
let currentPipe

// score variables
let scoreboardGroup
let score

function preload() {
    //Sounds
	this.load.audio('begin', 'assets/audio/begin.mp3');
    this.load.audio('game_over', 'assets/audio/game_over.wav');
    this.load.audio('point', 'assets/audio/point.wav');
    this.load.audio('flap', 'assets/audio/flap.mp3');

    // Backgrounds and ground
    this.load.image(assets.scene.background.day, 'assets/background-day.png')
    this.load.image(assets.scene.background.night, 'assets/background-night.png')
    this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
        frameWidth: 336,
        frameHeight: 112
    })

    // Pipes
    this.load.image(assets.obstacle.pipe.green.top, 'assets/pipe-green-top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets/pipe-green-bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, 'assets/pipe-red-top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets/pipe-red-bottom.png')

    // Start game
    this.load.image(assets.scene.messageInitial, 'assets/message-initial.png')

    // End game
    this.load.image(assets.scene.gameOver, 'assets/gameover.png')
    this.load.image(assets.scene.restart, 'assets/restart-button.png')

    // bats
    this.load.spritesheet(assets.bat.red, 'assets/bat-red-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bat.blue, 'assets/bat-blue-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bat.yellow, 'assets/bat-yellow-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image(assets.scoreboard.number0, 'assets/number0.png')
    this.load.image(assets.scoreboard.number1, 'assets/number1.png')
    this.load.image(assets.scoreboard.number2, 'assets/number2.png')
    this.load.image(assets.scoreboard.number3, 'assets/number3.png')
    this.load.image(assets.scoreboard.number4, 'assets/number4.png')
    this.load.image(assets.scoreboard.number5, 'assets/number5.png')
    this.load.image(assets.scoreboard.number6, 'assets/number6.png')
    this.load.image(assets.scoreboard.number7, 'assets/number7.png')
    this.load.image(assets.scoreboard.number8, 'assets/number8.png')
    this.load.image(assets.scoreboard.number9, 'assets/number9.png')
}

function create() {
	//Sounds
	this.begin = this.sound.add('begin');
    this.game_over = this.sound.add('game_over');
    this.point = this.sound.add('point');
    this.flap = this.sound.add('flap');

    //Background
    backgroundDay = this.add.image(assets.scene.width, 256, assets.scene.background.day).setInteractive()
    backgroundDay.on('pointerdown', movebat)
    backgroundNight = this.add.image(assets.scene.width, 256, assets.scene.background.night).setInteractive()
    backgroundNight.visible = false
    backgroundNight.on('pointerdown', movebat)

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    ground = this.physics.add.sprite(assets.scene.width, 458, assets.scene.ground)
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)

    messageInitial = this.add.image(assets.scene.width, 156, assets.scene.messageInitial)
    messageInitial.setDepth(30)
    messageInitial.visible = false

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)


    // Ground animations
    this.anims.create({
        key: assets.animation.ground.moving,
        frames: this.anims.generateFrameNumbers(assets.scene.ground, {
            start: 0,
            end: 2
        }),
        frameRate: 15,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.ground.stop,
        frames: [{
            key: assets.scene.ground,
            frame: 0
        }],
        frameRate: 20
    })

    // Red bat Animations
    this.anims.create({
        key: assets.animation.bat.red.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bat.red, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bat.red.stop,
        frames: [{
            key: assets.bat.red,
            frame: 1
        }],
        frameRate: 20
    })

    // Blue bat animations
    this.anims.create({
        key: assets.animation.bat.blue.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bat.blue, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bat.blue.stop,
        frames: [{
            key: assets.bat.blue,
            frame: 1
        }],
        frameRate: 20
    })

    // Yellow bat animations
    this.anims.create({
        key: assets.animation.bat.yellow.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bat.yellow, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bat.yellow.stop,
        frames: [{
            key: assets.bat.yellow,
            frame: 1
        }],
        frameRate: 20
    })

    prepareGame(this)

    gameOverBanner = this.add.image(assets.scene.width, 206, assets.scene.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(assets.scene.width, 300, assets.scene.restart).setInteractive()
    restartButton.on('pointerdown', restartGame)
    restartButton.setDepth(20)
    restartButton.visible = false

}

function update() {

    if (gameOver || !gameStarted)
        return

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (Phaser.Input.Keyboard.JustDown(upButton))
        movebat()
        // this.flap.play();
    else {
        player.setVelocityY(120)

        if (player.angle < 90)
            player.angle += 1
    }

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    })

    gapsGroup.children.iterate(function (child) {
        child.body.setVelocityX(-100)
    })

    nextPipes++
    if (nextPipes === 130) {
        makePipes(game.scene.scenes[0])
        nextPipes = 0
    }
}

function hitbat(player) {

    this.cameras.main.shake(300);
    this.physics.pause()
    //play gameover sound
    this.game_over.play();

    gameOver = true
    gameStarted = false

    player.anims.play(getAnimationbat(batName).stop)
    ground.anims.play(assets.animation.ground.stop)

    gameOverBanner.visible = true
    restartButton.visible = true
}

function updateScore(_, gap) {
    score++
    gap.destroy()

    //change background when reach 10 points
    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible
        //backgroundNight.visible = !backgroundNight.visible
        //groundDay.visible = !ground.visible

        if (currentPipe === assets.obstacle.pipe.green)
            currentPipe = assets.obstacle.pipe.red
        else
            currentPipe = assets.obstacle.pipe.green
    }

    //play point sound
    this.point.play();
    //update score
    updateScoreboard()
}

function makePipes(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-120, 120)

    const gap = scene.add.line(288, pipeTopY + 210, 0, 0, 0, 98)
    gapsGroup.add(gap)
    gap.body.allowGravity = false
    gap.visible = false

    const pipeTop = pipesGroup.create(288, pipeTopY, currentPipe.top)
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(288, pipeTopY + 420, currentPipe.bottom)
    pipeBottom.body.allowGravity = false
}

function movebat() {
    if (gameOver)
        return

    if (!gameStarted)
        startGame(game.scene.scenes[0])

    player.setVelocityY(-400)
    player.angle = -15
    framesMoveUp = 5
}

function getRandombat() {
    switch (Phaser.Math.Between(0, 2)) {
        case 0:
            return assets.bat.red
        case 1:
            return assets.bat.blue
        case 2:
        default:
            return assets.bat.yellow
    }
}

function getAnimationbat(batColor) {
    switch (batColor) {
        case assets.bat.red:
            return assets.animation.bat.red
        case assets.bat.blue:
            return assets.animation.bat.blue
        case assets.bat.yellow:
        default:
            return assets.animation.bat.yellow
    }
}

function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = assets.scene.width - ((score.toString().length * assets.scoreboard.width) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += assets.scoreboard.width
        }
    }
}

function restartGame() {
    pipesGroup.clear(true, true)
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false
    restartButton.visible = false

    const gameScene = game.scene.scenes[0]
    prepareGame(gameScene)

    gameScene.physics.resume()
}

function prepareGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
    currentPipe = assets.obstacle.pipe.green
    score = 0
    gameOver = false
    backgroundDay.visible = true
    backgroundNight.visible = false
    messageInitial.visible = true

    batName = getRandombat()
    player = scene.physics.add.sprite(60, 265, batName)
    player.setCollideWorldBounds(true)
    player.anims.play(getAnimationbat(batName).clapWings, true)
    player.body.allowGravity = false

    scene.physics.add.collider(player, ground, hitbat, null, scene)
    scene.physics.add.collider(player, pipesGroup, hitbat, null, scene)

    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)

    ground.anims.play(assets.animation.ground.moving, true)
}

function startGame(scene) {
    gameStarted = true
    messageInitial.visible = false

    const score0 = scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.number0)
    score0.setDepth(20)

    makePipes(scene)
}