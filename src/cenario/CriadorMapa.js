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

        this.load.spritesheet('player', 'data/player/player.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('monstro1', 'data/npc/enemy.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monstro2', 'data/npc/guarda/homem.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('humano3', 'data/npc/vendedor/vendedorMulher.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('estante', 'data/tileds/estante.png', { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('mesaCentral', 'data/tileds/mesaCentral.png', { frameWidth: 128, frameHeight: 256 });
        this.load.spritesheet('bau', 'data/tileds/bau.png', { frameWidth: 32, frameHeight: 32 });       
         this.load.spritesheet('porta', 'data/tileds/portaMadeira.png', { frameWidth: 32, frameHeight: 64 });
         this.load.spritesheet('cama', 'data/tileds/cama.png', { frameWidth: 32, frameHeight: 96 });
        this.load.spritesheet('janela', 'data/tileds/janela.png', { frameWidth: 27, frameHeight: 42 });
        

        this.load.image('espada', 'data/player/arminha.png');

    }

    create() {
        /* TILES CREATION */
        let map = this.make.tilemap({ key: this.mapaKey, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('Atlas', 'Atlas');
        this.groundLayer = map.createLayer('baixo', tileset, 0, 0)
            .setInteractive()
            .on('pointerup',  (pointer)=>{this.onLayerClick(pointer)} , this);
        
        map.setCollisionBetween(0, 2);

        const detalhes = map.createLayer('detalhes', tileset, 0, 0);

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
        
        this.physics.add.overlap(this.player, this.Objs, (p,t)=>{
            
            controladorInteracoes(t,this)

        });
        this.physics.add.overlap(this.player.interact, this.Objs, (p,t)=>{
            activeInteracoes(this.player,t,this)
        });



        /* BOTOES */

        this.addBotoes();
        
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

        this.add.sprite(w*0.6, h*0.2, 'espada')
            .setScrollFactor(0, 0)
            .setInteractive()
            .on('pointerup', this.callMenus['playerManager']);
        this.add.circle(w*0.5, h*0.2, 25, 0xff0000)
            .setScrollFactor(0, 0)
            .setInteractive()
            .on('pointerup', this.callMenus['settings'])
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

