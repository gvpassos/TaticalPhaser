import { CameraMain } from "../controles/cameraControle.js"; 
import { PlayerCenario } from "./playerCenario.js"; 

let Config = null;
export class Cenario extends Phaser.Scene {
    constructor(config,mapa) {
        super("faseCombate");
        Config = config;
        this.mapaKey = mapa;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32 });
        
        switch (this.mapaKey){
            case "cidade":
                this.load.tilemapTiledJSON('cidade', 'data/json/cidade.json'); 
                break;
            
        }
        this.load.spritesheet('player', 'data/player/player.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('espada', 'data/player/arminha.png');

     

    }

    create() {
        
        let map = this.make.tilemap({ key: this.mapaKey, tileWidth: 32, tileHeight: 32 });
        const tileset = map.addTilesetImage('Atlas', 'Atlas');
      
        const groundLayer = map.createLayer('baixo', tileset, 0, 0);
        groundLayer.setDepth(0);
        

        const detalhes = map.createLayer('detalhes', tileset, 0, 0);
        this.Analogico = new CameraMain(this, 550, 550, "espada");


        this.player = new PlayerCenario({
            scene:this,
            x:23*32,
            y:42*32,
            name:"player"
            
        })
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        this.cameras.main.startFollow(this.player);
    }

    update() {

    }

}

