import { PlayerCombate } from "./playerCombate.js";
import { InimigoCombate } from "./inimigosCombate.js";
import { pathFinder } from "../controles/pathFinder.js";
import { CameraMain,btnPlayer,btnAcaoPlayer } from "../controles/cameraControle.js";

let Config = null;
export class FaseCombate extends Phaser.Scene {
    constructor(config) {
        super("faseCombate");
        Config = config;

        this.players = [];
        this.inimigos = [];
        Config.playerActive = config.playerActive;
    }
    preload() {
        this.load.spritesheet('Atlas', 'data/tileds/Atlas.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('player1', 'data/player/playerCombat.png');
        this.load.image('player2', 'data/player/playerCombat.png');

        this.load.image('espada', 'data/player/arminha.png');

        this.load.image('inimigo1', 'data/npc/enemy.png');
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

        /// ---------   PLAYERS     ----------------
        this.players = [];
        for (let i = 0; i < Config.players.length; i++) {
            const playerDados = Config.players[i];
            this.players.push(new PlayerCombate(
                {
                    scene: this,
                    x: playerDados.x,
                    y: playerDados.y,
                    name: playerDados.name,
                }));
        }
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        this.cameras.main.startFollow(this.players[Config.playerActive]);
        /// ---------   inimigos     ----------------

        this.inimigos = [];
        for (let i = 0; i < Config.inimigos.length; i++) {
            const inimigosDados = Config.inimigos[i];
            this.inimigos.push(new InimigoCombate(
                {
                    scene: this,
                    x: inimigosDados.x,
                    y: inimigosDados.y,
                    name: inimigosDados.name,
                })
            );
        }

        //  ---------   botoes      ----------------
        this.criarBotoes(Config.marcadorEtapa);

        if ("escolhaDoInimigo" == Config.marcadorEtapa) {
            setTimeout(() => {
                this.inimigos[0].acoes["Decidir"](0, Config, "escolhaDoJogador");

                Config.marcadorEtapa = this.trocarTurno("escolhaDoJogador");
                this.scene.restart(); 
                
            }, 100)
        }

        this.Analogico = new CameraMain(this, 550, 550, "espada");
    }

    update() {
        if(this.inimigos.length == 0){
            console.log("vitoria")
        }
    }

    onLayerClick(pointer,mover) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].travaAndar) {
                return;
            }
        }

        let path = pathFinder(
            { x: this.players[Config.playerActive].x, y: this.players[Config.playerActive].y },
            { x: pointer.worldX, y: pointer.worldY },
            this.baixo, [...this.players,...this.inimigos]
        );

        if (path != null) {
            this.players[Config.playerActive].move( path, mover, Config, "escolhaDoJogador");
        }else{
            Config.marcadorEtapa = "escolhaDoJogador";
            this.scene.restart();
        }
    }

    criarBotoes(marcadorEtapa) {
        let btns = [];
        const x = Config.players[Config.playerActive].x;
        const y = Config.players[Config.playerActive].y;
        switch (marcadorEtapa) {
            case "escolhaDoJogador":
                const acoes = Config.players[Config.playerActive].acoes;
                for (let i = 0; i < acoes.length; i++) {
                    const botao = btnAcaoPlayer( this,200 + 100 * i, 80,acoes[i],Config);

                    btns.push(botao);

                }

                for (let i = 0; i < this.players.length; i++) {
                    const botao =  btnPlayer(this,20, 90 + 150 * i,i,Config);
                    btns.push(botao);
                }
                const botao = this.add.text(750, 10, Config.quantJogadasP, { fontSize: '32px', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
                    .setScrollFactor(0, 0);
                btns.push(botao);
                break;
            case "Andar":
                this.players[Config.playerActive].acoes["Andar"]
                        (Config.players[Config.playerActive].acoes.find(element => element.name == "Andar").dados);

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
                            
                            const inimigoStats = Config.inimigos.find(element => element.name == inimigo.name);
                            const playerAtaque = Config.players[Config.playerActive]
                                    .acoes.find(element => element.tipo == "Atacar").dados['damage'];                       
                            inimigoStats.stats.vida = inimigo.receberDano(inimigoStats.stats.vida,playerAtaque);
                            if (inimigoStats.stats.vida <= 0) {
                                Config.inimigos.splice(Config.inimigos.indexOf(inimigoStats), 1);
                            }
                            console.log(inimigoStats.stats.vida); 
                            Config.marcadorEtapa = this.trocarTurno("escolhaDoJogador");
                            this.scene.restart();
                        }
                    })

                })

                btns.push(rectangle);
                btns.push(this.cancelarBtn());

                break;
            case "Defender":
                console.log("Defender Botoes");
                Config.marcadorEtapa = this.trocarTurno(Config.marcadorEtapa);
                this.scene.restart();
                break;
            case "Magia":
                let raio = 112;
                
                const element = Config.players[Config.playerActive].acoes.find(element => element.tipo == "Magia");
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
                            const inimigoStats = Config.inimigos.find(element => element.name == inimigo.name);//Inimigo Atacado
                            const playerAtaque = element.dados['damage'];// Dano do player

                            inimigoStats.stats.vida = inimigo.receberDano(inimigoStats.stats.vida,playerAtaque);

                            if (inimigoStats.stats.vida <= 0) {
                                Config.inimigos.splice(Config.inimigos.indexOf(inimigoStats), 1);
                            }

                            console.log(inimigoStats.stats.vida); 
                            Config.marcadorEtapa = this.trocarTurno("escolhaDoJogador");
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
                Config.marcadorEtapa = "escolhaDoJogador";
                this.scene.restart();
            });
        return cancelar;
    }

    salvarPosicoes() {
        for (let i = 0; i < this.players.length; i++) {
            Config.players[i].x = this.players[i].x;
            Config.players[i].y = this.players[i].y;
        }
        for (let i = 0; i < Config.inimigos.length; i++) {
            Config.inimigos[i].x = this.inimigos[i].x;
            Config.inimigos[i].y = this.inimigos[i].y;
        }
        this.baixo = null
    }

    trocarTurno(turnoAtual) {
        if(turnoAtual == "escolhaDoJogador"){
            if(Config.quantJogadasP > 1 ){
                Config.quantJogadasP--;
                return "escolhaDoJogador";
            }else{
                Config.quantJogadasP = Config.players.length*2;
                return "escolhaDoInimigo";
            }
        }else if(turnoAtual =="escolhaDoInimigo"){
                return "escolhaDoJogador";
        }

    }
}

