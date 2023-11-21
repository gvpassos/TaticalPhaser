import { PlayerCenario } from "./playerCenario.js"; 
import { pathFinder } from "../controles/pathFinder.js"
import { criarInteracoes } from "./interaçoes.js";
import { controladorInteracoes, activeInteracoes,  manager } from "../controles/manager.js";

export class Cenario extends Phaser.Scene {
    constructor(config,mapa) {
        super("Cenario");
        this.Config = config;
        this.mapaKey = mapa;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32});
        
        this.load.tilemapTiledJSON(`${this.mapaKey}`, `data/json/${this.mapaKey}.json`);	

        this.load.spritesheet('player', 'data/player/playerSprite.png', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('monstro1', 'data/npc/guarda/mulher.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monstro2', 'data/npc/guarda/homem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monstro3', 'data/npc/vendedor/vendedorhomem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano3', 'data/npc/vendedor/vendedorMulher.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('estante', 'data/tileds/estante.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('mesaCentral', 'data/tileds/mesaCentral.png', { frameWidth: 128, frameHeight: 256 });
        this.load.spritesheet('bau', 'data/tileds/bau.png', { frameWidth: 32, frameHeight: 32 });       
        this.load.spritesheet('porta', 'data/tileds/portaMadeira.png', { frameWidth: 32, frameHeight: 64 });
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
        if(this.Config.touchMove){
            this.groundLayer.setInteractive()
            this.groundLayer.on('pointerup',  (pointer)=>{this.onLayerClick(pointer)} , this);
        }
        
        map.setCollisionBetween(0, 2);

        const detalhes = map.createLayer('detalhes', tileset, 0, 0);

        if(this.cameras.main.width < 600){
            this.cameras.main.setZoom(0.5);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        }else if(this.cameras.main.width < 800){
            this.cameras.main.setZoom(0.7);
            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        }

        //* interações */
        this.interacoes = map.getObjectLayer("interacoes");
        this.Objs = criarInteracoes(this,this.interacoes.objects);

        /* PLAYER CREATION */
        let x = 23*32;
        let y = 42*32;
        if(this.ultimoMapa){
            for (let i = 0; i < this.interacoes.objects.length; i++) {
                const element = this.interacoes.objects[i];
                if(element.name == 'playerPoint'){
                    if(element.properties.find(el => el.name == "mapa")['value'] == this.ultimoMapa[0]){
                        if(element.properties.some(el => el.name == "spawnNumber")){
                            if(element.properties.find(el => el.name == "spawnNumber")['value'] == this.ultimoMapa[1]){
                                x = element.x;
                                y = element.y;
                                console.log(element)
                            }                          
                        }else{
                            x = element.x;
                            y = element.y;
                        }
                    }
                }
            }
        }else if(this.ultimoMapa){
            if(localStorage.getItem("playerPos")){
                let playerPos = JSON.parse(localStorage.getItem("playerPos"));
                x = playerPos.x;
                y = playerPos.y;
            }
        }

        this.player = new PlayerCenario({
            scene:this,
            x:x,
            y:y,
            name:"player"
            
        })
        
        this.cameras.main.startFollow(this.player);
        this.onMove = false;

        /* COLISIONS */
        
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.overlap(this.player, this.Objs, (player,objeto)=>{
            controladorInteracoes(objeto,this);
        });
        this.physics.add.overlap(this.player.interact, this.Objs, (player,objeto)=>{
            activeInteracoes(this.player,objeto,this)
        });



        /* BOTOES */
        
        this.addBotoes();

        //fim da criação
        manager.QuestVerificator({mapakey:this.mapaKey},this)
    }
    onLayerClick(pointer) {
            let path = pathFinder(
                this.player,
                { x: pointer.worldX, y: pointer.worldY },
                this.groundLayer,this.interacoes.objects
            )           
            this.onMove = this.player.move(path, this.onMove,false);
    }

    update() {
        this.player.update()    
        this.Objs.forEach(element => {
            if(element.update) element.update()
        });
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
                base: this.add.circle(0, 0, 100, 0x888888,0.4).setStrokeStyle(1.5, 0xaa0000),
                thumb: this.add.circle(0, 0, 50, 0xcccccc,0.2).setStrokeStyle(1.5, 0xaa0000),
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
            this.scene.launch('MenuCreator');
        },
        "playerManager": ()=>{
            this.scene.pause();
            this.scene.manager.scenes.find(el => el.id == 'menuCreator').ui =  "playerManager";
            this.scene.launch('MenuCreator');
        }

    }
}

