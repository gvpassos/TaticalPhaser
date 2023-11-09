import { PlayerCombate } from "../playerCombate.js";
import { InimigoCombate } from "./inimigosCombate.js";
import { pathFinderISO } from "../../controles/pathFinder.js";
import { CameraMain,btnPlayer,btnAcaoPlayer } from "../../controles/cameraControle.js";

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
        this.load.image('tiles2', 'data/iso-64x64-building.png');
        this.load.tilemapTiledJSON('combate', 'data/json/combateISO.json');

        this.load.image('player', 'data/player/playerCombat.png');

        this.load.image('espada', 'data/player/arminha.png');

        this.load.image('monstro1', 'data/npc/enemy.png');
        this.load.image('inimigo2', 'data/npc/enemy.png');
        this.load.image('inimigo3', 'data/npc/enemy.png');

        //scenarios  

        //Texturas 
        this.load.image('button', 'data/ui/btnExit.png');
        this.load.image('barradeVida', 'data/player/barradevida.jpg');
    }

    create() {
        //Criar Cenario do batalha

        const map = this.add.tilemap('combate');
        console.log(map);
        
        const tileset2 = map.addTilesetImage('iso-64x64-building', 'tiles2');

        this.layer1 = map.createLayer('baixo', [tileset2 ],480,0);
        const layer2 = map.createLayer('detalhes', [ tileset2 ],480,0);

        this.interacoes = map.getObjectLayer("interacoes",240,0);

        this.cameras.main.setZoom(0.8);

        console.log(this.interacoes.objects)
        /// ---------   PLAYERS     ----------------
        
        if(this.players.length == 0){
            for (let i = 0; i < Config.players.length; i++) {
                const playerDados = this.interacoes.objects.find(item => item.name == "playerPoint");   
                const posCorreta  = isoToCartesian(playerDados.x,playerDados.y);            
                this.players.push(new PlayerCombate(
                    {
                        scene: this,
                        x: posCorreta.x,
                        y: posCorreta.y,
                        name: playerDados.properties.find(el => el.name == "nome")['value'],
                    }));
            }
        }
        else{
            for (let i = 0; i < this.players.length; i++) {
                this.players[i] = new PlayerCombate(
                    {
                        scene: this,
                        x: this.players[i].x,
                        y: this.players[i].y,
                        name: this.players[i].name
                    });
            }
        }
        this.cameras.main.setBounds(0, 0, this.width, this.height);
        //this.cameras.main.startFollow(this.layer1);
        /// ---------   inimigos     ----------------

        this.inimigos = [];
        const inimigosDados = [];
        this.interacoes.objects.forEach((item) => {if(item.name == "inimigo"){inimigosDados.push(item)}});
        for (let i = 0; i < inimigosDados.length; i++) {
            const posCorreta =  isoToCartesian(inimigosDados[i].x,inimigosDados[i].y);
            this.inimigos.push(new InimigoCombate(
                {
                    scene: this,
                    x: posCorreta.x,
                    y: posCorreta.y,
                    name: inimigosDados[i].properties.find(el => el.name == "sprite")['value'],
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
       
        this.analogico = CameraMain(this, 500,500,"espada");
    }

    update (time, delta)
    {
        if(this.inimigos.length == 0){
            console.log("vitoria")

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
        const posInicial = cartesianToIso(this.players[Config.playerActive].x, this.players[Config.playerActive].y);
        const posISOfim = cartesianToIso(pointer.worldX, pointer.worldY);
        let path = pathFinderISO(
            posInicial,
            posISOfim,
            this.layer1, [...this.players,...this.inimigos]
        );
            console.log(path);


        if (path != null) {
            path.forEach((element) => {
                element = isoToCartesian(element.x, element.y);
                element.duration = 100;
            })
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
                
                this.input.on('pointerup',  (pointer)=>{this.onLayerClick(pointer,true)} , this);

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
        this.layer1 = null
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

function isoToCartesian (isoX, isoY) {
    const carty = ((isoY-isoX)*0.5) + isoX + 32;
    const cartx = 480-(isoY-isoX)+32
    return { x: cartx, y: carty  };
}

function cartesianToIso (cartX, cartY) {
    const isoX = Math.floor(Math.abs(cartX - 480) /32);
    const isoY = Math.floor(cartY /32);

    return { x: isoX, y: isoY  };
}