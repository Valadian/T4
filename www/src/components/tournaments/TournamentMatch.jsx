import React, {useContext, useState, useEffect} from "react"
import { Col, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../../data/T4GraphContext";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import TournamentColoredText from "./TournamentColoredText";

const swapDoc = `
mutation SwapPlayers($id1: uuid!, $match_id1: uuid!, $id2: uuid!, $match_id2: uuid!, $tournament_opponent_id1: uuid = null, $tournament_opponent_id2: uuid = null, $tournament_player_id1: uuid = null, $tournament_player_id2: uuid = null) {
    update1: update_MatchPlayer(where: {match_id: {_eq: $match_id1}, id: {_neq: $id1}}, _set: {tournament_opponent_id: $tournament_player_id2}) {
        affected_rows
    }
    
    update2: update_MatchPlayer(where: {match_id: {_eq: $match_id2}, id: {_neq: $id2}}, _set: {tournament_opponent_id: $tournament_player_id1}) {
        affected_rows
    }

    update3: update_MatchPlayer_by_pk(pk_columns: {id: $id1}, _set: {match_id: $match_id2, tournament_opponent_id: $tournament_opponent_id2}) {
        id
    }
    update4: update_MatchPlayer_by_pk(pk_columns: {id: $id2}, _set: {match_id: $match_id1, tournament_opponent_id: $tournament_opponent_id1}) {
        id
    }
}
`
const updateDoc = `
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean = null, $draw: Boolean = null, $mov: numeric = 0) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, draw: $draw, mov: $mov}) {
        id
    }
}` 
const deleteDoc = `
mutation deleteMatch($id: uuid!) {
    delete_Match_by_pk(id: $id) {
        id
    }
}`
const assignDoc = `
mutation AssignPlayer($ladder_name: String = null, $ladder_user_id: String = null, $id: uuid!, $match_id: uuid!, $tournament_player_id: uuid!) {
    update1: update_MatchPlayer(where: {match_id: {_eq: $match_id}, id: {_neq: $id}}, _set: {tournament_opponent_id: $tournament_player_id}) {
        affected_rows
    }
    
    update2: update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {player_name: $ladder_name, user_id: $ladder_user_id, tournament_player_id: $tournament_player_id}) {
        id
    }
}`
const withdrawDoc = `
mutation WithdrawPlayer($id: uuid!, $disqualified: Boolean = true) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {disqualified: $disqualified, tournament_points: 0, mov: 0, win: false}) {
        id
        disqualified
    }
}`
export default function TournamentMatch({ match, round, swapping, setSwapping, swapTarget, setSwapTarget}){
    const { getAccessTokenSilently } = useAuth0();
    const {updateTournament, isOwner, config} = useContext(TournamentHomeContext);
    const [editing, setEditing] = useState(false)
    const [player1Pts, setPlayer1Pts] = useState(0)
    const [player2Pts, setPlayer2Pts] = useState(0)
    const [player1Win, setPlayer1Win] = useState(true)
    // const [player2Win, setPlayer2Win] = useState(true)
    const [playersDraw, setPlayersDraw] = useState(false)

    var player1 = match.Players[0]
    var player2 = match.Players[1]

    var player2IsNotPlayer = !(player2.User || (player2.player_name && player2.player_name!==""))
    if(player2IsNotPlayer){
        player1 = match.Players[1]
        player2 = match.Players[0]
    }
    const allowDrop = (ev) => ev.preventDefault();
    const dragPlayer = (e,player) => e.dataTransfer.setData("player",JSON.stringify({
        'id':player.id,
        'tournament_opponent_id':player.tournament_opponent_id,
        'tournament_player_id':player.tournament_player_id,
        'match_id':player.match_id,
        'player_name':player.player_name,
        'User':player.User
    }));
    const assign = async (tp1, p2) => {
        const accessToken = await getAccessTokenSilently()
        //let omp = MatchPlayer.OpponentMatchPlayer(p2);
        Query("AssignPlayer", assignDoc, { 
            ladder_name: tp1.player_name, 
            ladder_user_id: tp1.User?.id,
            id: p2.id,
            match_id: p2.match_id,
            // id2: omp?.id,
            // tournament_opponent_id: omp?.tournament_player_id,
            tournament_player_id: tp1.id },accessToken)
        .then((response) => {
            updateTournament();
        })
    }
    const swap = async (p1, p2) => {
        if(p1.match_id===p2.match_id){
            return
        } else {
            const accessToken = await getAccessTokenSilently()
            Query("SwapPlayers", swapDoc, { 
                id1: p1.id, 
                match_id1: p1.match_id,
                tournament_opponent_id1: p1.tournament_opponent_id,
                tournament_player_id1: p1.tournament_player_id,
                id2: p2.id, 
                match_id2: p2.match_id,
                tournament_opponent_id2: p2.tournament_opponent_id,
                tournament_player_id2: p2.tournament_player_id },accessToken)
            .then((response) => {
                updateTournament();
            })
        }
    }
    const disqualify = async (id, dq) => {
        const accessToken = await getAccessTokenSilently()
        Query("WithdrawPlayer", withdrawDoc, { 
            id: id, 
            disqualified: dq},accessToken)
        .then((response) => {
            updateTournament();
        })
    }
    useEffect(() => {
        let p1Win = config.WIN_SCORING(+player1Pts,+player2Pts)
        let draw = config.DRAW_SCORING(+player1Pts,+player2Pts)
        if(draw){
            p1Win = false
        }
        setPlayer1Win(p1Win??(draw?false:true))
        setPlayersDraw(draw)
    },[player1Pts,player2Pts,config])

    const assignOrSwap = (from, to) => {
        if (from.match_id==null) {
            if (to.User==null && (to.player_name==null || to.player_name==="")) {
                assign(from, to);
            }
        } else {
            swap(from, to);
        }
    }
    const handleDropPlayer = (e, to) => {
        var from = JSON.parse(e.dataTransfer.getData("player"))
        assignOrSwap(from, to)
    }
    const edit = () => {
        setEditing(true)
        setPlayer1Pts((player1?.points)??(player2?.opp_points)??0)
        setPlayer2Pts((player2?.points)??(player1?.opp_points)??0)
        setPlayer1Win((player1?.win)??true)
        // setPlayer2Win((player2?.win)??false)
        setPlayersDraw((player1?.draw)??false)
    }
    const MatchPlayerBg = (mp) => {
        if(mp.TournamentPlayer===undefined) {return ""}
        if(mp.draw) { return " roundDraw" }
        if(mp.win==null) { return ""}
        else if(mp.win) {return " roundWin"}
        else {return " roundLoss"}
    }
    // const notNullAndEqual = (v1,v2) => v1!=null && v2!=null && v1===v2
    const notNullAndNotEqual = (v1,v2) => v1!=null && v2!=null && v1!==v2
    
    const save = async (player1Pts, player2Pts, player1Win, playersDraw) => {
        player1.points = +(player1.disqualified?0:(player2.disqualified?Math.max(config.CONCESSION_POINTS,player1Pts):player1Pts))
        player1.opp_points = +(player2.disqualified?0:(player1.disqualified?Math.max(config.CONCESSION_POINTS,player2Pts):player2Pts))
        player1.mov = config.MOV_SCORING(player1.points,player1.opp_points)
        player1.win = player1.disqualified?false:(playersDraw?false:player1Win)
        player1.draw = player1.disqualified?false:playersDraw
        player1.tp = player1.disqualified?0:config.TP_SCORING(player1.points,player1.opp_points,player1.win,player1.draw)
        player2.points = +(player2.disqualified?0:(player1.disqualified?Math.max(config.CONCESSION_POINTS,player2Pts):player2Pts))
        player2.opp_points = +(player1.disqualified?0:(player2.disqualified?Math.max(config.CONCESSION_POINTS,player1Pts):player1Pts))
        player2.mov = config.MOV_SCORING(player2.points,player2.opp_points)
        player2.win = player2.disqualified?false:(playersDraw?false:!player1Win)
        player2.draw = player2.disqualified?false:playersDraw
        player2.tp = player2.disqualified?0:config.TP_SCORING(player2.points,player2.opp_points,player2.win,player2.draw)

        
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: player1.id,
            points: player1.points,
            opp_points: player1.opp_points,
            mov: player1.mov,
            tournament_points: player1.tp,
            win: player1.win,
            draw: player1.draw
        },accessToken)
        .then(() => Query("updateMatchPlayer", updateDoc, {
            id: player2.id,
            points: player2.points,
            opp_points: player2.opp_points,
            mov: player2.mov,
            tournament_points: player2.tp,
            win: player2.win,
            draw: player2.draw
        },accessToken))
        .then(() => {
            updateTournament();
        })
        .then(() => {
            setEditing(false);
        });
    }
    const cancel = () => {
        setEditing(false)
    }
    const deleteMatch = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("deleteMatch", deleteDoc, {
            id: match.id
        },accessToken)
        .then(() => {
            updateTournament();
        })
        .then(() => {
            setEditing(false);
        });
    }
    const wipe = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: player1.id,
            points: null,
            opp_points: null,
            mov: null,
            tournament_points: null,
            win: null
        },accessToken)
        .then(() => Query("updateMatchPlayer", updateDoc, {
            id: player2.id,
            points: null,
            opp_points: null,
            mov: null,
            tournament_points: null,
            win: null
        },accessToken))
        .then(() => {
            updateTournament();
        })
        .then(() => {
            setEditing(false);
        });
    }
    const CheckAndSetSwapTarget = (player) => {
        if(player===swapTarget){
            setSwapTarget(null)
        } else if(swapTarget){
            if(player.Match && swapTarget.Match && player.Match.round_id!==swapTarget.Match.round_id){
                console.log("Why are you swapping between rounds. I can't let you do that Dave.")
                setSwapTarget(null)
                setSwapping(false)
                return
            }
            assignOrSwap(swapTarget, player)
            setSwapTarget(null)
            setSwapping(false)
        } else {
            setSwapTarget(player)
        }
    }
    const AutoScoreBye = () => {
        save(0, config.BUY_POINTS, false, false)
    }
    const PlayerColumns = ({player,opponent,playerPts,setPlayerPts,getPlayerWin,setPlayerWin,playersDraw,setPlayersDraw}) => {
        var isPlayer = player.User || (player.player_name && player.player_name!=="")
        var playerEmpty = player.TournamentPlayer===undefined
        var playerDraggable = isPlayer && player?.points===null
        var playerDragTargetable = player?.points===null
        var showSwapButton = playerDraggable || (swapTarget && player?.points===null && swapTarget.match_id!==player?.match_id)
        return <>
            <Col xs={5} sm={7} md={6} lg={3} className={"pb-3 paddedLikeInput"+(playerDraggable?" draggablePlayer":"")+MatchPlayerBg(player)+(player.disqualified?" withdrawn":"")+(player===swapTarget?" swapping":"")} 
                draggable={playerDraggable?"true":"false"}  
                onDragStart={playerDraggable?(e) => dragPlayer(e,player):()=>{}} 
                onDragOver={playerDragTargetable?(e) => allowDrop(e):()=>{}} 
                onDrop={playerDragTargetable?e => handleDropPlayer(e,player):()=>{}}>
                <TournamentPlayerName player={player} />
                {(!swapping && playerEmpty && player.points===null && player.tournament_opponent_id)?<>&nbsp;<button className="btn btn-sm btn-success" onClick={AutoScoreBye}>Auto-Score</button></>:<></>}
                {(swapping && showSwapButton)?<>&nbsp;<button className="btn btn-sm btn-warning" onClick={() => CheckAndSetSwapTarget(player)}><i className="bi bi-arrow-left-right"></i></button></>:<></>}
            </Col>
            <Col xs={5} sm={3} md={3} lg={2} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player)+(player.disqualified?" withdrawn":"")+(editing?" ps-0":"")}>
                {playerEmpty?"":(editing?
                <div className="input-group">
                    <input className="form-control" value={playerPts} onFocus={(event) => event.target.select()} onChange={(evt) => setPlayerPts(evt.target.value)}></input>
                    <button tabIndex="-1" className={"btn btn-sm "+((getPlayerWin()&&!playersDraw)?"btn-warning":"btn-outline-secondary")} type="button" onClick={() => {setPlayerWin(v => !v)}}>
                        {playersDraw?"=":<i className="bi bi-trophy-fill" title="win"></i>}</button>
                    <button tabIndex="-1" className={"btn btn-sm "+(player.disqualified?"btn-danger":"btn-outline-danger")} type="button" onClick={() => disqualify(player.id, !player.disqualified)}><i className="bi bi-slash-circle" title="disqualify"></i></button>
                </div>:
                <>
                <TournamentColoredText value={player?.points} min={0} max={config.MAX_POINTS} />
                {player?.points===null && opponent?.opp_points!==null?<span className="text-muted" title="Opponent Reported Value">({opponent?.opp_points})</span>:<></>}
                {notNullAndNotEqual(player?.points,opponent?.opp_points)?<span className="text-danger" title="Opponent Reported Value">({opponent?.opp_points})</span>:<></>}
                </>)}
            </Col>
            <Col xs={2} sm={2} md={3} lg={1} className={"col-r-border pb-3 paddedLikeInput"+MatchPlayerBg(player)+(player.disqualified?" withdrawn":"")}>
                {playerEmpty?"":<TournamentColoredText value={player?.tournament_points} min={config.MIN_TPS} max={config.MAX_TPS}/>}
            </Col>
        </>
    }
    if(isOwner){
        return (
        <Row className={"roundRow"+(editing?" editing":"")}>
            <Col className="col-1">{match.table_num}</Col>
            <Col className="col-10">
                <Row className="h-100">
                    {PlayerColumns({player:player1,opponent:player2,playerPts:player1Pts,setPlayerPts:setPlayer1Pts,getPlayerWin:() => player1Win,setPlayerWin:setPlayer1Win,playersDraw:playersDraw,setPlayersDraw:(v) => {if(v){setPlayer1Win(false)};setPlayersDraw(v)}})}
                    {PlayerColumns({player:player2,opponent:player1,playerPts:player2Pts,setPlayerPts:setPlayer2Pts, getPlayerWin:() => !player1Win,setPlayerWin:(v) => setPlayer1Win(!v),playersDraw:playersDraw,setPlayersDraw:(v) => {if(v){setPlayer1Win(false)};setPlayersDraw(v)}})}
                </Row>
            </Col>
            <Col className="col-1 p-0">
                {editing?
                <>
                    <button tabIndex="-1" className="btn btn-outline-primary" onClick={cancel} title="Cancel Edit"><i className="bi bi-pen"></i></button>
                    <button className="btn btn-outline-success" onClick={() => save(player1Pts,player2Pts,player1Win,playersDraw)} title="Save Scores"><i className="bi bi-check-square"></i></button>
                    <button tabIndex="-1" className="btn btn-outline-warning" onClick={wipe} title="Wipe Scores"><i className="bi bi-recycle"></i></button>
                    <button tabIndex="-1" className="btn btn-danger" onClick={deleteMatch} title="Delete Match"><i className="bi bi-trash-fill"></i></button>
                </>:
                !round.finalized?
                    <button className="btn btn-outline-primary" onClick={edit} title="Edit Scores"><i className="bi bi-pen"></i></button>:
                    <></>
                }
                
            </Col>

        </Row>
        )
    } else {
        let player1empty = player1.tournament_player_id===null
        let player2empty = player2.tournament_player_id===null
        return (
            <Row className="roundRow">
                <Col xs={1}>{match.table_num}</Col>
                <Col xs={isOwner?10:11}>
                    <Row>
                        <Col xs={5} sm={7} md={6} lg={4} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player1)}>
                            <TournamentPlayerName player={player1} />
                        </Col>
                        <Col xs={5} sm={3} md={3} lg={1} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player1)}>
                            {player1empty?"":<TournamentColoredText value={player1?.points} min={0} max={config.MAX_POINTS}/>}
                        </Col>
                        <Col xs={2} sm={2} md={3} lg={1} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player1)}>
                            {player1empty?"":<TournamentColoredText value={player1?.tournament_points} min={config.MIN_TPS} max={config.MAX_TPS}/>}
                        </Col>
                        <Col xs={5} sm={7} md={6} lg={4} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player2)}>
                            <TournamentPlayerName player={player2} />
                        </Col>
                        <Col xs={5} sm={3} md={3} lg={1} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player2)}>
                            {player2empty?"":<TournamentColoredText value={player2?.points} min={0} max={config.MAX_POINTS}/>}
                        </Col>
                        <Col xs={2} sm={2} md={3} lg={1} className={"pb-3 paddedLikeInput"+MatchPlayerBg(player2)}>
                            {player2empty?"":<TournamentColoredText value={player2?.tournament_points} min={config.MIN_TPS} max={config.MAX_TPS}/>}
                        </Col>
                    </Row>
                </Col>
                <Col xs={isOwner?1:0} md={isOwner?1:0}></Col>
            </Row>
            )
    }
}