export function controladorInteracoes(interador,scene){
    console.log(interador.name);
    switch (interador.name) {
        case "portal":
            portalColide(scene,interador);
            break;
        case "inimigo":
            inimigoColide(scene,interador);
            break;
        case 'porta':
            portaColide(scene,interador);
            break;
        case 'npc':
            npcColide(scene,interador);

        default:
            npcColide(scene,interador);
            break
    }

} 

function inimigoColide(scene,inimigo){
    scene.Config['inimigos'] =  
        [
            { name: 'monstro', 
            stats: {
                vida: 10,
            },
            acoes: [
                { name: 'Atacar', dados: { damage : 1}  },
                { name: 'Andar', dados: { speed : 3}  },
            ]}
        ];
        
    scene.scene.pause();
    scene.scene.manager.scenes.find(el => el.scene.key == 'faseCombate').Config = scene.Config;
    scene.scene.launch('faseCombate');
    inimigo.tween.stop();
    scene.player.stopTween(inimigo);
    inimigo.destroy();
};

function portalColide(scene,interacao){
    scene.ultimoMapa = [scene.mapaKey];

    scene.ultimoMapa.push(interacao.spawnNumber);
    
    scene.mapaKey = interacao.mapa
    console.log(scene.ultimoMapa[0] , " > " , scene.mapaKey ," >> ", scene.ultimoMapa[1]);
    scene.scene.restart();

};

function npcColide( scene, npc ) {
    scene.player.stopTween(npc);
}

function portaColide( scene, npc ){
    if(!npc.isOpen){
        scene.player.stopTween(npc);
    }
}


export function activeIntaracoes(player,objeto,scene ){
    console.log(player);
    if(player.interactTigger){
        listaActiveInteracoes[objeto.name](objeto,scene);
        player.interactTigger = false;
    }

}


const listaActiveInteracoes= {
    "porta":(interacao,scene) =>{
            if( interacao.isLock ) {
                scene.scene.pause();
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').ui =  "dialog";
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').fala =  "portaTrancada";
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').pos =  0;
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').posFinal =  1;
                scene.scene.launch('MenuCreator');
                return;
            };
            if( interacao.isOpen ){
                interacao.setFrame(interacao.nFrame);
                interacao.isOpen = false;
            } 
            else{
                interacao.setFrame(interacao.nFrame+1);
                interacao.isOpen = true;
            }
        },
    "npc":(interacao,scene) => {
            if(interacao.tipo){
                scene.scene.pause();
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').ui =  "dialog";
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').fala =  interacao.tipo;
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').pos =  interacao.posInicial;
                scene.scene.manager.scenes.find(el => el.id == 'menuCreator').posFinal =  interacao.posFinal;
                scene.scene.launch('MenuCreator');
            }
    },
    'item':(interacao,scene) =>{
        
    }
            
}