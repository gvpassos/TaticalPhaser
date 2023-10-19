
export class PlayerCenario extends Phaser.Physics.Arcade.Sprite {
    constructor (config)    {
        super(config.scene, config.x, config.y, config.name);
        //You can either do this:
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        
        this.setOrigin(0,0);
        this.body.onWorldBounds = true;
        this.target = {x:0,y:0};
        
        this.name = config.name
        this.graphics = this.scene.add.graphics();
        this.travaAndar = false;
    }
    move( path, mover, Config, estagio){
        this.travaAndar = true;

        if(path.length == 0){
            this.travaAndar = false;
            return;
        }

        const color = 0x000050; 
        const lineWidth = 5;
        const totalMov = Config.players[Config.playerActive].acoes.find((element) => element.tipo == 'Andar').dados.speed
        
        if(path.length > totalMov){
            path.splice(totalMov)
        }

        for (let i = 0; i  < path.length;  i++) {
            path[i].x = path[i].x*32;
            path[i].y = path[i].y*32;
            path[i].duration =  100,

            this.graphics.lineStyle(lineWidth, color);
            if(i==0){
                const line = new Phaser.Geom.Line(Math.floor(this.x/32)*32+16, Math.floor(this.y/32).y*32+16,path[i].x+16, path[i].y+16);
                this.graphics.strokeLineShape(line);
            }else{
                const line = new Phaser.Geom.Line(path[i-1].x+16, path[i-1].y+16,path[i].x+16, path[i].y+16);
                this.graphics.strokeLineShape(line);
            }
        }

        

        this.graphics.strokeRect(path[path.length-1].x, path[path.length-1].y, 32, 32); 

        if( mover ){
            let scene = this.scene;
                const tween = this.scene.tweens.chain({
                    targets: this,
                    tweens:path,
                    onComplete: () => {
                    this.graphics.clear();
                    Config.marcadorEtapa = scene.trocarTurno(estagio);
                    scene.scene.restart();
                    Config.players[Config.playerActive].x = this.x;
                    Config.players[Config.playerActive].y = this.y;
                    },
                });
        }
        

        
        
        return true;
    }

   

    update(){
        
    }
}