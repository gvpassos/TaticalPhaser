import { pathFinder,findPath } from "../controles/pathFinder.js"	
import { activeIntaracoes } from "../controles/manager.js";

export const criarInteracoes = function (scene,interacoes){
    let objs = [];
    //create a foreach loop for all the interacoes objects , and create a sprite for each one with a name 
    interacoes.forEach(object => {
        switch (object.name) {
            case 'portal':
               objs.push(makePortal(scene,object));
                break;
            case 'inimigo':
                objs.push(makeInimigo(scene,object));
                break;
            case 'porta':
                objs.push(makePorta(scene,object));
                break;
            case 'npc':
                objs.push(makeNpc(scene,object));
        }
    });
    return objs;
}


function makePortal(scene,object){
    const portal = scene.add.rectangle(object.x, object.y, object.width, object.height, 0xffffff, 0.6)
        .setOrigin(0, 0)
        .setInteractive();
    portal.name = 'portal';
    portal.mapa = object.properties.find(el => el.name == "mapa")['value'];
    portal.spawnNumber = object.properties.some(el => el.name == "spawnNumber") ?
        object.properties.find(el => el.name == "spawnNumber")['value']:
        false;
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

function makeInimigo(scene,object){
    
    const spriteName = object.properties.find(el => el.name == "sprite")['value'];
    let tweenIDLE=[];    


    const inimigo = scene.add.sprite(object.x+16, object.y+16, spriteName);
    inimigo.setOrigin(0.5,0.5);
    inimigo.name = 'inimigo';

    object.polygon.forEach((laco,ind) => {
        const dist = ind>0 ?
            Phaser.Math.Distance.BetweenPoints(laco, object.polygon[ind-1]):
            Phaser.Math.Distance.BetweenPoints(laco, object.polygon[object.polygon.length-1]);
        let angulo = ind>0 ?
            Phaser.Math.Angle.Between(object.polygon[ind-1].x,object.polygon[ind-1].y,laco.x, laco.y,):
            Phaser.Math.Angle.Between(object.polygon[object.polygon.length-1].x,object.polygon[object.polygon.length-1].y,laco.x, laco.y,);

            angulo = Phaser.Math.RadToDeg(angulo);
        tweenIDLE.push({
            x: laco.x + object.x+16,
            y: laco.y + object.y+16,
            duration: dist*5,
            onStart:()=>{
                inimigo.angulo = angulo
            }
        })

    });

    inimigo.idle = tweenIDLE;
    inimigo.track = false;
    inimigo.tween = scene.tweens.chain({
        targets: inimigo,
        tweens:tweenIDLE,
        loop: -1
    });
    inimigo.followPlayer = () => {
        const path = pathFinder(
            inimigo,
            scene.player,
            scene.groundLayer,[]
        );
        path.forEach((laco) => {
            laco.x = laco.x *32 + 16;
            laco.y = laco.y *32 + 16;
            laco.duration =  200;
            onStart: ()=>{
                console.log("RUN")
            }
        });
        inimigo.tween = scene.tweens.chain({
            targets: inimigo,
            tweens:path,
            onComplete: () => {
                const distancia = Phaser.Math.Distance.BetweenPoints(inimigo, scene.player);
                if(distancia > 450){
                    inimigo.tween.stop();
                    inimigo.track = false;
                    inimigo.returno();
                }else{
                    inimigo.followPlayer(); 
                }
            },
        });
    }

    inimigo.returno = () => {
        const path = pathFinder(
            inimigo,inimigo.idle[0],
            scene.groundLayer,[]
        );
        path.forEach((laco) => {
            laco.x = laco.x *32 + 16;
            laco.y = laco.y *32 + 16;
            laco.duration =  200;
            onStart: ()=>{
                console.log("fuck")
            }
        });
        inimigo.tween = scene.tweens.chain({
            targets: inimigo,
            tweens:path,
            onComplete: () => {
                inimigo.tween = scene.tweens.chain({
                    targets: inimigo,
                    tweens:inimigo.idle,
                    loop: -1
                });
            }
        })

    }
    scene.physics.add.existing(inimigo);

    
    switch (object.properties.find(el => el.name == "tipo")['value']) {
        case 'ouvinte':
            const distanciaMaxima = 150;
            inimigo.update = () => {
                const distancia = Phaser.Math.Distance.BetweenPoints(inimigo, scene.player);
                if(inimigo.lastPlayerPos && !inimigo.track){
                    if(inimigo.lastPlayerPos.x != scene.player.x ||
                        inimigo.lastPlayerPos.y != scene.player.y){
                        inimigo.track = true;
                        inimigo.tween.stop();
                        inimigo.followPlayer();
                    }  
                }else {
                if(distancia < distanciaMaxima){
                    inimigo.lastPlayerPos = {x: scene.player.x, y: scene.player.y};
                }else{
                    inimigo.lastPlayerPos = false;
                    inimigo.track = false;
                }
                }   


            }
            break; 
        case 'observador':
            const visionAngle = 30;
            const visionDistance = 300;

            inimigo.update = () => {
                if(!inimigo.track){
                    const directionToPlayer = Phaser.Math.Angle.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);
                    const distanceToPlayer = Phaser.Math.Distance.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);
                        
                    if (inimigo.angulo > Phaser.Math.RadToDeg(directionToPlayer) - visionAngle &&
                        inimigo.angulo < Phaser.Math.RadToDeg(directionToPlayer) + visionAngle &&
                        distanceToPlayer < visionDistance
                        ) {
                        const path = findPath(inimigo,scene.player,scene.groundLayer.culledTiles,scene.Objs);
                        console.log(path != false );
                        if(path) {
                            inimigo.track = true;
                            inimigo.tween.stop();
                            inimigo.followPlayer();
                        }
                    }
                }                

            }
            break;s
    }

    return inimigo;
}

