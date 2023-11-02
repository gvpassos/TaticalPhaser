
export class PlayerCenario extends Phaser.GameObjects.Sprite {
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

        this.interact = config.scene.add.rectangle(config.x-2, config.y-2,36,36,0xffffff);
        this.interact.setAlpha(0.5); 
        this.interact.setOrigin(0,0);
        this.interact.funcColide = (obj) => {
            if(this.interactTigger){
                obj.activeInteraction();
                this.interactTigger = false;
            }
        }

        config.scene.physics.add.existing(this.interact);
    }
    move( path, mover, onFinish){

        const color = 0x000050; 
        const lineWidth = 5;

        for (let i = 0; i  < path.length;  i++) {
            path[i].x = path[i].x*32;
            path[i].y = path[i].y*32;
            path[i].duration =  20;
            path[i].onStart = () => {
                this.ultimaPos = {x: this.x, y: this.y};
            }
           
        }

        this.scene = this.scene;
        if(mover){
            mover.stop();
            this.graphics.clear();
        } 
        this.graphics.lineStyle(lineWidth, color);
        this.graphics.strokeRect(path[path.length-1].x, path[path.length-1].y, 32, 32);


        if(onFinish && path.length>1)path.pop();
        this.tweens = this.scene.tweens.chain({
            targets: this,
            tweens:path,
            onComplete: () => {
                this.graphics.clear();   
                if(onFinish) onFinish();
            },
        });

        

        
        
        return this.tween;
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
        "x":(speed)=>{

           this.interactTigger = !(speed > 0);            
            console.log(this.interactTigger);
        }
    }

    stopTween(){
        this.graphics.clear();
        if(this.tweens){
            this.tweens.stop();
            this.x = this.ultimaPos.x;
            this.y = this.ultimaPos.y;
        }
    }


    update(){
        this.interact.x = this.x-2;
        this.interact.y = this.y-2;
    }
}