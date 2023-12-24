import { loadGame, manager, saveGame } from "../controles/manager.js";
import { ITEMS } from "./item.js";

export class MenuCreator extends Phaser.Scene {
    constructor(config) {
        super("MenuCreator");
        this.id = "menuCreator";
        this.config = config;
        this.ui = 'settings';

        this.sceneActive = "Cenario";
    }
    preload() {
        this.load.image({ key: 'espada', url: 'data/player/arminha.png' });
        this.load.spritesheet('itens', 'data/tileds/itens.png', { frameWidth: 32, frameHeight: 32 });
        //falas
        if (this.ui == 'dialog')
            this.load.json('falas', 'data/json/falas.json');
    }

    create() {
        this.w = this.sys.game.config.width;
        this.h = this.sys.game.config.height;
        this.graphics = this.add.graphics();
        switch (this.ui) {
            case 'settings':
                this.menuSettings();
                break;
            case 'playerManager':
                const elements = this.menuPlayerManager();
                break;
            case 'dialog':
                this.menuDialog();

        }


    }
    update() {

    }
    menuSettings() {
        const box = this.add.rectangle(this.w * 0.2, this.h * 0.2, this.w * 0.6, this.h * 0.8, 0xfff0f0)
            .setScrollFactor(0, 0)
            .setOrigin(0, 0);

        const close = this.add.circle(this.w * 0.6, this.h * 0.2, 50, 0xff0000)
            .setScrollFactor(0, 0)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.scene.resume(this.sceneActive);
                this.scene.stop();

            })

        const botaoSalvar = this.add.text(box.width / 2, box.height * 0.40, "Salvar",
            { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                console.log()
                saveGame(this.config,this.scene.manager.keys[this.sceneActive]);

            });
        const botaoCarregar = this.add.text(box.width / 2, box.height * 0.50, "Carregar",
            { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                loadGame(this.scene.manager.keys[this.sceneActive]);
                this.scene.resume(this.sceneActive);

            });
        const botaoConfiguracoes = this.add.text(box.width / 2, box.height * 0.60, "Configurações",
            { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                console.log("salvar");

            });

    }
    menuPlayerManager() {
        this.groupMenu = this.add.container(this.w * 0.05, this.h * 0.05);
        const box = this.add.rectangle(0, 0, this.w * 0.6, this.h * 0.9, 0x1522ac)
            .setScrollFactor(0, 0)
            .setOrigin(0, 0)
            .setAlpha(0.6);
        this.groupMenu.add(box);


        const quadro = this.add.rectangle(0, 0, this.w * 0.6, this.h * 0.05);
        quadro.setStrokeStyle(2, 0xffffff, 5);
        quadro.setOrigin(0, 0);
        this.groupMenu.add(quadro);
        const quadro2 = this.add.rectangle(0, this.h * 0.08, this.w * 0.6, this.h * 0.83)
        quadro2.setStrokeStyle(2, 0xffffff, 5);
        quadro2.setOrigin(0, 0);
        this.groupMenu.add(quadro2);

        const close = this.add.circle(this.w * 0.6, 0, 35, 0xff0000)
            .setScrollFactor(0, 0)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.scene.resume(this.sceneActive);
                this.scene.stop();
            });
        this.groupMenu.add(close);

        const inventarioBtn = this.add.text(this.w * 0.11, this.h * 0.025, "Inventario",
            { fontSize: '1rem', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('inventario');
            });
        this.groupMenu.add(inventarioBtn);

        const statusBtn = this.add.text(this.w * 0.22, this.h * 0.025, "Status",
            { fontSize: '1rem', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('status');
            });
        this.groupMenu.add(statusBtn);

        const historicoBtn = this.add.text(this.w * 0.33, this.h * 0.025, "Historico",
            { fontSize: '1rem', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('historico');
            });
        this.groupMenu.add(historicoBtn);

        const questBtn = this.add.text(this.w * 0.44, this.h * 0.025, "Missoes",
            { fontSize: '1rem', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('quest');
            });
        this.groupMenu.add(questBtn);


    }
    playerMenu(submenu) {
        if (this.groupSubMenu) {
            this.groupSubMenu.destroy();
            this.input.removeListener('dragstart');
            this.input.removeListener('drag');
            this.input.removeListener('dragend');
        }

        this.groupSubMenu = this.add.container(this.w * 0.05, this.h * 0.12);



        switch (submenu) {
            case 'inventario':

                const ratio = Math.floor((this.w * 0.3) / (5 * 32));
                const items = this.add.container(this.w * 0.01, this.h * 0.03);
                this.groupSubMenu.add(items);
                let pos = 0;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 5; j++) {
                        const item = pos < this.config.inventario.length ?
                            ITEMS[this.config.inventario[pos]] : null;
                        const pox = 40 * j * ratio;
                        const poy = 40 * i * ratio;

                        const box = this.add.rectangle(40 * ratio * j, 40 * ratio * i, 40 * ratio, 40 * ratio)
                        box.setStrokeStyle(2, 0xffffff, 1);
                        box.setOrigin(0, 0);
                        items.add(box);

                        if (item == null) continue;
                        const botao = this.add.sprite(pox + (4 * ratio), poy + (ratio * 4), "itens", item.sprite)
                        botao.setScrollFactor(0, 0)
                        botao.setOrigin(0, 0)
                        botao.setInteractive({ draggable: true })
                        botao.setScale(ratio);
                        botao.name = item.name;
                        botao.tipo = item.type;
                        botao.id = item.id;

                        items.add(botao);
                        pos++;
                    }


                }
                const slots = [];
                const head = this.add.rectangle(this.w * 0.42 + (5 * ratio), this.h * 0.05 + (5 * ratio), (40 * ratio), (40 * ratio));
                head.setStrokeStyle(2, 0xffffff, 1);
                head.setOrigin(0, 0);
                head.name = 'head';

                slots.push(head);
                const body = this.add.rectangle(this.w * 0.42 + (5 * ratio), this.h * 0.05 + (50 * ratio), (40 * ratio), (40 * ratio));
                body.setStrokeStyle(2, 0xffffff, 1);
                body.setOrigin(0, 0);
                body.name = 'body';
                slots.push(body);
                const legs = this.add.rectangle(this.w * 0.42 + (5 * ratio), this.h * 0.05 + (95 * ratio), (40 * ratio), (40 * ratio));
                legs.setStrokeStyle(2, 0xffffff, 1);
                legs.name = 'legs';
                legs.setOrigin(0, 0);
                slots.push(legs);
                const hands = this.add.rectangle(this.w * 0.33 + (5 * ratio), this.h * 0.08 + (5 * ratio), (40 * ratio), (40 * ratio));
                hands.setStrokeStyle(2, 0xffffff, 1);
                hands.setOrigin(0, 0);
                hands.name = 'weapon';
                slots.push(hands);
                const weapon = this.add.rectangle(this.w * 0.35 + (5 * ratio), this.h * 0.08 + (50 * ratio), (40 * ratio), (40 * ratio));
                weapon.setStrokeStyle(2, 0xffffff, 1);
                weapon.name = 'hands';
                weapon.setOrigin(0, 0);
                slots.push(weapon);
                const acessories1 = this.add.rectangle(this.w * 0.49 + (5 * ratio), this.h * 0.07 + (5 * ratio), (40 * ratio), (40 * ratio));
                acessories1.setStrokeStyle(2, 0xffffff, 1);
                acessories1.setOrigin(0, 0);
                acessories1.name = 'acessories1'
                slots.push(acessories1);
                const acessories2 = this.add.rectangle(this.w * 0.49 + (5 * ratio), this.h * 0.07 + (50 * ratio), (40 * ratio), (40 * ratio));
                acessories2.setStrokeStyle(2, 0xffffff, 1);
                acessories2.name = 'acessories2';
                acessories2.setOrigin(0, 0);
                slots.push(acessories2);
                const acessories3 = this.add.rectangle(this.w * 0.49 + (5 * ratio), this.h * 0.07 + (95 * ratio), (40 * ratio), (40 * ratio));
                acessories3.setStrokeStyle(2, 0xffffff, 1);
                acessories3.name = 'acessories3';
                acessories3.setOrigin(0, 0);
                slots.push(acessories3);

                this.groupSubMenu.add(slots)

                this.carregarEquip(slots)

                this.input.on('dragstart', function (pointer, gameObject) {
                    gameObject.posOriginX = gameObject.x;
                    gameObject.posOriginY = gameObject.y;

                    gameObject.scene.carregarDesc(gameObject);
                    gameObject.isEquipped = false;
                    slots.forEach(slot => {
                        let x = slot.x + gameObject.scene.groupSubMenu.x;
                        let y = slot.y + gameObject.scene.groupSubMenu.y;
                        if (pointer.x <= x + (42 * ratio) && pointer.x >= x - (2 * ratio)
                            && pointer.y <= y + (42 * ratio) && pointer.y >= y - (2 * ratio)) {
                            gameObject.isEquipped = true;
                        }
                    })

                });
                this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                    gameObject.x = dragX;
                    gameObject.y = dragY;

                    slots.forEach(slot => {
                        let x = slot.x + gameObject.scene.groupSubMenu.x;
                        let y = slot.y + gameObject.scene.groupSubMenu.y;
                        if (pointer.x <= x + (42 * ratio) && pointer.x >= x - (2 * ratio)
                            && pointer.y <= y + (42 * ratio) && pointer.y >= y - (2 * ratio)) {

                            if (slot.name.includes(gameObject.tipo)) slot.setStrokeStyle(2, 0x00ffff, 1);
                            else slot.setStrokeStyle(2, 0xff0000, 1);

                        } else {
                            slot.setStrokeStyle(2, 0xffffff, 1);
                        }
                    })


                });


                this.input.on('dragend', ((pointer, gameObject) => {

                    gameObject.x = gameObject.posOriginX;
                    gameObject.y = gameObject.posOriginY;

                    if (gameObject.isEquipped) {
                        console.log(gameObject.tipo)
                        const slot = slots.find(el => el.name.includes(gameObject.tipo));
                        let x = slot.x + gameObject.scene.groupSubMenu.x;
                        let y = slot.y + gameObject.scene.groupSubMenu.y;

                        if (pointer.x >= x + (22 * ratio) || pointer.x <= x - (22 * ratio)
                            || pointer.y <= y + (22 * ratio) || pointer.y >= y - (22 * ratio)) {
                            this.desequiparItem(slot, gameObject);

                        }

                    } else {
                        slots.forEach(slot => {
                            let x = slot.x + gameObject.scene.groupSubMenu.x;
                            let y = slot.y + gameObject.scene.groupSubMenu.y;
                            if (pointer.x <= x + (42 * ratio) && pointer.x >= x - (2 * ratio)
                                && pointer.y <= y + (42 * ratio) && pointer.y >= y - (2 * ratio)) {

                                this.equiparItem(slot, gameObject)

                            }
                        })
                    }

                    setTimeout(() => { this.playerMenu('inventario') }, 600);
                }));

                const btne = this.add.circle(this.w * 0.4, this.h * 0.60, this.w * 0.02, 0xff0000)
                    .setInteractive()
                    .on('pointerup', () => {
                        this.config.playerActive =
                            this.config.players.length - 1 > this.config.playerActive ?
                                this.config.playerActive + 1 : 0;

                        this.playerMenu('inventario');
                    });
                this.groupSubMenu.add(btne);

                const btnd = this.add.circle(this.w * 0.55, this.h * 0.60, this.w * 0.02, 0xff0000)
                    .setInteractive()
                    .on('pointerup', () => {
                        this.config.playerActive =
                            this.config.playerActive > 0 ?
                                this.config.playerActive - 1 : this.config.players.length - 1;

                        this.playerMenu('inventario');

                    });
                this.groupSubMenu.add(btnd);


                break;
            case 'status':
                const HTML = document.createElement('div');
                HTML.style =
                    `border: 1px solid white;
                    padding: 10px;
                    width: ${this.w * 0.45}px;
                    height: ${this.h * 0.55}px;
                    font: 1rem Arial;
                    color: white;`;

                HTML.innerHTML = `Nome: ${this.config.players[this.config.playerActive].name}`;
                document.getElementById('root').appendChild(HTML);
                for (const key in this.config.players[this.config.playerActive].stats) {
                    if (Object.hasOwnProperty.call(this.config.players[this.config.playerActive].stats, key)) {
                        const element = this.config.players[this.config.playerActive].stats[key];
                        HTML.innerHTML += `<li>${key}: ${element}</li>`;
                    }
                }
                const display = this.add.dom(this.w * 0.02, this.h * 0.025, HTML);
                display.setOrigin(0, 0);
                this.groupSubMenu.add(display);
                const btne2 = this.add.circle(this.w * 0.08, this.h * 0.75, this.w * 0.02, 0xff0000)
                    .setInteractive()
                    .on('pointerup', () => {
                        this.config.playerActive =
                            this.config.players.length - 1 > this.config.playerActive ?
                                this.config.playerActive + 1 : 0;

                        this.playerMenu('status');
                    });
                this.groupSubMenu.add(btne2);

                const btnd2 = this.add.circle(this.w * 0.45, this.h * 0.75, this.w * 0.02, 0xff0000)
                    .setInteractive()
                    .on('pointerup', () => {
                        this.config.playerActive =
                            this.config.playerActive > 0 ?
                                this.config.playerActive - 1 : this.config.players.length - 1;

                        this.playerMenu('status');

                    });
                this.groupSubMenu.add(btnd2);
                break;
            case 'quest':
                const HTMLHistorico = document.createElement('div');
                HTMLHistorico.style =
                    `border: 1px solid white;
                    padding: 10px;
                    width: ${this.w * 0.45}px;
                    height: ${this.h * 0.55}px;
                    font: 1rem Arial;
                    color: white;`;

                HTMLHistorico.innerHTML = `Quests:<br>`;
                HTMLHistorico.innerHTML += manager.getQuests();

                const displayHist = this.add.dom(this.w * 0.02, this.h * 0.025, HTMLHistorico);
                displayHist.setOrigin(0, 0);
                this.groupSubMenu.add(displayHist);
                break;
            case 'historico':
                break;

        }



    }

    menuDialog() {
        this.travaMovimento = false;
        const dialog = this.add.container(this.w * 0.1, this.h * 0.7);

        const retangulo = this.add.rectangle(0, 0, this.w * 0.8, this.h * 0.25, 0x1522ac)
        retangulo.setOrigin(0, 0);
        retangulo.setInteractive();
        retangulo.on('pointerup', () => {
            if (this.travaMovimento) {
                this.scene.restart();
            } else {
                this.travaMovimento = true;
            }
        });
        this.input.keyboard.on('keyup', (input) => {
            if (input.key == 'x' || input.key == 'space') {
                if (this.travaMovimento) {
                    this.travaMovimento = false;
                    this.scene.restart();
                } else {
                    this.travaMovimento = true;
                }
            }
        });

        dialog.add(retangulo);

        const data = this.cache.json.get('falas');

        if (this.pos >= this.posFinal) { ///ultimo termina
            if (this.onDialogFinish) {
                this.onDialogFinish();
                this.onDialogFinish = null;
            }
            this.scene.stop();
            this.scene.resume(this.sceneActive);
        }

        const HTML = document.createElement('div');
        HTML.innerHTML = data[this.fala][this.pos];
        HTML.style = `border: 1px solid white;
            width: ${this.w * 0.77}px; height: ${this.h * 0.18}px;
            font: 1rem Arial;color: white;`;

        const text = this.add.dom(0, 0, HTML);

        text.setOrigin(0, 0);

        dialog.add(text);

        this.pos++;


    }

    criarMiniaturaEsquerda() {

    }
    criarMiniaturaDireita() {

    }

    equiparItem(slot, item) {
        if (slot.name.includes(item.tipo)) {
            const remove = this.config.inventario.indexOf(item.id)
            this.config.inventario.splice(remove, 1);
            if (this.config.players[this.config.playerActive].equip[slot.name] != null) {
                const aux = this.config.players[this.config.playerActive].equip[slot.name]
                this.config.inventario.push(aux);
            }
            this.config.players[this.config.playerActive].equip[slot.name] = item.id;
        }

    }
    desequiparItem(slot, item) {
        this.config.inventario.push(this.config.players[this.config.playerActive].equip[slot.name])
        this.config.players[this.config.playerActive].equip[slot.name] = null;

        console.log('ok')
    }
    carregarDesc(item) {
        const HTML = document.createElement('div');
        HTML.innerHTML = ITEMS.find(el => el.id == item.id).desc;
        HTML.style = `border: 1px solid white;
            width: ${this.w * 0.25}px; height: ${this.h * 0.28}px;
            font: 1rem Arial;color: white;`;
        if (this.desc) this.desc.destroy();
        document.getElementById('root').appendChild(HTML);
        this.desc = this.add.dom(this.w * 0.01, this.h * 0.4, HTML)
        this.desc.setOrigin(0, 0)

        this.groupSubMenu.add(this.desc);

    }
    carregarEquip(slots) {
        slots.forEach(slot => {
            let slotName = slot.name;

            if (this.config.players[this.config.playerActive].equip[slotName] != null) {
                const aux = this.config.players[this.config.playerActive].equip[slotName]

                const sprite = this.add.sprite(slot.x + slot.width / 2, slot.y + slot.height / 2, 'itens',
                    ITEMS.find(el => el.id == aux).sprite)
                    .setOrigin(0.5, 0.5)
                    .setInteractive({ draggable: true });
                sprite.id = aux;
                sprite.name = ITEMS.find(el => el.id == aux).name;
                sprite.tipo = slotName;
                this.groupSubMenu.add(sprite);
            }
        })

    }

}

