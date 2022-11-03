export class User {
    id = null
    name = ""
    email = ""
}

export class Game {
    key = ""
    value = ""
}

export class ScoringRuleset {
    if = null
    name = ""
}

export class Tournament {
    id = null
    name = ""
    location = ""
    start = Date.now()
    Ladder_aggregate = {
        aggregate: {
        count:0
        }
    }
    Game = new Game()
    Creator = new User()
    ScoringRuleset = new ScoringRuleset()
    Ladder = []
    Rounds = []
}