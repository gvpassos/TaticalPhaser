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
        

        const detalhes = map.createLayer('detalhes', tileset, 0, 0);

        //* interações */
        const interacoes = map.getObjectLayer("interacoes");
        criarInteracoes(this,interacoes.objects);


        /* PLAYER CREATION */
        let x = 23*32;
        let y = 42*32;
        interacoes.objects.forEach(element => {
            if(this.ultimoMapa == element.properties.find(element => element.name == 'mapa')['value']){
                x = element.x;
                y = element.y;
            }
        });
        this.player = new PlayerCenario({
            scene:this,
            x:x,
            y:y,
            name:"player"
            
        })
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        this.cameras.main.startFollow(this.player);
        this.onMove = false;


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

