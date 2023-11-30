import { PlayerCenario } from "./playerCenario.js"; 
import { pathFinder } from "../controles/pathFinder.js"
import { criarInteracoes } from "./interaçoes.js";
import { controladorInteracoes, activeInteracoes,  manager } from "../controles/manager.js";

export class BossFight extends Phaser.Scene {
    constructor(config,mapa) {
        super("bossFight1");

        this.id = "bossFight1";
        this.Config = config;
        this.mapaKey = "mansao";
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32});
        
        this.load.tilemapTiledJSON(`${this.mapaKey}`, `data/json/${this.mapaKey}.json`);	

        this.load.spritesheet('player', 'data/player/playerSprite.png', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('monstro1', 'data/npc/monstro/monstro1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('monstro2', 'data/npc/monstro/monstro2.png', { frameWidth: 64, frameHeight: 64 });
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
        if(this.Config.touchMove){
            this.groundLayer.setInteractive()
            this.groundLayer.on('pointerup',  (pointer)=>{this.onLayerClick(pointer)} , this);
        }
        
        map.setCollisionBetween(0, 2);        
        
        if(this.cameras.main.width < 600){
            this.cameras.main.setZoom(0.5);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
            
        }else if(this.cameras.main.width < 800){
            this.cameras.main.setZoom(0.7);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        }
        
        //* interações */
        
        this.interacoes = map.getObjectLayer("interacoesForBoss");
        this.ataques = this.interacoes.objects.filter(i =>  i.name == "ataque")

        console.log(this.ataques)
        /* PLAYER CREATION */
        
        this.player = new PlayerCenario({
            scene:this,
            x:this.playerSpawn.x,
            y:this.playerSpawn.y,
            name:"player"
        })
        
        this.cameras.main.startFollow(this.player);
        this.onMove = false;
        
        //last map
        map.createLayer('detalhes', tileset, 0, 0)
        map.createLayer('forBoss',tileset, 0, 0);
        
        /* COLISIONS */
        
        this.physics.add.collider(this.player, this.groundLayer);
      
        /* BOTOES */
        
        this.addBotoes();

        setInterval (function () {  
            const rand = Math.random()*this.ataques.length
        },800);

        
      
    }
  
    update(time,delta) {
        this.player.update()    
        
        

    }


    addBotoes(){
        let w = this.cameras.main.width;
        let h = this.cameras.main.height;

        this.add.sprite(w*0.8, h*0.2, 'espada')
            .setScrollFactor(0, 0)
            .setInteractive()
            .on('pointerup', this.callMenus['playerManager']);
        this.add.circle(w*0.7, h*0.2, 25, 0xff0000)
            .setScrollFactor(0, 0)
            .setInteractive()
            .on('pointerup', this.callMenus['settings'])


        const fullscreenBtn = this.add.image(this.cameras.main.width*0.8, this.cameras.main.height*0.1, 'fullscreen', 0)
        .setInteractive()
        .setScrollFactor(0,0)

        fullscreenBtn.on('pointerup', function ()
        {
            if (this.scale.isFullscreen)
            {
                fullscreenBtn.setFrame(0);
                this.scale.stopFullscreen();
            }
            else
            {
                fullscreenBtn.setFrame(1);
                this.scale.startFullscreen();
            }
        }, this);
        if(!this.Config.touchMove ){
            this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
                x: w*0.12,
                y: h*0.78,
                radius: w*0.08,
                base: this.add.circle(0, 0, 100, 0x888888,0.4).setStrokeStyle(1.5, 0x250000),
                thumb: this.add.circle(0, 0, 50, 0x256480,0.2).setStrokeStyle(1.5, 0xaaaabb),
            })
            this.joyStick.on('update', () => { this.player.joystickMove(this.joyStick) });
            
            const buttonJoystick = this.add.circle(w*0.7, h*0.75, w*0.03, 0xffffff)
            .setScrollFactor(0, 0)

            const button = this.plugins.get('rexbuttonplugin').add(buttonJoystick);
            button.on('down', function (button, gameObject, event) {
                this.player.tecladoMove['x'](1)
            }, this);
            button.on('up', function (button, gameObject, event) {
                this.player.tecladoMove['x'](0)
            }, this);
        }
        
    }

    callMenus = {
        "settings": ()=>{
            this.scene.pause();
            this.scene.manager.scenes.find(el => el.id == 'menuCreator').ui =  "settings";
            this.scene.manager.scenes.find(el => el.id == 'menuCreator').sceneActive =  "bossFight1";
            this.scene.launch('MenuCreator');
        },
        "playerManager": ()=>{
            this.scene.pause();
            this.scene.manager.scenes.find(el => el.id == 'menuCreator').ui =  "playerManager";
            this.scene.manager.scenes.find(el => el.id == 'menuCreator').sceneActive =  "bossFight1";
            this.scene.launch('MenuCreator');
        }

    }
}

