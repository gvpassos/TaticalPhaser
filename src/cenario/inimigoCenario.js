import { pathFinder } from "../controles/pathFinder.js";

export class InimigoCenario extends Phaser.Physics.Arcade.Sprite {
    constructor(data, scene) {
        const spriteName = data.properties.find(el => el.name == "sprite")['value'];//Nome da imagem 
        const health = data.properties.find(el => el.name == "health")['value'];/// quantidade de Vida
        const tipo = data.properties.find(el => el.name == "tipo")['value'];// tipo de inimigo 
        const damage = data.properties.find(el => el.name == "damage") ?
            data.properties.find(el => el.name == "damage")['value'] :
            1 ;// tipo de inimigo 

        super(scene, data.x, data.y, spriteName);
        scene.add.existing(this);
        scene.physics.add.existing(this);


        this.setOrigin(0, 0);
        this.name = 'inimigo';
        this.id = data.id;
        this.idle = [];
        this.tipo = tipo
        this.health = health;
        this.danoInimigo = damage;

        this.animacoes(spriteName);

        if (data.polygon) { // se o Inimigo possuir uma rota crie a rotina
            //gerar a rota
            data.polygon.forEach((laco, ind) => {
                const dist = ind > 0 ?
                    Phaser.Math.Distance.BetweenPoints(laco, data.polygon[ind - 1]) :
                    Phaser.Math.Distance.BetweenPoints(laco, data.polygon[data.polygon.length - 1]);
                let angulo = ind > 0 ?
                    Phaser.Math.Angle.Between(data.polygon[ind - 1].x, data.polygon[ind - 1].y, laco.x, laco.y,) :
                    Phaser.Math.Angle.Between(data.polygon[data.polygon.length - 1].x, data.polygon[data.polygon.length - 1].y, laco.x, laco.y,);

                angulo = Phaser.Math.RadToDeg(angulo);

                this.idle.push({
                    x: laco.x + data.x,
                    y: laco.y + data.y,
                    duration: dist * 15,
                    onActive: () => {
                        this.angulo = angulo
                        this.rodarAnimacao(angulo);
                    },
                })

            });

            //gerar o LOOP
            this.track = false;
            this.tween = !this.tween ? scene.tweens.chain({
                targets: this,
                tweens: this.idle,
                loop: -1,
            }) : scene.tweens.restart();
        }


    }

    followPlayer() {
        this.track = true;
        const path = pathFinder(this, this.scene.player, this.scene.groundLayer, []);
        if (path == null) {
            this.tween.stop();
            this.track = false;
            this.retorno();
            return;
        }
        path.forEach((laco, ind) => {
            laco.x = laco.x * 32;
            laco.y = laco.y * 32;
            laco.duration = 200;
            let angulo = ind > 0 ?
                Phaser.Math.Angle.Between(path[ind - 1].x, path[ind - 1].y, laco.x, laco.y) :
                Phaser.Math.Angle.Between(path[path.length - 1].x, path[path.length - 1].y, laco.x, laco.y,);
            angulo = Phaser.Math.RadToDeg(angulo);
            laco.onActive = () => {
                this.rodarAnimacao(angulo);
            }
        });
        this.tween = this.scene.tweens.chain({
            targets: this,
            tweens: path,
            onComplete: () => {
                const distancia = Phaser.Math.Distance.BetweenPoints(this, scene.player);
                if (distancia > 350) {
                    this.tween.stop();
                    this.track = false;
                    this.retorno();
                } else {
                    this.followPlayer();
                }
            },
        });
    }

    animacoes(spriteName) {
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [104, 105, 106, 107, 108, 109, 110, 111, 112] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [130, 131, 132, 133, 134, 135, 136, 137, 138] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [117, 118, 119, 120, 121, 122, 123, 124, 125] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [143, 144, 145, 146, 147, 148, 149, 150, 151] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'attacked',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [260, 261, 262, 263, 264, 265] }),
            frameRate: 8,
        })
        this.anims.create({
            key: 'upMelee',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [156, 157, 158, 159, 160, 161, 104] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'downMelee',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [182, 183, 184, 185, 186, 187, 130] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'rightMelee',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [195, 196, 197, 198, 199, 200, 143] }),
            frameRate: 18,
            repeat: 0
        });
        this.anims.create({
            key: 'leftMelee',
            frames: this.anims.generateFrameNumbers(spriteName, { frames: [169, 170, 171, 172, 173, 174, 117] }),
            frameRate: 18,
            repeat: 0
        });
        this.play('up');
        this.stop();
    }
    rodarAnimacao(angulo) {
        try {
            if (angulo == 0) {
                if (this.anims.currentAnim.key != 'right') this.play('right');
                if (!this.anims.isPlaying) this.play('right');
            } else if (angulo == 180) {
                if (this.anims.currentAnim.key != 'left') this.play('left');
                if (!this.anims.isPlaying) this.play('left');
            } else if (angulo == 90) {
                if (this.anims.currentAnim.key != 'down') this.play('down');
                if (!this.anims.isPlaying) this.play('down');
            } else if (angulo == -90) {
                if (this.anims.currentAnim.key != 'up') this.play('up');
                if (!this.anims.isPlaying) this.play('up');
            }
        } catch (error) {
            console.warn("animacoes error", error)
            return
        }

    }
    retorno() {
        const path = pathFinder(
            this, this.idle[0],
            scene.groundLayer, []
        );
        path.forEach((laco, ind) => {
            laco.x = laco.x * 32;
            laco.y = laco.y * 32;
            laco.duration = 200;
            let angulo = ind > 0 ?
                Phaser.Math.Angle.Between(path[ind - 1].x, path[ind - 1].y, laco.x, laco.y,) :
                Phaser.Math.Angle.Between(path[path.length - 1].x, path[path.length - 1].y, laco.x, laco.y,);
            angulo = Phaser.Math.RadToDeg(angulo);
            laco.onActive = () => {
                this.rodarAnimacao(angulo);
            }
        });
        if (this.tween) this.tween.stop();
        this.tween = scene.tweens.chain({
            targets: this,
            tweens: path,
            onComplete: () => {
                this.tween = scene.tweens.chain({
                    targets: this,
                    tweens: this.idle,
                    loop: -1
                });
            }
        })

    }
    receberDano(dano, angle) {
        angle = Math.abs(angle);

        this.tween.stop();
        if (angle > 45 && angle <= 135) {
            this.body.setVelocityY(-115)
        }
        else if (angle > 135 && angle <= 225) {
            this.body.setVelocityX(-115)
        }
        else if (angle > 225 && angle <= 315) {
            this.body.setVelocityY(115)
        }
        else {
            this.body.setVelocityX(115)
        }

        if (this.health > 0) this.health -= dano;


        setTimeout(() => {
            this.body.setVelocity(0, 0)
            if (this.health <= 0) {
                this.morte();
            } else {
                this.followPlayer();
            }
        }, 600);

    }
    morte() {
        this.track = true;
        //parar movimento
        this.tween.stop();
        this.stop();
        // animacao de morte 
        this.play("attacked")
        if (this.area) {
            this.area.destroy();
        }

        this.body.enable = false;
    }

    atacarPlayer(angle) {
        this.scene.player.receberDano(this.danoInimigo, angle)
    }
}

