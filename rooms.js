var rooms = {
    "start": {
        "description": "Вы проснулись в старой хижине, где нет ничего, кроме кромешной тьмы, голых стен и мертвецкой тишины \ " +
        " вы можете пойти на север(<b>north</b>) или нахуй",
        "directions": {
            "north": "basement",
            "west": "bridge",
            "east": "lighthouse"
        }
    },
    "basement": {
        "description": "Вы оказались в подвале, в котором, по какой-то странной причине, светлее чем в хиженее",
        "directions": {
            "north": "start"
        },
        "items": {
            "strange eye": "Это... это глаз?"
        }
    },
    "lighthouse": {
        "description": "Вы находитесь возле старого маяка",
        "directions": {
            "south": "clearing"
        }
    },
    "bridge": {
        "description": "Вы находитесь на мосту",
        "directions": {
            "east": "start"
        }
    }
}