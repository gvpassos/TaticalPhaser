import { PlayerCombate } from "./playerCombate.js";
import { InimigoCombate } from "./inimigosCombate.js";
import { pathFinder } from "../controles/pathFinder.js";
import { CameraMain,btnPlayer,btnAcaoPlayer } from "../controles/cameraControle.js";

export class FaseCombate extends Phaser.Scene {
    constructor(config) {
        super("faseCombate");
        this.Config = config;

        this.players = [];
        this.inimigos = [];
        this.isStart = true;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('player1', 'data/player/player.png');
        

        this.load.image('espada', 'data/player/arminha.png');

        this.load.image('monstro1', 'data/npc/enemy.png');
        this.load.image('inimigo2', 'data/npc/enemy.png');
        this.load.image('inimigo3', 'data/npc/enemy.png');

        //scenarios     
        this.load.tilemapTiledJSON('combate', 'data/json/combate.json');

        //Texturas 
        this.load.image('button', 'data/ui/btnExit.png');
        this.load.image('barradeVida', 'data/player/barradevida.jpg');
    }

    create() {
        //Criar Cenario do batalha
        let map = this.make.tilemap({ key: "combate", tileWidth: 32, tileHeight: 32 });
        let tiles = map.addTilesetImage('Atlas');
        this.baixo = map.createLayer("baixo", tiles, 0, 0);

        this.detalhes = map.createLayer("detalhes", tiles, 0, 0);
        this.interacao = map.getObjectLayer("interacoes", 0, 0);
        
        /// ---------   PLAYERS     ----------------
        if(this.isStart){
            this.players.forEach(element => {element.destroy();});
            this.players = [];

            this.inimigos.forEach(element => {element.destroy();});
            this.inimigos = [];
        }
        if(this.players.length == 0 || this.isStart ){
            for (let i = 0; i < this.Config.players.length; i++) {
                const playerDados = this.interacao.objects.find(item => item.name == "playerPoint" && item.properties.find(el => el.name == "pos")['value'] == i);
                if(this.Config.players[i].stats.vida > 0 ){
                    this.players.push(new PlayerCombate(
                        {
                            scene: this,
                            x: playerDados.x,
                            y: playerDados.y,
                            name: playerDados.properties.find(el => el.name == "sprite")['value'],
                        }));
                    }
            }
        }
        else{
            for (let i = 0; i < this.players.length; i++) {
                if(this.Config.players[i].stats.vida > 0 ){
                    this.players[i] = new PlayerCombate(
                    {
                        scene: this,
                        x: this.players[i].x,
                        y: this.players[i].y,
                        name: this.players[i].name
                    });
                }
            }
        }
        
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        this.cameras.main.startFollow(this.players[this.Config.playerActive]);
        /// ---------   inimigos     ----------------

        if(this.inimigos.length == 0 || this.isStart){
            const inimigosDados = [];
            this.interacao.objects.forEach(elemento => {
                if(elemento.name == "inimigo"){
                    inimigosDados.push(elemento);
                }}
            );
            console.log(inimigosDados)
            for (let i = 0; i < this.Config.inimigos.length; i++) {

                this.inimigos.push(new InimigoCombate(
                    {
                        scene: this,
                        x: inimigosDados[i].x,
                        y: inimigosDados[i].y,
                        name: inimigosDados[i].properties.find(el => el.name == "sprite")['value'],
                    })
                );
            }
            this.isStart = false;
        }
        else{
            for (let i = 0; i < this.inimigos.length; i++) {
                this.inimigos[i] = new InimigoCombate(
                    {
                        scene: this,
                        x: this.inimigos[i].x,
                        y: this.inimigos[i].y,
                        name: this.inimigos[i].name
                    });
            }
        }

        //  ---------   botoes      ----------------
        

        this.criarBotoes(this.Config.marcadorEtapa);

        if ("escolhaDoInimigo" == this.Config.marcadorEtapa) {
            setTimeout(() => {
                this.inimigos[0].acoes["Decidir"](0, this.Config, "escolhaDoJogador");
            }, 100)
        }
    }

    update() {
        if( !this.Config.inimigos.some(element => element.stats.vida > 0)){
            console.log("vitoria")
            this.isStart = true;
            setTimeout(()=>{
                this.scene.resume('Cenario');
                this.scene.stop();
            })
        }
    }

