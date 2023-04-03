import React, {useContext} from "react"
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

export default function TournamentReports() {
    const { tournament, isOwner, config } = useContext(TournamentHomeContext);
    
    return (
        <>
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
                            return <p key={m.id} className="mb-0">{round_prefix+player1name+" ("+player1.points+" ["+player1.tournament_points+"]) has BYE"}</p>
                        } else {
                            let player2name = player2.player_name??player2.User?.name
                            return <p key={m.id} className="mb-0">{round_prefix+player1name+" ("+player1.points+" ["+player1.tournament_points+"]) def. "+player2name+" ("+player2.points+" ["+player2.tournament_points+"])"}</p>
                        }
                    })
                })}
            </div>
        </div>
        <br/>
        <div className="card">
            <div className="card-header">
                Ladder Export (paste into spreadsheet, then text to columns)
            </div>
            <div className="card-body">
                rank,name,win,loss,{config.LADDER_COLS[0][1].join(",")},{config.LADDER_COLS[1][1].join(",")},club
            {tournament?.Ladder?.map((p) => {
                let player1name = p.player_name??p.User?.name
                return <div key={p.id} className="mb-0">{p.rank},{player1name},{p.win},{p.loss},{config.LADDER_COLS.map(col => col[1].map(attr => p[attr]).join(",")).join(",")},{p.club??"N/A"}</div>
            })}
            </div>
        </div>
        </>
    )
}