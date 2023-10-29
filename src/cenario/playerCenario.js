
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


        config.scene.input.keyboard.on('keydown', (input) => {
            if(this.tecladoMove[input.key])this.tecladoMove[input.key](800);
        })
        config.scene.input.keyboard.on('keyup', (input) => {
            if(this.tecladoMove[input.key])this.tecladoMove[input.key](0);
            
            this.x = (Math.floor( this.x / 32 ) * 32);
            this.y = (Math.floor( this.y / 32 ) * 32);
              
        })
    }
    move( path, mover, onFinish){

        const color = 0x000050; 
        const lineWidth = 5;

        for (let i = 0; i  < path.length;  i++) {
            path[i].x = path[i].x*32;
            path[i].y = path[i].y*32;
            path[i].duration =  20;

           
        }

        this.scene = this.scene;
        if(mover){
            mover.stop();
            this.graphics.clear();
        } 
        this.graphics.lineStyle(lineWidth, color);
        this.graphics.strokeRect(path[path.length-1].x, path[path.length-1].y, 32, 32);

        const tween = this.scene.tweens.chain({
            targets: this,
            tweens:path,
            onComplete: () => {
                this.graphics.clear();   
                if(onFinish) onFinish();
            },
        });

        

        
        
        return tween;
    }

    tecladoMove={
        "ArrowRight":(speed)=>{
            this.body.setVelocityX(speed);
        },
        "ArrowLeft":(speed)=>{
            this.body.setVelocityX(-speed);
        },
        "ArrowUp":(speed)=>{
            this.body.setVelocityY(-speed);
        },
        "ArrowDown":(speed)=>{
            this.body.setVelocityY(speed);
        },
    }

    update(){
        
    }
}