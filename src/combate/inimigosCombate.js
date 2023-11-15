import {pathFinder,findPath} from '../controles/pathFinder.js';
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
           const scene = this.scene;

            let path = pathFinder(
                {x:this.x,y: this.y},
                {x:scene.players[player].x,y: scene.players[player].y},
                scene.baixo,[...scene.players,...scene.inimigos]
            );               

            if (path == null) {
                Config.marcadorEtapa = estagio;
                if(Config.inimigos.length-1 == index)this.scene.scene.restart();
                else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);    
                return;
            }
            console.log(path);

            for (let i = 0; i  < path.length;  i++) {
                path[i].x = path[i].x*32;
                path[i].y = path[i].y*32;
                path[i].duration =  100;
                path[i].onStart = () => {
                    console.log("onselectstart");
                }
  
            }

            const color = 0x000050; 
            const lineWidth = 5;

            this.graphics = this.scene.add.graphics();
            this.graphics.lineStyle(lineWidth, color);
            this.graphics.strokeRect(path[path.length-1].x, path[path.length-1].y, 32, 32);

            scene.cameras.main.startFollow(this);
            
            if (path.length > 5) {
                path = path.slice(0, 5); // Mantém apenas os primeiros 5 elementos
            }
            if(path[path.length-1].x == player.x && path[path.length-1].y == player.y){
                path = path.slice(path.length-1,1);
            }

            this.tweens = scene.tweens.chain({
                targets: this,
                tweens:path,
                onComplete: () => {
                    this.graphics.clear();
                    Config.marcadorEtapa = estagio;
                    if(Config.inimigos.length-1 == index)this.scene.scene.restart();
                    else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);
                }
                
            })
          
        },
        'Atacar':(index,rand, Config ,estagio)=> {
            
            const dano = Config.inimigos[index].acoes.find((element) => element.name == 'Atacar').dados.damage;
            Config.players[rand].stats.vida = this.scene.players[rand].receberDano(Config.players[rand].stats.vida,dano);

            console.log("Atacar",Config.players[rand].stats.vida);

            Config.marcadorEtapa = estagio;
            if(Config.inimigos.length-1 == index)this.scene.scene.restart();
            else this.scene.inimigos[index+1].acoes['Decidir'](index+1,Config,estagio);

        },
        "Decidir": (index, Config ,estagio) => {
            console.log("Decidir",index);

            const dados = Config.inimigos[index].acoes;
            let distancias = [];
            for(let i = 0; i < Config.players.length; i++){
                distancias.push(Phaser.Math.Distance.Between(
                    Config.players[i].x,Config.players[i].y,this.x,this.y
                ))
                console.log( i ,distancias[i]);
            
            }
            console.log(distancias.some(element => element < 48));
            if(distancias.some(element => element < 48)){
                const player = distancias.indexOf(distancias.find(element => element < 48));
                this.acoes['Atacar'](index,Config.playerActive,Config,estagio);
                
            }else {
                let perto = Infinity;
                distancias.forEach(element => { 
                    if(element < perto) perto = element
                });

                const pertoPlayer = distancias.indexOf(perto);
                console.log(perto,pertoPlayer);
                this.acoes['Andar'](index,pertoPlayer,Config,estagio);
            }

            
                    
        }

    };

    receberDano(pontosVida,Damage){
        if(pontosVida < Damage ){
            this.destroy();
            return 0;
        }
        return (pontosVida - Damage);
    }
    
    update(){
        
    }
}