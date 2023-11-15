import { progressJSON } from "./quests.js";
class gameManager {
    constructor(json) {
        this.posicaoQuest = 0;
        this.quests = json.quests;
    }
    QuestVerificator(dados, scene) {
        const actualQuest = this.quests[this.posicaoQuest];
        if (dados.mapakey && actualQuest.tipoTrigger == 'scenario') {
            console.assert(dados.mapakey == actualQuest.trigger, `outro cenario aguardado, ${dados.mapakey} esperado ${actualQuest.trigger}`);
            if (dados.mapakey == actualQuest.trigger) {
                const inter = actualQuest.interacoes;
                this.posicaoQuest++;
                this.acao[inter.tipo](inter.dialog, inter.pos, inter.posFinal, scene);
                return true;
            }
            return false

        }
        if (dados.interacao && actualQuest.tipoTrigger == 'contact') {
            console.warn(dados.interacao, this.posicaoQuest);
            return false;
        }
        if (dados.activeInteracoes && actualQuest.tipoTrigger == 'activeContact') {
            console.log(dados.activeInteracoes.tipo == actualQuest.trigger, `outro objeto aguardado, ${dados.activeInteracoes.tipo} esperado ${actualQuest.tipoTrigger}`);
            
            if (dados.activeInteracoes.tipo == actualQuest.trigger) {
                const inter = actualQuest.interacoes;
                this.posicaoQuest++;
                this.acao[inter.tipo](inter.dialog, inter.pos, inter.posFinal, scene);
                return true;
            }
            return false
        }

    }

    acao = {
        'falas':(dialog,pos,final,scene)=>{
            scene.scene.pause();
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').ui = "dialog";
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').fala = dialog;
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').pos = pos;
            scene.scene.manager.scenes.find(el => el.id == 'menuCreator').posFinal = final;
            scene.scene.launch('MenuCreator');
        }
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
            manager.acao['falas'](newdialogs, pos, final, scene);
        }
    },
    'item': (interacao, scene) => {

    }

}




