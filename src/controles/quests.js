export const progressJSON = {
    "quests": [
        {
            "pos": 0,
            "name": "inicio",
            'tipoTrigger': 'scenario',
            "trigger": "entrada",
            "interacoes": [{
                "tipo": "falas",
                "dialog": "quest1",
                "pos": 0,
                "posFinal": 1
            }]
        },
        {
            "pos": 1,
            "name": "Entre na Mansão",
            'tipoTrigger': 'scenario',
            "trigger": "mansao",
            "interacoes": [{
                "tipo": "movimento",
                "target": "player",
                "posFinal": {
                    "x": 800,
                    "y": 832
                },
            }, {
                "tipo": "falas",
                "dialog": "quest1",
                "pos": 5,
                "posFinal":6
            }]
        },
        {
            "pos": 2,
            "name": "Quem é esse estranho na sala",
            'tipoTrigger': 'activeContact',
            "trigger": "npcMissao4",
            "interacoes": [{
                "tipo": "falas",
                "dialog": "npcMissao4",
                "pos": 0,
                "posFinal": 5
            }, {
                "tipo": "bossFight",
                "mapa": "bossFight1",
                "posFinal": 5
            }]
        },
        {
            "pos": 2,
            "name": 'Explore a mansao e descubra o que esta acontecendo',
            "tipoTrigger": 'activeContact',
            "trigger": 'bauN2',
            "interacoes": [{
                "tipo": 'falas',
                "dialog": 'quest1',
                "pos": 6,
                "posFinal": 8
            }]
        },
        {
            "pos": 5,
            "name": "fim",
            'tipoTrigger': null,
        }
    ]
}

/*

{
    "pos": 2,
    "name": 'procure o bau com a Espada',
    "tipoTrigger": 'activeContact',
    "trigger": 'bauN1',
    "interacoes": [{
        "tipo": 'falas',
        "dialog": 'quest1',
        "pos": 6,
        "posFinal": 8
    }]
},
{
    "pos": 3,
    "name": "Cheque novamentes os baus",
    'tipoTrigger': 'activeContact',
    "trigger": "bauN1",
    "interacoes": [{
        "tipo": "item",
        "id": "Q2",
        "itemCode": 11
    }, {
        "tipo": "falas",
        "dialog": "quest1",
        "pos": 8,
        "posFinal": 10
    }]
},
*/