import { pathFinder, findPath } from "../controles/pathFinder.js"
import { activeInteracoes } from "../controles/manager.js";

export const criarInteracoes = function (scene, interacoes) {
    let objs = [];
    //create a foreach loop for all the interacoes objects , and create a sprite for each one with a name 
    interacoes.forEach(object => {
        const obj = make[object.name](scene, object);
        if (obj != null) objs.push(obj);

    });
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

        return portal;
    },
    "inimigo": function (scene, object) {

        const spriteName = object.properties.find(el => el.name == "sprite")['value'];

        const inimigo = scene.add.sprite(object.x + 16, object.y + 16, spriteName);
        inimigo.setOrigin(0.5, 0.5);
        inimigo.name = 'inimigo';
        inimigo.id = object.id;
        inimigo.idle = [];
        inimigo.tipo = object.properties.find(el => el.name == "tipo")['value']

        /// animacoes do inimigo
        inimigo.anims.create({
            key: 'up',
            frames: inimigo.anims.generateFrameNumbers(spriteName, { frames: [9, 10, 11] }),
            frameRate: 8,
            repeat: -1
        });
        inimigo.anims.create({
            key: 'down',
            frames: inimigo.anims.generateFrameNumbers(spriteName, { frames: [0, 1, 2] }),
            frameRate: 8,
            repeat: -1
        });
        inimigo.anims.create({
            key: 'left',
            frames: inimigo.anims.generateFrameNumbers(spriteName, { frames: [3, 4, 5] }),
            frameRate: 8,
            repeat: -1
        });
        inimigo.anims.create({
            key: 'right',
            frames: inimigo.anims.generateFrameNumbers(spriteName, { frames: [6, 7, 8] }),
            frameRate: 8,
            repeat: -1
        });
        inimigo.play('up');
        inimigo.stop();

        inimigo.rodarAnimacao = (angulo) => {

            if (angulo == 0) {
                if (inimigo.anims.currentAnim.key != 'right') inimigo.play('right');
                if (!inimigo.anims.isPlaying) inimigo.play('right');
            } else if (angulo == 180) {
                if (inimigo.anims.currentAnim.key != 'left') inimigo.play('left');
                if (!inimigo.anims.isPlaying) inimigo.play('left');
            } else if (angulo == 90) {
                if (inimigo.anims.currentAnim.key != 'down') inimigo.play('down');
                if (!inimigo.anims.isPlaying) inimigo.play('down');
            } else if (angulo == -90) {
                if (inimigo.anims.currentAnim.key != 'up') inimigo.play('up');
                if (!inimigo.anims.isPlaying) inimigo.play('up');
            }
        }
        /// cria o caminho do inimigo
        if (object.polygon) {
            object.polygon.forEach((laco, ind) => {
                const dist = ind > 0 ?
                    Phaser.Math.Distance.BetweenPoints(laco, object.polygon[ind - 1]) :
                    Phaser.Math.Distance.BetweenPoints(laco, object.polygon[object.polygon.length - 1]);
                let angulo = ind > 0 ?
                    Phaser.Math.Angle.Between(object.polygon[ind - 1].x, object.polygon[ind - 1].y, laco.x, laco.y,) :
                    Phaser.Math.Angle.Between(object.polygon[object.polygon.length - 1].x, object.polygon[object.polygon.length - 1].y, laco.x, laco.y,);

                angulo = Phaser.Math.RadToDeg(angulo);

                console.log(inimigo.tipo, ind, angulo);
                inimigo.idle.push({
                    x: laco.x + object.x + 16,
                    y: laco.y + object.y + 16,
                    duration: dist * 15,
                    onActive: () => {
                        inimigo.angulo = angulo
                        inimigo.rodarAnimacao(angulo);
                    },
                })

            });
            inimigo.track = false;
            inimigo.tween = !inimigo.tween ? scene.tweens.chain({
                targets: inimigo,
                tweens: inimigo.idle,
                loop: -1,
            }) : scene.tweens.restart();
        }
        // CONRRENDO ATRAS DO PLAYER
        inimigo.followPlayer = () => {
            const path = pathFinder(inimigo, scene.player, scene.groundLayer, []);
            if (path == null) {
                inimigo.tween.stop();
                inimigo.track = false;
                inimigo.retorno();
                return;
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
                    const distancia = Phaser.Math.Distance.BetweenPoints(inimigo, scene.player);
                    if (distancia > 450) {
                        inimigo.tween.stop();
                        inimigo.track = false;
                        inimigo.retorno();
                    } else {
                        inimigo.followPlayer();
                    }
                },
            });
        }

        // RETORNO AO INICIO DO CAMINHO
        inimigo.retorno = () => {
            const path = pathFinder(
                inimigo, inimigo.idle[0],
                scene.groundLayer, []
            );
            path.forEach((laco, ind) => {
                laco.x = laco.x * 32 + 16;
                laco.y = laco.y * 32 + 16;
                laco.duration = 200;
                let angulo = ind > 0 ?
                    Phaser.Math.Angle.Between(path[ind - 1].x, path[ind - 1].y, laco.x, laco.y,) :
                    Phaser.Math.Angle.Between(path[path.length - 1].x, path[path.length - 1].y, laco.x, laco.y,);
                angulo = Phaser.Math.RadToDeg(angulo);
                laco.onActive = () => {
                    inimigo.rodarAnimacao(angulo);
                }
            });
            if (inimigo.tween) inimigo.tween.stop();
            inimigo.tween = scene.tweens.chain({
                targets: inimigo,
                tweens: path,
                onComplete: () => {
                    inimigo.tween = scene.tweens.chain({
                        targets: inimigo,
                        tweens: inimigo.idle,
                        loop: -1
                    });
                }
            })

        }
        scene.physics.add.existing(inimigo);


        switch (object.properties.find(el => el.name == "tipo")['value']) {
            case 'ouvinte':
                const distanciaMaxima = 150;
                inimigo.area = scene.add.circle(0, 0, distanciaMaxima, 0xff0000);
                inimigo.area.setStrokeStyle(1.5, 0xaa0000);
                inimigo.update = () => {
                    const distancia = Phaser.Math.Distance.BetweenPoints(inimigo, scene.player);
                    if (inimigo.lastPlayerPos && !inimigo.track) {
                        if (inimigo.lastPlayerPos.x != scene.player.x ||
                            inimigo.lastPlayerPos.y != scene.player.y) {
                            inimigo.track = true;
                            inimigo.tween.stop();
                            inimigo.followPlayer();

                            inimigo.area.setAlpha(0);
                        }

                    }
                    if (distancia < distanciaMaxima) {
                        inimigo.lastPlayerPos = { x: scene.player.x, y: scene.player.y };
                        inimigo.area.setAlpha(0.4);
                    } else {
                        inimigo.lastPlayerPos = false;
                        inimigo.track = false;
                        inimigo.area.setAlpha(0.2);
                    }

                    inimigo.area.x = inimigo.x;
                    inimigo.area.y = inimigo.y;
                }
                break;
            case 'observador':
                const visionAngle = 15;
                const visionDistance = 300;
                inimigo.triangle = scene.add.triangle(200, 200, 0, 0, 300, 80, 300, -80, 0xff0000);
                inimigo.triangle.setStrokeStyle(1.5, 0xaa0000);
                inimigo.triangle.setOrigin(0, 0);
                inimigo.triangle.setAlpha(0.2);
                inimigo.update = () => {
                    if (!inimigo.track) {
                        const directionToPlayer = Phaser.Math.Angle.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);
                        const distanceToPlayer = Phaser.Math.Distance.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);

                        if (inimigo.angulo > Phaser.Math.RadToDeg(directionToPlayer) - visionAngle &&
                            inimigo.angulo < Phaser.Math.RadToDeg(directionToPlayer) + visionAngle &&
                            distanceToPlayer < visionDistance
                        ) {
                            const path = findPath(inimigo, scene.player, scene.groundLayer.culledTiles, scene.Objs);
                            if (path) {
                                inimigo.track = true;
                                inimigo.tween.stop();
                                inimigo.followPlayer();
                                inimigo.triangle.setAlpha(0);
                            }
                        } else {
                            inimigo.track = false;
                            inimigo.triangle.setAlpha(0.2);
                        }
                    }
                    inimigo.triangle.x = inimigo.x;
                    inimigo.triangle.y = inimigo.y;
                    inimigo.triangle.angle = inimigo.angulo

                }
                break;
            case 'vigia':
                const vigiaAngle = 30;
                const vigiaDistance = 0;
                inimigo.triangle = scene.add.triangle(200, 200, 0, 0, 300, 173, 300, -173, 0xff0000);
                inimigo.triangle.setStrokeStyle(0.5, 0xaa0000);
                inimigo.triangle.setOrigin(0, 0);
                inimigo.triangle.setAlpha(0.2);
                inimigo.update = () => {
                    if (!inimigo.track) {
                        const directionToPlayer = Phaser.Math.Angle.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);
                        const distanceToPlayer = Phaser.Math.Distance.Between(inimigo.x, inimigo.y, scene.player.x, scene.player.y);

                        if (inimigo.angulo > Phaser.Math.RadToDeg(directionToPlayer) - vigiaAngle &&
                            inimigo.angulo < Phaser.Math.RadToDeg(directionToPlayer) + vigiaAngle &&
                            distanceToPlayer < vigiaDistance
                        ) {
                            const path = findPath(inimigo, scene.player, scene.groundLayer.culledTiles, scene.Objs);
                            if (path) {
                                inimigo.track = true;
                                inimigo.tween.stop();
                                inimigo.followPlayer();
                                inimigo.triangle.setAlpha(0);
                            }
                        } else {
                            inimigo.track = false;
                            inimigo.triangle.setAlpha(0.2);
                        }
                    }
                    inimigo.triangle.x = inimigo.x;
                    inimigo.triangle.y = inimigo.y;
                    inimigo.triangle.angle = inimigo.angulo

                }
                break;

        }
        return inimigo;
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
        if(object.properties.some(el => el.name == "itemCode"))
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

        const tipo = object.properties.find(el => el.name == "tipo")['value'];
        let posInicial, posFinal, itemCode;
        if (tipo.includes("Generic")) {
            posInicial = object.properties.find(el => el.name == "posInicial")['value'];
            posFinal = object.properties.find(el => el.name == "posFinal")['value'];
        }
        else if (tipo.includes("Item")) {
            itemCode = object.properties.find(el => el.name == "itemCode")['value'];
            posInicial = object.properties.find(el => el.name == "posInicial")['value'];
            posFinal = object.properties.find(el => el.name == "posFinal")['value'];
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

        return npc;
    },
    "playerPoint": function (scene, object) {
        return null
    }
}



