import { PlayerCenario } from "./playerCenario.js"; 
import { pathFinder } from "../controles/pathFinder.js"
import { criarInteracoes } from "./interaçoes.js";

let Config = null;
export class Cenario extends Phaser.Scene {
    constructor(config,mapa) {
        super("faseCombate");
        Config = config;
        this.mapaKey = mapa;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32});
        
        this.load.tilemapTiledJSON(`${this.mapaKey}`, `data/json/${this.mapaKey}.json`);	

        this.load.spritesheet('player', 'data/player/player.png', { frameWidth: 32, frameHeight: 32 });

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
        const interacoes = map.getObjectLayer("interacoes");
        this.Objs = criarInteracoes(this,interacoes.objects);


        /* PLAYER CREATION */
        let x = 23*32;
        let y = 42*32;
        if(this.ultimoMapa){
            for (let i = 0; i < interacoes.objects.length; i++) {
                const element = interacoes.objects[i];
                if(element.name == 'playerPoint'){
                    if(element.properties.find(el => el.name == "mapa")['value'] == this.ultimoMapa[0]){
                        if(element.properties.some(el => el.name == "spawnNumber")){
                            if(element.properties.find(el => el.name == "spawnNumber")['value'] == this.ultimoMapa[1]){
                                x = element.x;
                                y = element.y;
                                console.log(element)
                            }                          
                        }else{
                            x = element.x
                            y = element.y
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
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        this.cameras.main.startFollow(this.player);
        this.onMove = false;

        /* COLISIONS */
        
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.overlap(this.player, this.Objs, (p,t)=>{
            if(p.name == "player"){
                if(t.funcColide)
                    t.funcColide();
            }
            
            if(t.name = 'player'){
                if(p.funcColide)
                    p.teleport();
            } 
        });


    }
    onLayerClick(pointer) {
            let path = pathFinder(
                this.player,
                { x: pointer.worldX, y: pointer.worldY },
                this.groundLayer,[]

            )
           
            this.onMove = this.player.move(path, this.onMove,false);
    }

    update() {

    }

}

