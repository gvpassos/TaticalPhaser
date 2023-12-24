import { PlayerCenario } from "./playerCenario.js";
import { pathFinder } from "../controles/pathFinder.js"
import { criarInteracoes } from "./interaçoes.js";
import { controladorInteracoes, activeInteracoes, manager, ataqueInteracao } from "../controles/manager.js";
import { addBotoes } from "../interface/menus.js";

export class Cenario extends Phaser.Scene {
    constructor(config, mapa) {
        super("Cenario");
        this.id = "Cenario";
        this.Config = config;
        this.mapaKey = mapa;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32 });

        this.load.tilemapTiledJSON(`${this.mapaKey}`, `data/json/${this.mapaKey}.json`);

        this.load.spritesheet('player', 'data/player/playerSprite.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('ataqueMelee', 'data/tileds/ataqueMelee.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ataqueSpear', 'data/tileds/ataqueSpear.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ataqueArrow', 'data/tileds/ataqueArrow.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('monstro1', 'data/npc/monstro/monstro1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('monstro2', 'data/npc/monstro/monstro2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('monstro3', 'data/npc/vendedor/vendedorhomem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano1', 'data/npc/vendedor/mercadonegro.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano3', 'data/npc/vendedor/vendedorMulher.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('estante', 'data/tileds/estante.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('mesaCentral', 'data/tileds/mesaCentral.png', { frameWidth: 128, frameHeight: 256 });
        this.load.spritesheet('bau', 'data/tileds/bau.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('porta', 'data/tileds/portaMadeira.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('cama', 'data/tileds/cama.png', { frameWidth: 32, frameHeight: 96 });
        this.load.spritesheet('janela', 'data/tileds/janela.png', { frameWidth: 27, frameHeight: 42 });


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

        //* interações */
        this.interacoes = map.getObjectLayer("interacoes");

        /* PLAYER CREATION */
        let x = 23 * 32;
        let y = 42 * 32;
        if (this.ultimoMapa) {
            for (let i = 0; i < this.interacoes.objects.length; i++) {
                const element = this.interacoes.objects[i];
                if (element.name == 'playerPoint') {
                    if (element.properties.find(el => el.name == "mapa")['value'] == this.ultimoMapa[0]) {
                        if (element.properties.some(el => el.name == "spawnNumber")) {
                            if (element.properties.find(el => el.name == "spawnNumber")['value'] == this.ultimoMapa[1]) {
                                x = element.x;
                                y = element.y;
                                console.log(element)
                            }
                        } else {
                            x = element.x;
                            y = element.y;
                        }
                    }
                }
            }
        } else if (this.ultimoMapa) {
            if (localStorage.getItem("playerPos")) {
                let playerPos = JSON.parse(localStorage.getItem("playerPos"));
                x = playerPos.x;
                y = playerPos.y;
            }
        }

        this.player = new PlayerCenario({
            scene: this,
            x: x,
            y: y,
            name: "player"
        })

        this.cameras.main.startFollow(this.player);
        this.onMove = false;

        //last map

        map.createLayer('detalhes', tileset, 0, 0)
        this.Objs = criarInteracoes(this, this.interacoes.objects);
        /* COLISIONS */

        this.physics.add.collider(this.player, this.groundLayer); /// PLAYER X MAPA
        this.physics.add.collider(this.Objs, this.groundLayer); /// NPC x MAPA 
        this.physics.add.overlap(this.player, this.Objs,
            (player, objeto) => {
                controladorInteracoes(objeto, this);
            }
        ); /// PLAYER x OBJS
        this.physics.add.overlap(this.player.interact, this.Objs, (player, objeto) => {
            this.player.interactTigger = () => {
                activeInteracoes(this.player, objeto, this)
            };
            this.player.interact.body.touching.none = false;
        });/// PLAYER x OBJS Interacao com o botao
        this.physics.add.collider(this.player.projectiles, this.Objs, (player, objeto) => {
            ataqueInteracao(player, objeto, this)
            //this.player.projectiles.body.touching.none = false;
        }); /// PLAYER ATACANDO INIMIGO 
        this.physics.add.collider(this.player.projectiles, this.groundLayer, (ataque, objeto) => {
            //ataqueInteracao(player, objeto, this)
            //ataque.destroy();
        });// PROJETEIS e MAPA
        /* BOTOES */

        addBotoes(this);

        //fim da criação
        manager.QuestVerificator({ mapakey: this.mapaKey }, this)

    }
    onLayerClick(pointer) {
        let path = pathFinder(
            this.player,
            { x: pointer.worldX, y: pointer.worldY },
            this.groundLayer, this.interacoes.objects
        )
        this.onMove = this.player.move(path, this.onMove, false);
    }

    update(time,delta) {
        this.player.update(time,delta)
        this.Objs.forEach(element => {
            if (element.update) element.update()
        });

    }
   
}

