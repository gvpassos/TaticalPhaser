
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
        this.animacoes();

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
                const proximaPos = i < path.length-1?path[i+1]:path[i];
                if(proximaPos.x > path[i].x){
                    if(this.anims.currentAnim.key!='right')this.play('right');
                    if(!this.anims.isPlaying)this.play('right');
                }else if(proximaPos.x < path[i].x){
                    if(this.anims.currentAnim.key!='left')this.play('left');
                    if(!this.anims.isPlaying)this.play('left');
                }else if(proximaPos.y > path[i].y){
                    if(this.anims.currentAnim.key!= 'down')this.play('down');
                    if(!this.anims.isPlaying)this.play('down');
                }else if(proximaPos.y < path[i].y){
                    if(this.anims.currentAnim.key!='up')this.play('up');
                    if(!this.anims.isPlaying)this.play('up');
                }else {
                    this.stop();
                }

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
            if(this.anims.currentAnim.key!='right' && speed > 0)this.play('right');
            else if (!this.anims.isPlaying && speed > 0) this.play('right');
            else if(speed==0) this.anims.stop();
            
        },
        "ArrowLeft":(speed)=>{
            this.body.setVelocityX(-speed);  
            if(this.anims.currentAnim.key!='left' && speed > 0)this.play('left');
            else if (!this.anims.isPlaying && speed > 0) this.play('left');
            else if(speed==0) this.anims.stop();
        },
        "ArrowUp":(speed)=>{
            this.body.setVelocityY(-speed);    
            if(this.anims.currentAnim.key!='up' && speed > 0)this.play('up');
            else if (!this.anims.isPlaying && speed > 0) this.play('up');
            else if(speed==0) this.anims.stop();
        },
        "ArrowDown":(speed)=>{
            this.body.setVelocityY(speed);
            if(this.anims.currentAnim.key !='down' && speed > 0)this.play('down');
            else if (!this.anims.isPlaying && speed > 0) this.play('down');
            else if(speed==0) this.anims.stop();
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



    animacoes(){
        this.up = this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [ 9, 10, 11] }),
            frameRate:18,
            repeat: -1
        });
        this.down = this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [ 0, 1, 2] }),
            frameRate:18,
            repeat: -1
        });
        this.left = this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [ 3, 4, 5] }),
            frameRate:18,
            repeat: -1
        });
        this.right = this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.name, { frames: [ 6, 7, 8] }),
            frameRate:18,
            repeat: -1
        })
        this.play('up');
        this.anims.stop()   
    }
}