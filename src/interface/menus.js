import { ITEMS } from "./item.js";

export class MenuCreator extends Phaser.Scene {
    constructor(config) {
        super("MenuCreator");
        this.id = "menuCreator";
        this.config = config;

        this.ui = 'settings';
    }
    preload() {
        this.load.image({key: 'espada', url: 'data/player/arminha.png'});
        //falas
        if(this.ui == 'dialog')
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
    menuSettings(){
        const box = this.add.rectangle(this.w*0.2, this.h*0.2,this.w*0.6, this.h*0.8, 0xfff0f0)
            .setScrollFactor(0, 0)
            .setOrigin(0, 0);
        
        const close = this.add.circle(this.w*0.6, this.h*0.2, 50, 0xff0000)
            .setScrollFactor(0, 0)   
            .setOrigin(0.5)         
            .setInteractive()
            .on('pointerup', ()=>{
                this.scene.resume('Cenario');
                this.scene.stop();
                
            })

        const botaoSalvar = this.add.text(box.width/2, box.height*0.40, "Salvar" , 
        { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                console.log("salvar");
                
            });
        const botaoCarregar = this.add.text(box.width/2, box.height*0.50, "Carregar" , 
        { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                console.log("salvar");
                
            });
        const botaoConfiguracoes = this.add.text(box.width/2, box.height*0.60, "Configurações" ,
        { fontSize: '5vmax', fill: '#1f5fc4', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                console.log("salvar");
                
            });

    }

    menuPlayerManager(){;
        this.groupMenu = this.add.container(this.w*0.05, this.h*0.05);
        const box = this.add.rectangle(0, 0,this.w*0.6, this.h*0.9, 0x1522ac)
            .setScrollFactor(0, 0)
            .setOrigin(0, 0)
            .setAlpha(0.6);
        this.groupMenu.add(box);    

        this.graphics.lineStyle(2, 0xffffff, 5);
        const quadro = this.graphics.strokeRect(0, 0, this.w*0.6, this.h*0.05);
        this.groupMenu.add(quadro);
        
        const close = this.add.circle(this.w*0.6, 0, 35, 0xff0000)
            .setScrollFactor(0, 0)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerup', ()=>{
                this.scene.resume('Cenario');
                this.scene.stop();
            });
        this.groupMenu.add(close);
        
        const inventarioBtn = this.add.text(this.w*0.11, this.h*0.025, "Inventario" , 
        { fontSize: '2vmax', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('inventario');
            });
        this.groupMenu.add(inventarioBtn);
            
        const statusBtn = this.add.text(this.w*0.22, this.h*0.025, "Status" , 
        { fontSize: '2vmax', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('status');
            });
        this.groupMenu.add(statusBtn);

        const historicoBtn = this.add.text(this.w*0.33, this.h*0.025, "Historico" , 
        { fontSize: '2vmax', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('historico');
            });
        this.groupMenu.add(historicoBtn);

        const questBtn = this.add.text(this.w*0.44, this.h*0.025, "Missoes" , 
        { fontSize: '2vmax', fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' })
            .setScrollFactor(0, 0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.playerMenu('quest');
            });
        this.groupMenu.add(questBtn);

       
    }
    playerMenu(submenu){
        
        this.groupSubMenu = this.add.container(this.w*0.05,this.h*0.1);
       
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(2, 0xffffff, 5);
        this.groupSubMenu.add(this.graphics.strokeRect(0, 0, this.w*0.6, this.h*0.85));
        
        switch (submenu){
            case 'inventario':
                const itens = this.add.container(0, 0);
                this.graphics.lineStyle(2, 0xffffff, 5);
                this.groupSubMenu.add(
                    this.graphics.strokeRect(15, 15, 250, 250)
                );
                ITEMS.forEach((item,ind) => {
                    const pox = (20+40*(ind%6));
                    const poy = (20+40*(ind%6 == 0?ind/6:Math.floor(ind/6)));

                    const botao = this.add.sprite(pox,poy, item.sprite)
                        .setScrollFactor(0,0)
                        .setOrigin(0)
                        .setInteractive({ draggable: true })
                    botao.name = item.name;
                    botao.type = item.type;

                    
                    itens.add(botao);
                });
                this.input.on('dragstart', function (pointer, gameObject) {
                    gameObject.posOriginX = gameObject.x;
                    gameObject.posOriginY = gameObject.y;
                });
                this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                    gameObject.x = dragX;
                    gameObject.y = dragY;
                })
                this.input.on('dragend', ((pointer, gameObject) => {
                    gameObject.x = gameObject.posOriginX;
                    gameObject.y = gameObject.posOriginY;
                }));

                this.groupSubMenu.add(itens);


                //Slots
                itens.add(this.graphics.strokeRect(this.w*0.4, this.h*0.05, 40, 40))
                itens.add(this.graphics.strokeRect(this.w*0.4, this.h*0.15, 40, 40))   



                break;
            case 'status':
                
                break;
            case 'historico':
                break;
            case 'quest':
                break;    
        }

        
        
    }

    menuDialog(){
        this.travaMovimento = false;
        const dialog = this.add.container(this.w*0.1, this.h*0.7);

        const retangulo = this.add.rectangle(0, 0, this.w*0.8, this.h*0.25, 0x1522ac)
        retangulo.setOrigin(0,0);
        retangulo.setInteractive();
        retangulo.on('pointerup', ()=>{
            if(this.travaMovimento){
                this.scene.restart();
            }else{
                this.travaMovimento = true;
            }
                
                
            });
        this.input.keyboard.on('keyup', (input) => {
                if(input.key == 'x' || input.key == 'space'){
                    if(this.travaMovimento){
                        this.travaMovimento = false;
                        this.scene.restart();
                    }else{
                        this.travaMovimento = true;
                    }
                }
            });

        dialog.add(retangulo);

        const data = this.cache.json.get('falas');
        
        if(this.pos >= this.posFinal){ ///ultimo termina
            this.scene.stop();
            this.scene.resume('Cenario');
        } 

        const text = this.add.dom(
            0 ,0 , 'div',
            `border: 1px solid white;
             width: ${this.w*0.77}px; height: ${this.h*0.18}px;
              font: 2vmax Arial;color: white;
            `,
            data[this.fala][this.pos]);
        text.setOrigin(0,0);
        
        dialog.add(text);

        this.pos++;

    }

    criarMiniaturaEsquerda(){

    }
    criarMiniaturaDireita(){

    }

}