    onLayerClick(pointer,mover) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].travaAndar) {
                return;
            }
        }

        let path = pathFinder(
            { x: this.players[this.Config.playerActive].x, y: this.players[this.Config.playerActive].y },
            { x: pointer.worldX, y: pointer.worldY },
            this.baixo, [...this.players,...this.inimigos]
        );

        if (path != null) {
            this.players[this.Config.playerActive].move( path, mover, this.Config, "escolhaDoJogador");
        }else{
            this.Config.marcadorEtapa = "escolhaDoJogador";
            this.scene.restart();
        }
    }

    criarBotoes(marcadorEtapa) {
        let btns = [];
        const x = this.Config.players[this.Config.playerActive].x;
        const y = this.Config.players[this.Config.playerActive].y;
        this.w = this.cameras.main.width;
        this.h = this.cameras.main.height;
        switch (marcadorEtapa) {
            case "escolhaDoJogador":
                const acoes = this.Config.players[this.Config.playerActive].acoes;
                for (let i = 0; i < acoes.length; i++) {
                    
                    const botao = btnAcaoPlayer( this,this.w*0.1+(i*this.w*0.12), this.h*0.12,acoes[i],this.Config);
                    btns.push(botao);

                }

                for (let i = 0; i < this.players.length; i++) {
                    const botao =  btnPlayer(this,this.w*0.03, this.h*0.28+(i*this.h*0.1),i,this.Config);
                    btns.push(botao);
                }
                const QuantJogadas = this.add.text(this.w*0.8, this.h*0.1, this.Config.quantJogadasP, { fontSize: '32px', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
                    .setScrollFactor(0, 0);
                btns.push(QuantJogadas);
                break;
            case "Andar":
                this.players[this.Config.playerActive].acoes["Andar"]
                        (this.Config.players[this.Config.playerActive].acoes.find(element => element.name == "Andar").dados);

                this.baixo.setInteractive();
                this.input.on('drag',(pointer)=>{this.onLayerClick(pointer,false)}, this);
                this.baixo.on('pointerup',  (pointer)=>{this.onLayerClick(pointer,true)} , this);

                btns.push(this.cancelarBtn());

                break;
            case "Atacar":
                const rectangle = this.add.rectangle(x - 32, y - 32, 96, 96, 0xff1111)
                    .setOrigin(0, 0)
                    .setInteractive()
                    .setAlpha(0.5);
                rectangle.on('pointerup', (pointer) => {

                    const point = {
                        x: Math.floor(pointer.worldX / 32) * 32,
                        y: Math.floor(pointer.worldY / 32) * 32,
                    };

                    this.inimigos.forEach((inimigo) => {
                        if (inimigo.x == point.x && inimigo.y == point.y) {    
                            
                            const inimigoStats = this.Config.inimigos.find(element => inimigo.name.includes(element.name));
                            const playerAtaque = this.players[this.Config.playerActive].acoes["Atacar"](this.Config.players[this.Config.playerActive]);
                   
                            inimigoStats.stats.vida = inimigo.receberDano(inimigoStats.stats.vida,playerAtaque);
                            if (inimigoStats.stats.vida <= 0) {
                                this.Config.inimigos.splice(this.Config.inimigos.indexOf(inimigoStats), 1);
                            }
                            console.log(inimigoStats); 

                            this.Config.marcadorEtapa = this.trocarTurno("escolhaDoJogador");
                            this.scene.restart();                        
                        }
                    })

                })

                btns.push(rectangle);
                btns.push(this.cancelarBtn());

                break;
            case "Defender":
                console.log("Defender Botoes");
                this.Config.marcadorEtapa = this.trocarTurno(this.Config.marcadorEtapa);
                this.scene.restart();
                break;
            case "Magia":
                let raio = 112;
                
                const element = this.Config.players[this.Config.playerActive].acoes.find(element => element.tipo == "Magia");
                raio = element.dados['radius'];

                const circulos = this.add.circle(x + 16, y + 16, raio, 0xff1111)
                    .setOrigin(0.5, 0.5)
                    .setInteractive()
                    .setAlpha(0.5);
                circulos.on('pointerup', (pointer) => {
                    const point = {
                        x: Math.floor(pointer.worldX / 32) * 32,
                        y: Math.floor(pointer.worldY / 32) * 32,
                    };

                    this.inimigos.forEach((inimigo) => {
                        if (inimigo.x == point.x && inimigo.y == point.y) {

                            const inimigoStats = this.Config.inimigos.find(element => inimigo.name.includes(element.name));
                            const playerAtaque = this.players[this.Config.playerActive].acoes["Magia"](this.Config.players[this.Config.playerActive]);
                            
                            inimigoStats.stats.vida = inimigo.receberDano(inimigoStats.stats.vida,playerAtaque);

                            if (inimigoStats.stats.vida <= 0) {
                                this.Config.inimigos.splice(this.Config.inimigos.indexOf(inimigoStats), 1);
                            }

                            console.log(inimigoStats.stats.vida); 
                            this.Config.marcadorEtapa = this.trocarTurno("escolhaDoJogador");
                            this.scene.restart(); 
                        }
                    })
                })

                btns.push(circulos);
                btns.push(this.cancelarBtn());

                break;
        }

        return btns;
    }
    cancelarBtn() {
        const cancelar = this.add.image(600, 50, 'button')
            .setInteractive()
            .setScrollFactor(0, 0)
            .on('pointerup', (pointer) => {
                console.log("cancelar");
                this.Config.marcadorEtapa = "escolhaDoJogador";
                this.scene.restart();
            });
        return cancelar;
    }

    salvarPosicoes() {
        for (let i = 0; i < this.players.length; i++) {
            this.Config.players[i].x = this.players[i].x;
            this.Config.players[i].y = this.players[i].y;
        }
        for (let i = 0; i < this.Config.inimigos.length; i++) {
            this.Config.inimigos[i].x = this.inimigos[i].x;
            this.Config.inimigos[i].y = this.inimigos[i].y;
        }
        this.baixo = null
    }

    trocarTurno(turnoAtual) {
        if(turnoAtual == "escolhaDoJogador"){
            if(this.Config.quantJogadasP > 1 ){
                this.Config.quantJogadasP--;
                return "escolhaDoJogador";
            }else{
                this.Config.quantJogadasP = this.Config.players.length*2;
                return "escolhaDoInimigo";
            }
        }else if(turnoAtual =="escolhaDoInimigo"){
                return "escolhaDoJogador";
        }

    }
}

