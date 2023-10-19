export function CameraMain(scene,x,y,name){
    const sprite = scene.add.sprite(x, y, name);

    
    sprite.setInteractive();
    scene.input.setDraggable(sprite);
    sprite.setScrollFactor(0,0)

    sprite.originX = x;
    sprite.originY = y;

    scene.input.on('drag', function (pointer, gameObject) {
        // Calcular a distância entre o ponto inicial e a posição do mouse
        const distanceX = pointer.x - gameObject.originX;
        const distanceY = pointer.y - gameObject.originY;
        // Definir a distância máxima que o sprite pode se mover a partir do ponto inicial
        const maxDistance = 50;
        const totalDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        const angle = Math.atan2(distanceY, distanceX);
        const cameraSpeed = 3; //  velocidade da câmera
        const camera = scene.cameras.main;
        camera.stopFollow();

        camera.scrollX += cameraSpeed * Math.cos(angle);
        camera.scrollY += cameraSpeed * Math.sin(angle);

        // Se a distância for maior que o limite máximo, redimensione a distância para se adequar ao limite
        if (totalDistance > maxDistance) { 
            const limitedDistanceX = maxDistance * Math.cos(angle);
            const limitedDistanceY = maxDistance * Math.sin(angle);
            gameObject.x = gameObject.originX + limitedDistanceX;
            gameObject.y = gameObject.originY + limitedDistanceY;
        } else { // Caso contrário, mova o sprite para a posição do mouse
            gameObject.x = pointer.x;
            gameObject.y = pointer.y;
        } 

    });

    scene.input.on('pointerup', function () {
        sprite.x = sprite.originX;
        sprite.y = sprite.originY;

    });
    return sprite;
}





export function btnPlayer(scene,x,y,index,Config){
    const colorBg = index == Config.playerActive ? 0x0b0ba1 : 0x6666ff;
    const alphaBg = index == Config.playerActive ? 0.8 : 0.5;
    const bg = scene.add.rectangle(0, 0, 150, 50, colorBg)
        .setScrollFactor(0, 0)
        .setOrigin(0, 0)
        .setAlpha(alphaBg);

    const sizeBarraVida = (150 * Config.players[index].stats['vida']) / Config.players[index].stats['vidaMax'];
    const barradeVida = scene.add.rectangle(0, 25, sizeBarraVida, 15, 0x228b22)
        .setScrollFactor(0, 0)
        .setOrigin(0, 0);

    const sizeBarraMana = (150 * Config.players[index].stats['mana']) / Config.players[index].stats['manaMax'];
    const barradeMana = scene.add.rectangle(0, 40, sizeBarraMana, 10, 0x75e2e6)
        .setScrollFactor(0, 0)
        .setOrigin(0, 0);

    const text2 = scene.add.text(5, 5, Config.players[index].name, { fontSize: '16px', fill: '#ff1122', fontWeight: 'bold', fontFamily: 'Impact' });

    const container = scene.add.container(x, y, [ bg, text2, barradeMana, barradeVida ])
        .setScrollFactor(0, 0)
        .setInteractive(new Phaser.Geom.Rectangle(0,0,150,50), Phaser.Geom.Rectangle.Contains)
        .on('pointerup', () => {
            for (let i = 0; i < scene.players.length; i++) {
                if (scene.players[i].travaAndar) {
                    return;
                }
            }
            Config.playerActive = index;
            scene.salvarPosicoes();
            scene.scene.restart();
        });

    return container;
}


/*const cor = i == Config.playerActive ? '#22aa22' : '#1155ff';
const botao = this.add.text(100, 100 + 50 * i, this.players[i].name, { fontSize: '32px', fill: cor, fontWeight: 'bold', fontFamily: 'Impact' })
    .setInteractive()
    .setScrollFactor(0, 0)
    .on('pointerup', () => {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].travaAndar) {
                return;
            }
        }
        Config.playerActive = i;
        this.salvarPosicoes();
        this.scene.restart();
    });*/
    
export function btnAcaoPlayer(scene,x,y,acao,Config){
    const cor = '#ff1122';
    const botao = scene.add.text(0, 0, acao.name , { fontSize: '16px', fill: cor, fontWeight: 'bold', fontFamily: 'Impact' })
        .setScrollFactor(0, 0)
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on('pointerup', () => {
            Config.marcadorEtapa = acao.tipo;
            scene.scene.restart();
        });

    const container = scene.add.container(x, y, [ botao ])
        .setScrollFactor(0, 0)
        

    return container;
}
/*
const cor = '#ff1122';
const botao = this.add.text(200 + 100 * i, 80, acoes[i].name, { fontSize: '16px', fill: cor, fontWeight: 'bold', fontFamily: 'Impact' })
    .setInteractive()
    .setScrollFactor(0, 0)
    .setOrigin(0.5, 0.5)
    .on('pointerup', (scene) => {
        this.players[Config.playerActive].acoes[acoes[i].tipo](Config)
        Config.marcadorEtapa = acoes[i].tipo;
        this.scene.restart();
    }, this); 
*/