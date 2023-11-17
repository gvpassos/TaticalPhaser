import { pathFinder } from "./pathFinder.js";
import { progressJSON } from "./quests.js";
class gameManager {
    constructor(json) {
        this.posicaoQuest = 0;
        this.quests = json.quests;
    }
    QuestVerificator(dados, scene) {
        console.warn(this.posicaoQuest);
        const actualQuest = this.quests[this.posicaoQuest];
        if (dados.mapakey && actualQuest.tipoTrigger == 'scenario') { /// interacao por Cenario 
            console.assert(dados.mapakey == actualQuest.trigger, `outro cenario aguardado, ${dados.mapakey} esperado ${actualQuest.trigger}`);
            if (dados.mapakey == actualQuest.trigger) {
                this.posicaoQuest++;
                const interacts = actualQuest.interacoes;
                let next = false
                if(interacts.length > 1){
                    next = interacts.slice(1);
                }
                this.acao[interacts[0].tipo](interacts[0],scene,next);
                
                return true;
            }
            return false

        }
        if (dados.interacao && actualQuest.tipoTrigger == 'contact') {/// interacao por contato 
            console.warn(dados.interacao, this.posicaoQuest);
            return false;
        }
        if (dados.activeInteracoes && actualQuest.tipoTrigger == 'activeContact') { /// interacao por contato Ativado
            console.assert(dados.activeInteracoes.tipo == actualQuest.trigger, `outro objeto aguardado, ${dados.activeInteracoes.tipo} esperado ${actualQuest.trigger}`);
            
            if (dados.activeInteracoes.tipo == actualQuest.trigger) {
                this.posicaoQuest++;
                const interacts = actualQuest.interacoes;
                let next = false;
                if(interacts.length > 1){
                    next = interacts.slice(1);
                }
                this.acao[interacts[0].tipo](interacts[0],scene,next);
                return true;
            }
            return false
        }

    }
    picked = [];
    entregador(object,scene) {
        if(this.picked.some(e => e == object.id)){
            return false;
        }
        scene.Config.inventario.push(object.itemCode);
        this.picked.push(object.id);
        return true;
    }

    acao = {
        'falas':(interact,scene,next)=>{
            const onFinish = this.acao['repeat'](next,scene);
            scene.scene.pause();
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').ui = "dialog";
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').fala = interact.dialog;
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').pos = interact.pos;
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').posFinal = interact.posFinal;
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').onDialogFinish = onFinish;
            scene.scene.launch('MenuCreator');
        },
        'movimento':(interact,scene,next)=>{
            let target;
            if(interact.target == 'player'){
                target = scene.player;
            }else if(interact.target.includes('inimigo')){
                const pos = interact.target.split(',')[1];
                target = scene.inimigo[pos];
            }else if(interact.target.includes('objeto')){
                const pos = interact.target.split(',')[1];
                target = scene.Objs[pos];
            }
            let path = pathFinder(target, interact.posFinal, scene.groundLayer,scene.interacoes.objects);
            const onFinish = this.acao['repeat'](next,scene);
            target.move(path,false,onFinish);

        },
        'item':(interact,scene,next)=>{
            const onFinish = this.acao['repeat'](next,scene);

            if(this.entregador(interact,scene)){
                this
            }
            onFinish();
        },

        'repeat':(actual,scene)=>{
            let next = false;
            if(actual.length > 1){
                next = actual.slice(1);
            }
            return (() => {this.acao[actual[0].tipo](actual[0], scene,next)});
           
        }

        
    }


    getQuests() {
        let string = "";
        for (let i = 1; i <= this.posicaoQuest; i++) {
            string += `Quest ${i}: ${this.quests[i].name}<br>`;
        }

        if(this.posicaoQuest == this.quests.length-1){
            string += 'Você completou todas as quests,Parabens<br>';
        }
        
        return string;
    }
}

export const manager = new gameManager(progressJSON);




export function controladorInteracoes(interador, scene) {
    const haveInter = manager.QuestVerificator({ interacao: interador }, scene);
    if (haveInter) return;
    Colide[interador.name](scene, interador);
}
const Colide = {
    inimigo: (scene, inimigo) => {
        scene.Config['inimigos'] =
            [
                {
                    name: 'monstro',
                    stats: {
                        vida: 10,
                    },
                    acoes: [
                        { name: 'Atacar', dados: { damage: 1 } },
                        { name: 'Andar', dados: { speed: 3 } },
                    ]
                }
            ];

        scene.scene.pause();
        scene.scene.manager.scenes.find(el => el.scene.key == 'faseCombate').Config = scene.Config;
        scene.scene.launch('faseCombate');
        inimigo.tween.stop();
        scene.player.stopTween(inimigo);
        inimigo.destroy();
    },
    portal: (scene, interacao) => {
        scene.ultimoMapa = [scene.mapaKey];
        scene.ultimoMapa.push(interacao.spawnNumber);
        scene.mapaKey = interacao.mapa
        scene.scene.restart();
    },

    npc: (scene, npc) => {
        scene.player.stopTween(npc);
    },

    porta: (scene, npc) => {
        if (!npc.isOpen) {
            scene.player.stopTween(npc);
        }
    }
}

export function activeInteracoes(player, objeto, scene) {
    if (player.interactTigger) {
        player.interactTigger = false;
        const haveInter = manager.QuestVerificator({ activeInteracoes: objeto }, scene);
        if (haveInter) return;

        
        listaActiveInteracoes[objeto.name](objeto, scene);
    }

}

const listaActiveInteracoes = {
    "porta": (interacao, scene) => {
        if (interacao.isLock) {
            manager.acao['falas']("portaTrancada", 0, 1, scene);
            return;
        };
        if (interacao.isOpen) {
            interacao.setFrame(interacao.nFrame);
            interacao.isOpen = false;
        }
        else {
            interacao.setFrame(interacao.nFrame + 1);
            interacao.isOpen = true;
        }
    },
    "npc": (interacao, scene) => {
        if (interacao.tipo) {
            let newdialogs = interacao.tipo;
            let pos = interacao.posInicial;
            let final = interacao.posFinal;

            if(newdialogs.includes("N")){
                newdialogs = newdialogs.split("N")[0]+"Generica";
                pos = 0;
                final = 1;
            }
            if(newdialogs.includes("Item")){
                console.log(">",interacao.itemCode);
                pos = 0;
                final = 1;
                if(!manager.entregador(interacao,scene)){// adicona item no inventario se ja tiver fala outra fala
                    pos = 1;
                    final = 2;
                }
            }
            manager.acao['falas']({dialog:newdialogs, pos:pos,posFinal:final}, scene,false);

            
        }
    },
    'item': (interacao, scene) => {

    }

}




