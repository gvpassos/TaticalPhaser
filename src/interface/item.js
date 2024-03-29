export const ITEMS = [
    {
        id:0,
        name: 'Potion Health',
        sprite: 0,
        type: 'consumable',
        desc:' Pocao de vida restaura 20 de Vida.',
    },
    {
        id:1,
        name: 'Potion Stamina',
        sprite: 1,
        type: 'consumable',
        desc:' Pocao de vida restaura 20 de Vida.',
    },
    {
        id:2,
        name: 'Potion Mana',
        sprite: 5,
        type: 'consumable',
        desc:' Pocao de Mana restaura 10 de Mana.',
    },
    {
        id:3,
        name: 'Botas',
        sprite: 16,
        type: 'legs',
        desc:' Calcados fornecem uma boa protecao para os pernas',
    },
    {
        id:4,
        name: 'Luvas',
        sprite: 18,
        type: 'hands',
        desc:' Luvas fornecem uma boa protecao para as luvas',
    },
    {
        id:5,
        name: 'Armadura',
        sprite: 24,
        type: 'body',
        desc:' Armadura fornecem uma boa protecao para o corpo',
    },
    {
        id:6,
        name: 'anel',
        sprite: 26,
        type: 'acessories',
        desc:' Anel sem nenhum tipo de efeito',
        type:"none"
    },
    {
        id:7,
        name: 'espada',
        sprite: 41,
        type: 'weapon',
        anim:'Melee',
        desc:' Espada velha',
        damage:2,
    },
    {
        id:8,
        name: 'cajado',
        sprite: 46,
        type: 'weapon',
        anim:'Spear',
        desc:' Cajado velho',
        damage:1
    },
    {
        id:9,
        name: 'livro',
        sprite: 51,
        type: 'acessories',
        desc:' Livro sem nenhum tipo de efeito',
    },
    {
        id:10,
        name: 'Chave',
        sprite: 12,
        type: 'keyItems',
        desc:'Chave comum que deve abrir uma porta',
    },
    {
        id:11,
        name: 'Arco',
        sprite: 43,
        type: 'weapon',
        anim:'Arrow',
        desc:'Arco velho',
        damage:2
    },
    {
        id:12,
        name: 'Anel da Forca',
        sprite: 26,
        type: 'acessories',
        desc:' Usar esse anel aumenta o atributo de ataque',
        type:"status",
        effect: {damage:5,mana:-1}
        
    },
];
    
