export const progressJSON = {
    "quests": [
        {
            "pos": 0,
            "name": "quest 1",
            'tipoTrigger': 'scenario',
            "trigger": "entrada",
            "interacoes": {
                "tipo": "falas",
                "dialog": "quest1",
                "pos": 0,
                "posFinal": 5
            }
        },
        {
            "pos": 1,
            "name": "quest 1.1",
            'tipoTrigger': 'scenario',
            "trigger": "mansao",
            "interacoes": {
                "tipo": "falas",
                "dialog": "quest1",
                "pos": 5,
                "posFinal": 6
            }
        },
        {
            "pos": 2,
            "name": "quest 2",
            'tipoTrigger': 'activeContact',
            "trigger": "bauN1",
            "interacoes": {
                "tipo": "falas",
                "dialog": "quest1",
                "pos": 6,
                "posFinal": 8
            }
        },
        {
            "pos": 3,
            "name": "fim",
            'tipoTrigger': null,
        }
    ]
}