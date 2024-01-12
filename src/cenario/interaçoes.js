import { pathFinder, findPath } from "../controles/pathFinder.js"
import { manager, activeInteracoes } from "../controles/manager.js";
import { InimigoCenario } from "./inimigoCenario.js";

export const criarInteracoes = function (scene, interacoes) {
    let objs = [];
    //create a foreach loop for all the interacoes objects , and create a sprite for each one with a name 
    interacoes.forEach(object => {
        const obj = make[object.name](scene, object);
        if (obj != null) {
            objs.push(obj);
        }
    });
    manager.visibilidadePelasQuests(objs);
    return objs;
}

const make = {
    "portal": function (scene, object) {
        const portal = scene.add.rectangle(object.x, object.y, object.width, object.height, 0xffffff, 0.6)
            .setOrigin(0, 0)
            .setInteractive();
        portal.name = 'portal';
        portal.mapa = object.properties.find(el => el.name == "mapa")['value'];
        portal.spawnNumber = object.properties.some(el => el.name == "spawnNumber") ?
            object.properties.find(el => el.name == "spawnNumber")['value'] :
            false;
        portal.on('pointerup', () => {
            let path = pathFinder(
                scene.player,
                { x: portal.x, y: portal.y },
                scene.groundLayer, []);
            scene.player.move(path, scene.onMove, false);
        });

        scene.physics.add.existing(portal);
        portal.body.setImmovable();

        return portal;
    },
    "inimigo": function (scene, object) {
        const inimigoCenario = new InimigoCenario(object, scene);
        return inimigoCenario;
    },
    "porta": function (scene, object) {
        const spriteN = object.properties.find(el => el.name == "pos")['value'];
        const isLock = object.properties.find(el => el.name == "isLock")['value'];
        const isOpen = object.properties.find(el => el.name == "isOpen")['value'];

        const porta = scene.add.sprite(object.x, object.y, 'porta', isOpen ? spriteN + 1 : spriteN);
        porta.isLock = isLock;
        porta.isOpen = isOpen;
        porta.name = 'porta';
        porta.nFrame = spriteN;
        if (object.properties.some(el => el.name == "itemCode"))
            porta.keyCode = object.properties.find(el => el.name == "itemCode")['value'];

        porta.setOrigin(0, 0);
        porta.setInteractive();


        porta.on('pointerup', () => {
            let path = pathFinder(
                scene.player,
                { x: porta.x, y: porta.y },
                scene.groundLayer, []);
            if (path.length > 1) {
                path.pop();
                scene.player.move(path, scene.onMove, () => { activeInteracoes({ interactTigger: true }, porta, scene) });
            } else {
                activeInteracoes({ interactTigger: true }, porta, scene);
            }

        });
        scene.physics.add.existing(porta);

        porta.body.setImmovable();

        return (porta);

    },
    "npc": function (scene, object) {
        const spriteName = object.properties.find(el => el.name == "sprite")['value'];
        const spriteFrame = object.properties.find(el => el.name == "frame")['value'];
        const somenteVisivel = object.properties.some(el => el.name == "somenteVisivel") ?
            object.properties.find(el => el.name == "somenteVisivel")['value'] : false;
        const tipo = object.properties.find(el => el.name == "tipo")['value'];
        let posInicial = false, posFinal = false, itemCode = false;
        if (tipo) {
            if (tipo.includes("Generic")) {
                posInicial = object.properties.find(el => el.name == "posInicial")['value'];
                posFinal = object.properties.find(el => el.name == "posFinal")['value'];
            }
            else if (tipo.includes("Item")) {
                itemCode = object.properties.find(el => el.name == "itemCode")['value'];
                posInicial = object.properties.find(el => el.name == "posInicial")['value'];
                posFinal = object.properties.find(el => el.name == "posFinal")['value'];
            }
        }

        const npc = scene.add.sprite(object.x, object.y, spriteName);
        npc.setOrigin(0, 0);
        npc.setFrame(spriteFrame);
        npc.id = object.id;
        npc.name = 'npc';
        npc.posFinal = posFinal;
        npc.posInicial = posInicial;
        npc.tipo = tipo;
        npc.itemCode = itemCode;
        npc.somenteVisivel = somenteVisivel;

        npc.setInteractive();
        npc.on('pointerup', () => {
            let path = pathFinder(
                scene.player,
                { x: npc.x, y: npc.y },
                scene.groundLayer, []);
            if (path.length > 1) {
                path.pop();
                scene.player.move(path, scene.onMove, () => { activeInteracoes({ interactTigger: true }, npc, scene) });
            } else {
                activeInteracoes({ interactTigger: true }, npc, scene)
            }

        });

        scene.physics.add.existing(npc);
        npc.body.setImmovable();
        npc.troggleVisible = function (show) {
            if (show) {
                npc.setAlpha(1);
                npc.body.enable = true;
            } else {
                npc.setAlpha(0.0);
                npc.body.enable = false;
            }
        }
        return npc;
    },
    "playerPoint": function (scene, object) {
        return null
    }
}


export function inimigoPerseguidor(scene,object){
   
    const inimigo = make["inimigo"](scene,object)

    inimigo.goTo = () => {
        const path = pathFinder(inimigo, scene.player, scene.groundLayer, []);
        if (path == null) {
            path = pathFinder(inimigo, {x:768,y:672}, scene.groundLayer, []);
        }
        path.forEach((laco, ind) => {
            laco.x = laco.x * 32 + 16;
            laco.y = laco.y * 32 + 16;
            laco.duration = 200;
            let angulo = ind > 0 ?
                Phaser.Math.Angle.Between(path[ind - 1].x, path[ind - 1].y, laco.x, laco.y) :
                Phaser.Math.Angle.Between(path[path.length - 1].x, path[path.length - 1].y, laco.x, laco.y,);
            angulo = Phaser.Math.RadToDeg(angulo);
            laco.onStart = () => {
                inimigo.rodarAnimacao(angulo);
            }
        });
        inimigo.tween = scene.tweens.chain({
            targets: inimigo,
            tweens: path,
            onComplete: () => {
                inimigo.destroy();
            },
        });
    }

    return inimigo;
}

