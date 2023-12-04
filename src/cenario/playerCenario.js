import { ITEMS } from "../interface/item.js";

export class PlayerCenario extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.name);
        //You can either do this:
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.body.onWorldBounds = true;
        this.body.setSize(30, 30);
        this.target = { x: 0, y: 0 };

        this.name = config.name
        this.graphics = this.scene.add.graphics();
        this.travaAndar = false;

        config.scene.input.keyboard.on('keydown', (input) => {
            if (this.tecladoMove[input.key]) this.tecladoMove[input.key](800);
        })
        config.scene.input.keyboard.on('keyup', (input) => {
            if (this.tecladoMove[input.key]) this.tecladoMove[input.key](0);
        })

        this.projectiles = config.scene.physics.add.group();
        this.animacoes();

        this.interact = config.scene.add.sprite(0, 0, 'interact');
        this.interact.setAlpha(0);
        this.interact.setOrigin(0, 0);

        config.scene.physics.add.existing(this.interact);
        this.interact.body.setSize(64, 64);

        this.posicaoPlayer = "up";

    }
    move(path, mover, onFinish) {

        const color = 0x000050;
        const lineWidth = 5;

        for (let i = 0; i < path.length; i++) {
            path[i].x = path[i].x * 32;
            path[i].y = path[i].y * 32;
            path[i].duration = 20;
            path[i].onStart = () => {
                this.ultimaPos = { x: this.x, y: this.y };
                const proximaPos = i < path.length - 1 ? path[i + 1] : path[i];
                if (proximaPos.x > path[i].x) {
                    if (this.anims.currentAnim.key != 'right') this.play('right');
                    if (!this.anims.isPlaying) this.play('right');
                } else if (proximaPos.x < path[i].x) {
                    if (this.anims.currentAnim.key != 'left') this.play('left');
                    if (!this.anims.isPlaying) this.play('left');
                } else if (proximaPos.y > path[i].y) {
                    if (this.anims.currentAnim.key != 'down') this.play('down');
                    if (!this.anims.isPlaying) this.play('down');
                } else if (proximaPos.y < path[i].y) {
                    if (this.anims.currentAnim.key != 'up') this.play('up');
                    if (!this.anims.isPlaying) this.play('up');
                } else {
                    this.stop();
                }

            }

        }

        this.scene = this.scene;
        if (mover) {
            mover.stop();
            this.graphics.clear();
        }
        this.graphics.lineStyle(lineWidth, color);
        this.graphics.strokeRect(path[path.length - 1].x, path[path.length - 1].y, 32, 32);


        if (onFinish && path.length > 1) path.pop();
        this.tweens = this.scene.tweens.chain({
            targets: this,
            tweens: path,
            onComplete: () => {
                this.graphics.clear();
                if (onFinish) onFinish();
            },
        });
        return this.tween;
    }

    tecladoMove = {
        "ArrowRight": (speed) => {
            this.body.setVelocityX(speed);
            this.posicaoPlayer = "right";
            if (this.anims.currentAnim.key != 'right' && speed > 0) this.play('right');
            else if (!this.anims.isPlaying && speed > 0) this.play('right');
            else if (speed == 0) this.anims.stop();

        },
        "ArrowLeft": (speed) => {
            this.body.setVelocityX(-speed);
            this.posicaoPlayer = "left";
            if (this.anims.currentAnim.key != 'left' && speed > 0) this.play('left');
            else if (!this.anims.isPlaying && speed > 0) this.play('left');
            else if (speed == 0) this.anims.stop();
        },
        "ArrowUp": (speed) => {
            this.body.setVelocityY(-speed);
            this.posicaoPlayer = "up";
            if (this.anims.currentAnim.key != 'up' && speed > 0) this.play('up');
            else if (!this.anims.isPlaying && speed > 0) this.play('up');
            else if (speed == 0) this.anims.stop();
        },
        "ArrowDown": (speed) => {
            this.body.setVelocityY(speed);
            this.posicaoPlayer = "down";
            if (this.anims.currentAnim.key != 'down' && speed > 0) this.play('down');
            else if (!this.anims.isPlaying && speed > 0) this.play('down');
            else if (speed == 0) this.anims.stop();
        },
        "x": (speed) => {
            if (speed == 0) {
                if (this.interact.body.touching.none) {
                    this.atacar();
                } else {
                    this.interactTigger();
                }
            }
        }
    }

    joystickMove(joyStick) {
        let cursorKeys = joyStick.createCursorKeys();
        for (let name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                this.joyStickMove[name](600);
                break;

            }
        }

        if (joyStick.angle == 0) {
            this.body.setVelocity(0);
            this.anims.stop();
        }

    }
    joyStickMove = {
        "right": this.tecladoMove["ArrowRight"],
        "left": this.tecladoMove["ArrowLeft"],
        "up": this.tecladoMove["ArrowUp"],
        "down": this.tecladoMove["ArrowDown"],
        "x": this.tecladoMove["x"]
    }

    stopTween(objInteracted) {
        this.graphics.clear();
        if (this.tweens) {
            this.tweens.stop();
            this.anims.stop();
        }
        if (this.y <= objInteracted.y + objInteracted.height && this.y >= objInteracted.y) {
            if (this.x > objInteracted.x)
                this.x = objInteracted.x + objInteracted.width;
            if (this.x < objInteracted.x)
                this.x = objInteracted.x - this.width;
        }

        if (this.x <= objInteracted.x + objInteracted.width && this.x >= objInteracted.x) {
            if (this.y > objInteracted.y)
                this.y = objInteracted.y + objInteracted.height;
            if (this.y < objInteracted.y)
                this.y = objInteracted.y - this.height;
        }
    }

    atacar() {
        let typeAnims = "ataqueMelee"
        if (this.scene.Config.players[this.scene.Config.playerActive].equip['weapon']) {
            const arma = ITEMS[this.scene.Config.players[this.scene.Config.playerActive].equip['weapon']]
            typeAnims = "ataque"+  arma.anim
        }

        const tipoAtaque = this.posicaoPlayer + "Melee";
        if (this.anims.currentAnim.key != tipoAtaque) this.play(tipoAtaque);
        else if (!this.anims.isPlaying) this.play(tipoAtaque)

        let ataqueposX = this.x;
        let angle = this.angle;
        if (this.posicaoPlayer == "left") {
            ataqueposX -= 32;
            angle = 270;
        }
        if (this.posicaoPlayer == "right") {
            ataqueposX += 32;
            angle = 90;
        }
        let ataqueposY = this.y;
        if (this.posicaoPlayer == "up")
            ataqueposY -= 32;
        if (this.posicaoPlayer == "down") {
            ataqueposY += 32;
            angle = 180;
        }

        const projectile = this.projectiles.create(ataqueposX, ataqueposY, typeAnims);
        projectile.angle = angle;
        projectile.setScale(2)
        projectile.anims.create({
            key: typeAnims,
            frames: this.anims.generateFrameNumbers(typeAnims, { frames: [0, 1, 2, 3, 4, 5, 6] }),
            frameRate: 18,
        })
        projectile.on('animationcomplete-'+typeAnims, function () {
            projectile.destroy();
        }, this);

        projectile.play(typeAnims);

    }

    receberDano(total, angle) {
        angle = Math.abs(angle)

        if (angle > 45 && angle <= 135) {
            this.body.setVelocityY(-100);
        }
        else if (angle > 135 && angle <= 225) {
            this.body.setVelocityX(-500);
        }
        else if (angle > 225 && angle <= 315) {
            this.body.setVelocityY(100);
        }
        else {
            this.body.setVelocityX(100);
        }

        setTimeout(()=>{ this.body.setVelocity(0,0);},300)

        if (this.scene.Config.players[this.scene.Config.playerActive].stats['vida'] > 0)
            this.scene.Config.players[this.scene.Config.playerActive].stats['vida'] -= total;
    }
    update() {
        this.interact.x = this.x - 16;
        this.interact.y = this.y - 16;
    }

    animacoes() {
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [104, 105, 106, 107, 108, 109, 110, 111, 112] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [130, 131, 132, 133, 134, 135, 136, 137, 138] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [117, 118, 119, 120, 121, 122, 123, 124, 125] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [143, 144, 145, 146, 147, 148, 149, 150, 151] }),
            frameRate: 18,
            repeat: -1
        })
        this.anims.create({
            key: 'upMelee',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [156, 157, 158, 159, 160, 161, 104] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'downMelee',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [182, 183, 184, 185, 186, 187, 130] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'rightMelee',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [195, 196, 197, 198, 199, 200, 143] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'leftMelee',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [169, 170, 171, 172, 173, 174, 117] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'atacarMagic',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [143, 144, 145, 146, 147, 148, 149, 150, 151] }),
            frameRate: 18,
            repeat: -1
        })
        this.play('up');
        this.anims.stop()
    }
}