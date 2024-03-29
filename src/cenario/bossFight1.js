import { PlayerCenario } from "./playerCenario.js";
import { pathFinder } from "../controles/pathFinder.js"
import { criarInteracoes, inimigoPerseguidor, } from "./interaçoes.js";
import { controladorInteracoes, activeInteracoes, ataqueInteracao, manager } from "../controles/manager.js";
import { addBotoes } from "../interface/menus.js";


export class BossFight extends Phaser.Scene {
    constructor(config, mapa) {
        super("bossFight1");

        this.id = "bossFight1";
        this.Config = config;
        this.mapaKey = "mansao";
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32 });

        this.load.tilemapTiledJSON(`${this.mapaKey}`, `data/json/${this.mapaKey}.json`);

        this.load.spritesheet('player', 'data/player/playerSprite.png', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('monstro1', 'data/npc/monstro/monstro1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('monstro2', 'data/npc/monstro/monstro2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('boss1', 'data/npc/monstro/boss1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('monstro3', 'data/npc/vendedor/vendedorhomem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano1', 'data/npc/vendedor/mercadonegro.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano3', 'data/npc/vendedor/vendedorMulher.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('espada', 'data/player/arminha.png');
        this.load.spritesheet('fullscreen', 'data/ui/fullscreen.png', { frameWidth: 64, frameHeight: 64 });

        this.load.plugin('rexvirtualjoystickplugin', 'src/phaser/rexvirtualjoystickplugin.min.js', true);
        this.load.plugin('rexbuttonplugin', 'src/phaser/rexbuttonplugin.min.js', true);

    }

    create() {
        /* TILES CREATION */
        let map = this.make.tilemap({ key: this.mapaKey, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('Atlas', 'Atlas');
        this.groundLayer = map.createLayer('baixo', tileset, 0, 0)
        if (this.Config.touchMove) {
            this.groundLayer.setInteractive()
            this.groundLayer.on('pointerup', (pointer) => { this.onLayerClick(pointer) }, this);
        }

        map.setCollisionBetween(0, 2);

        if (this.cameras.main.width < 600) {
            this.cameras.main.setZoom(0.5);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        } else if (this.cameras.main.width < 800) {
            this.cameras.main.setZoom(0.7);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        }

        //* interações *//

        this.interacoes = map.getObjectLayer("interacoesForBoss");
        this.ataques = this.interacoes.objects.filter(i => i.name == "ataque");
        this.spawners = this.interacoes.objects.filter(i => i.name == "spawner");
        const boss = this.interacoes.objects.filter(i => i.name == "bossPoint");

        this.monstros = this.add.group();

        /* PLAYER CREATION */

        this.player = new PlayerCenario({
            scene: this,
            x: this.playerSpawn.x,
            y: this.playerSpawn.y,
            name: "player"
        })

        /// BOOSSS /// 
        this.boss = new BossSprite({
            scene: this,
            name: "boss1",
            posAvalibles: boss
        });

        console.log(this.boss)

        this.cameras.main.startFollow(this.player);
        this.onMove = false;

        //last map
        map.createLayer('detalhes', tileset, 0, 0)


        /* COLISIONS */

        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.boss, this.groundLayer);
        this.physics.add.collider(this.player.projectiles, this.monstros, (player, objeto) => {
            //ataqueInteracao(player, objeto, this)
            //this.player.projectiles.body.touching.none = false;

            objeto.destroy();
        });
        this.physics.add.collider(this.player.projectiles, this.boss, (obj1, obj2) => {
            const boss = obj1.name == "inimigo" ? obj1 : obj2;
            const ataque = obj1.name == "inimigo" ? obj2 : obj1;
            ataqueInteracao(boss, ataque, this)


        });
        /* BOTOES */

        addBotoes(this);

        this.spawnMonsters = setInterval(() => {
            const rand = Math.floor(Math.random() * this.spawners.length);

            const mon = inimigoPerseguidor(this, this.spawners[rand])
            mon.goTo();
            this.monstros.add(mon);

        }, 2000);

        map.createLayer('forBoss', tileset, 0, 0);

    }

    update(time, delta) {
        this.player.update(time, delta)
        this.boss.update(this.player)
    }
}

//* boss sprite *//
export class BossSprite extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.posAvalibles[0].x, config.posAvalibles[0].y, config.name);
        //You can either do this:
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.body.onWorldBounds = true;

        this.name = config.name;
        this.allPosition = config.posAvalibles;

        this.animacoes()

        this.health = 10;
        this.name = "inimigo";
        this.estaFugindo = false;
    }

    update(player) {
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distanceToPlayer < 150) {

        }
    }

    moverPara() {
        if (this.estaFugindo) return;

        const player = this.scene.player;
        let novaPos = { x: this.x, y: this.y }
        let maiorDistancia = 0;
        this.allPosition.forEach(pos => {
            const posToPlayer = Phaser.Math.Distance.Between(pos.x, pos.y, player.x, player.y);
            if (maiorDistancia < posToPlayer) {
                maiorDistancia = posToPlayer;
                novaPos = pos;
            }
        });

        let path = pathFinder(this, novaPos, this.scene.groundLayer, []);

        if (path == null) {
            path = pathFinder(this, { x: 768, y: 672 }, this.scene.groundLayer, []);
        }

        path.forEach((laco, ind) => {
            laco.x = laco.x * 32 + 16;
            laco.y = laco.y * 32 + 16;
            laco.duration = 200;
            let angulo = ind > 0 ?
                Phaser.Math.Angle.Between(path[ind - 1].x, path[ind - 1].y, laco.x, laco.y) :
                Phaser.Math.Angle.Between(path[path.length - 1].x, path[path.length - 1].y, laco.x, laco.y,);
            angulo = Phaser.Math.RadToDeg(angulo);

            laco.onStart = () => {
                this.rodarAnimacao(angulo);
                this.estaFugindo = true;
            }
        });
        this.tween = this.scene.tweens.chain({
            targets: this,
            tweens: path,
            onComplete: () => {
                this.estaFugindo = false;
            }
        });
    }

    receberDano(Dano) {
        if (this.health - Dano < 0) {
            this.finalizar()
            return
        }
        this.health -= Dano;
        this.scene.cameras.main.shake(100, 0.01);
        this.moverPara();


    }

    finalizar() {
        clearInterval(this.scene.spawnMonsters);
        this.scene.scene.start('Cenario');
        this.scene.scene.stop();
    }

    animacoes() {
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [192, 193, 194, 195, 196, 197, 198, 199, 200] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [240, 241, 242, 243, 244, 245, 246, 247, 248] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [216, 217, 218, 219, 220, 221, 222, 223, 224] }),
            frameRate: 18,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [264, 265, 266, 267, 268, 269, 270, 271, 272] }),
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
            key: 'upArrow',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220] }),
            frameRate: 18,
        });
        this.anims.create({
            key: 'leftArrow',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233] }),
            frameRate: 18,
        });
        this.anims.create({
            key: 'downArrow',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246] }),
            frameRate: 18,
        })
        this.anims.create({
            key: 'rightArrow',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259] }),
            frameRate: 18,
        })
        this.play('up');
        this.anims.stop()
    }

    rodarAnimacao = (angulo) => {
        if (this.anims == undefined) return;
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
    }


}