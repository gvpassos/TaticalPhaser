import { pathFinder } from "../controles/pathFinder.js"	
export const criarInteracoes = function (scene,interacoes){
    let objs = [];
    //create a foreach loop for all the interacoes objects , and create a sprite for each one with a name 
    interacoes.forEach(object => {
        switch (object.name) {
            case 'portal':
               objs.push(makePortal(scene,object));
        }
    });
    return objs;
}


function makePortal(scene,object){
    const portal = scene.add.rectangle(object.x, object.y, object.width, object.height, 0xffffff, 0.6)
        .setOrigin(0, 0)
        .setInteractive();
    portal.funcColide = ()=>{
        scene.ultimoMapa = [scene.mapaKey];
        if(object.properties.find(element => element.name == 'spawnNumber'))scene.ultimoMapa.push(object.properties.find(element => element.name == 'spawnNumber')['value']);
        
        scene.mapaKey = object.properties.find(element => element.name == 'mapa')['value'];
        console.log(scene.ultimoMapa[0] , " > " , scene.mapaKey);
        scene.scene.restart();
    };
    portal.on('pointerup', () => {
        let path = pathFinder(
            scene.player,
            { x: portal.x, y: portal.y },
            scene.groundLayer,[]);
        scene.player.move(path, scene.onMove,false);
    });

    scene.physics.add.existing(portal);     
    return portal;
}