function makePorta(scene,object){
    const spriteN = object.properties.find(el => el.name == "pos")['value'];
    const isLock = object.properties.find(el => el.name == "isLock")['value'];
    const isOpen = object.properties.find(el => el.name == "isOpen")['value'];

    const porta = scene.add.sprite(object.x, object.y, 'porta', isOpen ? spriteN+1 : spriteN );
    porta.isLock = isLock;
    porta.isOpen = isOpen;
    porta.name = 'porta';
    porta.nFrame = spriteN;
    porta.setOrigin(0,0); 
    porta.setInteractive();

    
    porta.on('pointerup', ()=>{
        let path = pathFinder(
            scene.player,
            { x: porta.x, y: porta.y },
            scene.groundLayer,[]);
        if(path.length>1){
            path.pop();
            scene.player.move(path, scene.onMove,porta.activeInteraction);    
        }else{
            porta.activeInteraction();
        }
        
    });
    scene.physics.add.existing(porta);

    porta.body.setImmovable();

    return (porta);

}

function makeNpc(scene,object){
     
    const spriteName = object.properties.find(el => el.name == "sprite")['value'];
    const spriteFrame = object.properties.find(el => el.name == "frame")['value'];
    
    const tipo = object.properties.find(el => el.name == "tipo")['value'];
    let posInicial,posFinal;
    if(tipo.includes("Generic")){
        posInicial = object.properties.find(el => el.name == "posInicial")['value'];
        posFinal = object.properties.find(el => el.name == "posFinal")['value'];
    }
    
    const npc = scene.add.sprite(object.x, object.y, spriteName);
    npc.setOrigin(0,0);
    npc.setFrame(spriteFrame);
    npc.name = 'npc';
    npc.posFinal = posFinal;
    npc.posInicial = posInicial;
    npc.tipo = tipo;
    npc.setInteractive();
    npc.on('pointerup', ()=>{
        let path = pathFinder(
            scene.player,
            { x: npc.x, y: npc.y },
            scene.groundLayer,[]);
        if(path.length>1){
            path.pop();
            scene.player.move(path, scene.onMove,activeIntaracoes({interactTigger:true},npc,scene));
        }else{
            activeIntaracoes({interactTigger:true},npc,scene)
        }
        
    });

    scene.physics.add.existing(npc);
    npc.body.setImmovable();

    return npc;
}