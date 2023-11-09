import {pathFinder,findPath} from '../../controles/pathFinder.js';
export class InimigoCombate extends Phaser.Physics.Arcade.Sprite {
    constructor (config)    {
        super(config.scene, config.x, config.y, config.name);
        //You can either do this:
        config.scene.add.existing(this);
        
        this.setOrigin(0,0);
        
        this.name = config.name;
        this.graphics = this.scene.add.graphics();
        this.travaAndar = false;


        
    };

    acoes = 
    {
        'Andar':(index,player, Config ,estagio)=>{

            console.log("Andar",index ,' > ',player);
            const scene = this.scene;

        
            let path = pathFinder(
                {x:this.x,y: this.y},
                {x:scene.players[player].x,y: scene.players[player].y},
                scene.baixo,[...scene.players,...scene.inimigos]
            );
            console.log(
                {x:this.x,y: this.y},
                {x:scene.players[player].x,y: scene.players[player].y},
                scene.baixo,[...scene.players,...scene.inimigos]
            );
                
            console.log(path)
            if (path == null) {
                Config.marcadorEtapa = estagio;
                if(Config.inimigos.length-1 == index)this.scene.scene.restart();
                else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);    
                return;
            }

            
            const totalMov = Config.inimigos[index].acoes.find((element) => element.name == 'Andar').dados.speed;
            if(path.length > totalMov){
                path.splice(totalMov)
            }
            
            for (let i = 0; i  < path.length;  i++) {
                path[i].x = path[i].x*32;
                path[i].y = path[i].y*32;
                path[i].duration =  100;
  
            }
            const color = 0x000050; 
            const lineWidth = 5;
            
            this.graphics.lineStyle(lineWidth, color);
            this.graphics.strokeRect(path[path.length-1].x, path[path.length-1].y, 32, 32);
            scene.cameras.main.startFollow(this);
            
           
          
        },
        'Atacar':(index,rand, Config ,estagio)=> {
            
            const dano = Config.inimigos[index].acoes.find((element) => element.name == 'Atacar').dados.damage;
            Config.players[rand].stats.vida = this.scene.players[rand].receberDano(Config.players[rand].stats.vida,dano);

            console.log("Atacar",Config.players[rand].stats.vida);

            if(Config.inimigos.length-1 == index)this.scene.scene.restart();
            else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);

        },
        "Decidir": (index, Config ,estagio) => {
            console.log("Decidir",index);

            console.log("Nao fez nada");
            Config.marcadorEtapa = estagio;
            if(Config.inimigos.length-1 == index)this.scene.scene.restart();
            else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);
                    
        }

    };

    receberDano(pontosVida,Damage){
        if(pontosVida < Damage ){
            console.log("INIMIGO MORTO");

            this.destroy();
            return 0;
        }
        return(pontosVida - Damage);
    }
    
    update(){
        
    }
}