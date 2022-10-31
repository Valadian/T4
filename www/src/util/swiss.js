
import Query from "../data/T4GraphContext";

const playersDoc = `
query AllTournamentPlayers($tournament_id: uuid!) {
    TournamentPlayer(where: {Tournament: {id: {_eq: $tournament_id}}}) {
        id
        tournament_points
        club
        player_name
        user_id
        Matches(order_by: {Match: {Round: {round_num: asc}}}, where: {Match: {Round: {finalized: {_eq: true}}}}) {
            tournament_points
            TournamentOpponent {
                id
            }
        }
    }
}`
const insertMatchDoc = `
  mutation InsertMatch(
    $player1_name: String = "", 
    $player2_name: String = "", 
    $user1_id: String = null,
    $user2_id: String = null, 
    $tournament_user_id1: uuid!, 
    $tournament_user_id2: uuid = null, 
    $round_id: uuid = "", 
    $table_num: Int = null, 
    $player1_points: Int = null,
    $player1_mov: Int = null, 
    $player1_tp: Int = null,
    $player1_win: Boolean = null,
    $player2_points: Int = null,
    $player2_mov: Int = null, 
    $player2_tp: Int = null,
    $player2_win: Boolean = null,) {
      insert_Match(objects: {round_id: $round_id, table_num: $table_num, Players: {data: [
        {
            user_id: $user1_id, 
            player_name: $player1_name, 
            tournament_player_id: $tournament_user_id1, 
            tournament_opponent_id: $tournament_user_id2, 
            points: $player1_points, 
            opp_points: $player2_points, 
            mov: $player1_mov, 
            tournament_points: $player1_tp, 
            win: $player1_win
        },{
            user_id: $user2_id, 
            player_name: $player2_name, 
            tournament_player_id: $tournament_user_id2, 
            tournament_opponent_id: $tournament_user_id1, 
            points: $player2_points, 
            opp_points: $player1_points, 
            mov: $player2_mov, 
            tournament_points: $player2_tp, 
            win: $player2_win}]}}) {
        affected_rows
      }
    }
  `
function tournamentPlayersToMap(players){
    let playerMap = {}
    for(let p of players){
        playerMap[p.id] = p
    }
    return playerMap
}
function bakeTournamentPoints(players){
    for(let p of players){
        p.tournament_points = p.Matches.map(m => m.tournament_points).reduce((a,b)=>a+b,0)
    }
}
function sortByTournamentPoints(players){
    //Shuffle first to randomize equal values
    players = players
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    //Then sort by TP
    players.sort((a,b)=>b.tournament_points-a.tournament_points)
    return players
}
function filterValidOpponents(p, players){
    let opponents = players.filter(tp => tp.id!==p.id && !p.Matches.map(mp => mp.TournamentOpponent?.id).includes(tp.id))
    opponents.sort((a,b) =>  Math.abs(a.tournament_points-p.tournament_points) - Math.abs(b.tournament_points-p.tournament_points))
    return opponents.map(tp => tp.id)
}
async function generatePairings(tournament_id, round_id, accessToken, updateTournament){
    Query("AllTournamentPlayers", playersDoc, {
        tournament_id: tournament_id
    } ,accessToken)
    .then((response) => {
        if (response && response.TournamentPlayer){
            let players = response.TournamentPlayer
            let playerMap = tournamentPlayersToMap(players)
            bakeTournamentPoints(players)
            players = sortByTournamentPoints(players)
            let byes = []
            let edges = {}
            let vertices = players.map(tp => tp.id)
            let valid_paths = {}
            let matches = []
            let bye_match = null
            for(let p of players){
                let bye = p.Matches.filter(mp => mp.TournamentOpponent==null).length>0
                if (bye) {
                    byes.push(p.id)
                }
                valid_paths[p.id] = filterValidOpponents(p, players)
            }
            //TODO: IF ODD, handle bye
            if(players.length%2===1){
                let nobye_players = vertices.filter(v => !byes.includes(v))
                let next_bye = nobye_players[nobye_players.length-1]
                edges[next_bye]=null
                bye_match = [next_bye,null]
                console.log(next_bye,"BYE")
            }
            for(let v of vertices){
                if(v in edges){
                    continue
                }
                let found = false
                for(let valid of valid_paths[v]){
                    if(!(valid in edges)){
                        edges[v] = valid
                        edges[valid] = v
                        matches.push([v,valid])
                        console.log(v,valid)
                        found = true
                        break
                    }
                }
                if(!found){
                    console.log("No pairing found for: ",v)
                }
            }
            if(bye_match){
                matches.push(bye_match)
            }
            let table_num = 1
            for(let m of matches){
                let p1 = playerMap[m[0]]
                let p2 = playerMap[m[1]]
                let params = {
                    player1_name: p1.player_name,
                    user1_id: p1.user_id,
                    round_id: round_id,
                    table_num: table_num,
                    tournament_user_id1: p1.id
                }
                if(p2){
                    params['player2_name'] = p2.player_name
                    params['user2_id'] = p2.user_id
                    params['tournament_user_id2'] = p2.id
                } else {
                    params['player1_points'] = 140
                    params['player1_mov'] = 140
                    params['player1_tp'] = 8
                    params['player1_win'] = true
                    params['player2_points'] = 0
                    params['player2_mov'] = 0
                    params['player2_tp'] = 3
                    params['player2_win'] = false
                }
                Query("InsertMatch", insertMatchDoc, params ,accessToken)
                .then((data) => {
                    updateTournament()
                });
                table_num++
            }
        }
    });
}

export default generatePairings