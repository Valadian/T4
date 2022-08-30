export class User {
    id = null
    name = ""
    email = ""
}

export class Game {
    value = ""
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
}