import React, {useContext} from "react"
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

export default function TournamentReports() {
    const { tournament, isOwner } = useContext(TournamentHomeContext);
    
    return (
        <div className="card">
            <div className="card-header">
                Finalized Match Summary
            </div>
            <div className="card-body">
                {tournament.Rounds.filter(r => r.finalized).map(r => {
                    let round_prefix = "Round "+r.round_num+": "
                    return r.Matches.map(m => {
                        let player1 = m.Players[0]
                        let player2 = m.Players[1]
                        //Player1 is always winner
                        if(!player1.win){
                            let tmp = player1
                            player1 = player2
                            player2 = tmp
                        }
                        let player1name = player1.player_name??player1.User?.name
                        let isBye = player2.User==null && player2.player_name===""
                        if(isBye){
                            return <p key={m.id} className="mb-0">{round_prefix+player1name+" ("+player1.points+") has BYE"}</p>
                        } else {
                            let player2name = player2.player_name??player2.User?.name
                            return <p key={m.id} className="mb-0">{round_prefix+player1name+" ("+player1.points+") def. "+player2name+" ("+player2.points+")"}</p>
                        }
                    })
                })}
            </div>
        </div>
    )
}