/*

switch (data.properties.find(el => el.name == "tipo")['value']) {
    case 'ouvinte':
        const distanciaMaxima = 150;
        inimigo.area = scene.add.circle(0, 0, distanciaMaxima, 0xff0000);
        inimigo.area.setStrokeStyle(1.5, 0xaa0000);
        inimigo.update = () => {
            inimigo.area.x = inimigo.x;
            inimigo.area.y = inimigo.y;

            if (inimigo.track) return;

            const distancia = Phaser.Math.Distance.BetweenPoints(inimigo, scene.player);
            if (inimigo.lastPlayerPos) {
                if (inimigo.lastPlayerPos.x != scene.player.x ||
                    inimigo.lastPlayerPos.y != scene.player.y) {

                    inimigo.track = false;
                    inimigo.lastPlayerPos = false;

                    inimigo.tween.stop();
                    inimigo.followPlayer();

                    inimigo.area.setAlpha(0);
                }

            }
            if (distancia < distanciaMaxima) {
                inimigo.lastPlayerPos = { x: scene.player.x, y: scene.player.y };
                inimigo.area.setAlpha(0.4);
            } else {
                inimigo.lastPlayerPos = false;
                inimigo.area.setAlpha(0.2);
            }


        }
        break;
    case 'observador':
        const visionAngle = 15;
        const visionDistance = 300;
        inimigo.area = scene.add.triangle(200, 200, 0, 0, 300, 80, 300, -80, 0xff0000);
        inimigo.area.setStrokeStyle(1.5, 0xaa0000);
        inimigo.area.setOrigin(0, 0);
        inimigo.area.setAlpha(0.2);
        inimigo.update = () => {
            inimigo.area.x = inimigo.x;
            inimigo.area.y = inimigo.y;
            inimigo.area.angle = inimigo.angulo
            if (inimigo.track) return;
            const directionToPlayer = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y));
            const distanceToPlayer = Phaser.Math.Distance.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);

            if (inimigo.angulo > directionToPlayer - visionAngle &&
                inimigo.angulo < directionToPlayer + visionAngle &&
                distanceToPlayer < visionDistance
            ) {
                const path = findPath(inimigo, scene.player, scene.groundLayer.culledTiles, []);
                if (path) {
                    inimigo.track = false;
                    inimigo.tween.stop();
                    inimigo.followPlayer();
                    inimigo.area.setAlpha(0);
                }
            } else {
                inimigo.area.setAlpha(0.2);
            }
        }
        break;
    case 'vigia':
        const vigiaAngle = 30;
        const vigiaDistance = 0;
        inimigo.area = scene.add.triangle(200, 200, 0, 0, 300, 173, 300, -173, 0xff0000);
        inimigo.area.setStrokeStyle(0.5, 0xaa0000);
        inimigo.area.setOrigin(0, 0);
        inimigo.area.setAlpha(0.2);
        inimigo.update = () => {
            inimigo.area.x = inimigo.x;
            inimigo.area.y = inimigo.y;
            inimigo.area.angle = inimigo.angulo
            if (inimigo.track) this.return
            const directionToPlayer = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y));
            const distanceToPlayer = Phaser.Math.Distance.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);

            if (inimigo.angulo > directionToPlayer - vigiaAngle &&
                inimigo.angulo < directionToPlayer + vigiaAngle &&
                distanceToPlayer < vigiaDistance
            ) {
                const path = findPath(inimigo, scene.player, scene.groundLayer.culledTiles, scene.Objs);
                if (path) {
                    inimigo.track = false;
                    inimigo.tween.stop();
                    inimigo.followPlayer();
                    inimigo.area.setAlpha(0);
                }
            } else {
                inimigo.area.setAlpha(0.2);
            }


        }
        break;

}

*/