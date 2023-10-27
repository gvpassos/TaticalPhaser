import { pathFinder } from "../controles/pathFinder.js"	
export const criarInteracoes = function (scene,interacoes){

    //create a foreach loop for all the interacoes objects , and create a sprite for each one with a name 
    interacoes.forEach(object => {
        switch (object.name) {
            case 'portal':
                makePortal(scene,object);
        }
    });

}


function makePortal(scene,object){
    let portal = scene.add.sprite(object.x, object.y, 'Atlas',0)
        .setOrigin(0, 0)
        .setAlpha(0.4)
        .setInteractive()
        .on('pointerup', () => {
            let path = pathFinder(
                scene.player,
                { x: portal.x, y: portal.y },
                scene.groundLayer,[]

            )
               
        scene.player.move(path, scene.onMove, ()=>{
            console.log("passou");
            scene.ultimoMapa = scene.mapaKey;
            scene.mapaKey = object.properties.find(element => element.name == 'mapa')['value'];
            scene.scene.restart();

        });

            console.log(object);
        })

}