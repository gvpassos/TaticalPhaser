
export class PlayerCenario extends Phaser.GameObjects.Sprite {
    constructor (config)    {
        super(config.scene, config.x, config.y, config.name);
        //You can either do this:
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        
        this.setOrigin(0,0);
        this.body.onWorldBounds = true;
        this.body.setSize(25,25);
        this.target = {x:0,y:0};
        
        this.name = config.name
        this.graphics = this.scene.add.graphics();
        this.travaAndar = false;


        config.scene.input.keyboard.on('keydown', (input) => {
            if(this.tecladoMove[input.key])this.tecladoMove[input.key](800);
        })
        config.scene.input.keyboard.on('keyup', (input) => {
            
            if(this.tecladoMove[input.key])this.tecladoMove[input.key](0);

        })

        this.interact = config.scene.add.rectangle(config.x, config.y,64,64,0xffffff);
        this.interact.setAlpha(0); 
        this.interact.setOrigin(0,0);
        
        this.interactTigger = false;

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
            this.interactTigger = speed > 0;            
        }
    }

    stopTween(porta){
        this.graphics.clear();
        if(this.tweens){
            this.tweens.stop();
        }
        if(this.y <= porta.y+porta.height && this.y >= porta.y){
            if(this.x > porta.x)
                this.x = porta.x+porta.width+32;
            if(this.x < porta.x)
                this.x = porta.x-32;            
        }
        if(this.x <= porta.x+porta.width && this.x >= porta.x){
             if(this.y > porta.y)
                this.y = porta.y+porta.height+32;
            if(this.y < porta.y)
                this.y = porta.y-32;      
        }
    }


    update(){
        this.interact.x = this.x-16;
        this.interact.y = this.y-16;
    }
}