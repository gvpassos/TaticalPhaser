import { pathFinder } from "../controles/pathFinder.js"	
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
        }
    });

    console.log(objs);
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

function makeInimigo(scene,object){
    
    const spriteName = object.properties.find(el => el.name == "sprite")['value'];
    let tweenIDLE=[];
    object.polygon.forEach((laco,ind) => {
        const dist = ind>0 ?
            Phaser.Math.Distance.BetweenPoints(laco, object.polygon[ind-1]):
            Phaser.Math.Distance.BetweenPoints(laco, object.polygon[object.polygon.length-1]);
        tweenIDLE.push({
            x: laco.x + object.x,
            y: laco.y + object.y,
            duration: dist*5,
            onStart: ()=>{
                
            }
        })

    });


    const inimigo = scene.add.sprite(object.x, object.y, spriteName);
        inimigo.setOrigin(0,0);
        inimigo.funcColide = ()=>{
            console.log("colidiu");
            inimigo.tween.stop();
        }

        inimigo.tween = scene.tweens.chain({
            targets: inimigo,
            tweens:tweenIDLE,
            onComplete: () => {
                console.log("fim");
            },
            loop: -1
        });
    scene.physics.add.existing(inimigo);
    return inimigo;
}

function makePorta(scene,object){
    console.log(object);
    const spriteN = object.properties.find(el => el.name == "pos")['value'];
    const isLock = object.properties.find(el => el.name == "isLock")['value'];
    const isOpen = object.properties.find(el => el.name == "isOpen")['value'];

    const inimigo = scene.add.sprite(object.x, object.y, 'porta', isOpen ? spriteN+1 : spriteN );
    inimigo.isLock = isLock;
    inimigo.isOpen = isOpen;
    inimigo.setOrigin(0,0); 
    inimigo.funcColide = ()=>{
        if(!inimigo.isOpen){
            scene.player.stopTween(inimigo);
        }
    }

    inimigo.setInteractive();
    
    inimigo.activeInteraction = () => {
        if( isLock ) return;
        if( inimigo.isOpen ){
            inimigo.setFrame(spriteN);
            inimigo.isOpen = false;
        } 
        else{
            inimigo.setFrame(spriteN+1);
            inimigo.isOpen = true;
        }
        
    }
    inimigo.on('pointerup', ()=>{
        let path = pathFinder(
            scene.player,
            { x: inimigo.x, y: inimigo.y },
            scene.groundLayer,[]);
        if(path.length>1)path.pop();
        scene.player.move(path, scene.onMove,inimigo.activeInteraction);
        
    });
    scene.physics.add.existing(inimigo);

    inimigo.body.setImmovable();

    return (inimigo);

}

