import React, {useContext, useState, useEffect} from "react"
import { Col, NavItem, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../../data/T4GraphContext";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import ptsToTp from "../../util/armada"

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
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean!, $mov: Int!) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, mov: $mov}) {
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
export default function TournamentMatch(props){
    const { user, getAccessTokenSilently } = useAuth0();
    const {updateTournament, isOwner} = useContext(TournamentHomeContext);
    const [editing, setEditing] = useState(false)
    const [player1Pts, setPlayer1Pts] = useState(0)
    const [player2Pts, setPlayer2Pts] = useState(0)
    const [player1Win, setPlayer1Win] = useState(true)

    var player1 = props.match.Players[0]
    var player2 = props.match.Players[1]
    const allowDrop = (ev) => ev.preventDefault();
    const dragPlayer1 = (e) => e.dataTransfer.setData("player",JSON.stringify(player1));
    const dragPlayer2 = (e) => e.dataTransfer.setData("player",JSON.stringify(player2));
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
        const accessToken = await getAccessTokenSilently()
        Query("SwapPlayers", swapDoc, { 
            id1: p1.id, 
            match_id1: p1.match_id,
            tournament_opponent_id1: p1.TournamentOpponent.id,
            tournament_player_id1: p1.TournamentPlayer.id,
            id2: p2.id, 
            match_id2: p2.match_id,
            tournament_opponent_id2: p2.TournamentOpponent.id,
            tournament_player_id2: p2.TournamentPlayer.id },accessToken)
        .then((response) => {
            updateTournament();
        })
    }
    useEffect(() => {
        if(+player1Pts>+player2Pts){
            setPlayer1Win(true)
        }
        if(+player1Pts<+player2Pts){
            setPlayer1Win(false)
        }
    },[player1Pts,player2Pts])

    const handleDropPlayer1 = (e) => {
        var from = JSON.parse(e.dataTransfer.getData("player"))
        var to = player1
        if (from.match_id==null) {
            if (to.player_name==null && to.User==null) {
                assign(from, to);
            }
        } else {
            swap(from, to);
        }
        //console.log("Swapping: "+JSON.parse(e.dataTransfer.getData("player"))?.player_name+" for: "+player1?.player_name)
    }
    const handleDropPlayer2 = (e) => {
        var from = JSON.parse(e.dataTransfer.getData("player"))
        var to = player2
        if (from.match_id==null) {
            if (to.player_name==null && to.User==null) {
                assign(from, to);
            }
        } else {
            swap(from, to);
        }
        //console.log("Swapping: "+JSON.parse(e.dataTransfer.getData("player"))?.player_name+" for: "+player2?.player_name)
    }
    const edit = () => {
        setEditing(true)
        setPlayer1Pts((player1?.points)??(player2?.opp_points)??0)
        setPlayer2Pts((player2?.points)??(player1?.opp_points)??0)
        setPlayer1Win((player1?.win)??true)
    }
    const MatchPlayerBg = (mp) => {
        if(mp.win==null) { return ""}
        else if(mp.win) {return " roundWin"}
        else {return " roundLoss"}
    }
    const notNullAndEqual = (v1,v2) => v1!=null && v2!=null && v1===v2
    const notNullAndNotEqual = (v1,v2) => v1!=null && v2!=null && v1!==v2
    
    const save = async () => {
        player1.points = player1Pts
        player1.opp_points = player2Pts
        player1.mov = Math.min(400,Math.max(0,player1.points-player1.opp_points))
        player1.win = player1Win
        player1.tp = ptsToTp(player1.points,player1.opp_points,player1.win)
        player2.points = player2Pts
        player2.opp_points = player1Pts
        player2.mov = Math.min(400,Math.max(0,player2.points-player2.opp_points))
        player2.win = !player1Win
        player2.tp = ptsToTp(player2.points,player2.opp_points,player2.win)

        
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: player1.id,
            points: player1.points,
            opp_points: player1.opp_points,
            mov: player1.mov,
            tournament_points: player1.tp,
            win: player1.win
        },accessToken)
        .then(() => Query("updateMatchPlayer", updateDoc, {
            id: player2.id,
            points: player2.points,
            opp_points: player2.opp_points,
            mov: player2.mov,
            tournament_points: player2.tp,
            win: player2.win
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
            id: props.match.id
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
    //TODO: Handle null player 2 (Buy)
    if(isOwner){
        return (
        <Row className="roundRow">
            <Col className="col-1">{props.match.table_num}</Col>
            <Col className="col-9 col-md-10">
                <Row className="h-100">
                    <Col className={"draggablePlayer col-7 col-sm-8 col-lg-4 pb-3 paddedLikeInput"+MatchPlayerBg(player1)} draggable="true"  onDragStart={dragPlayer1} onDragOver={e => allowDrop(e)} onDrop={e => handleDropPlayer1(e)}>
                        <TournamentPlayerName player={player1} />
                    </Col>
                    <Col className={"col-5 col-sm-4 col-lg-2 col-r-border pb-3 paddedLikeInput"+MatchPlayerBg(player1)}>
                        {editing?
                        <div className="input-group">
                            <input className="form-control bg-dark text-white" value={player1Pts} onChange={(evt) => setPlayer1Pts(evt.target.value)}></input>
                            <button className={"btn "+(player1Win?"btn-warning":"btn-outline-secondary")} type="button" onClick={() => setPlayer1Win(true)}><i className="bi bi-trophy-fill" title="win"></i></button>
                        </div>:
                        <>
                        {player1?.points}
                        {player1?.points===null && player2?.opp_points!==null?<span className="text-muted" title="Opponent Reported Value">({player2?.opp_points})</span>:<></>}
                        {notNullAndNotEqual(player1?.points,player2?.opp_points)?<span className="text-danger" title="Opponent Reported Value">({player2?.opp_points})</span>:<></>}
                        </>}
                    </Col>
                    <Col className={"draggablePlayer col-7 col-sm-8 col-lg-4 pb-3 paddedLikeInput"+MatchPlayerBg(player2)} draggable="true"  onDragStart={dragPlayer2} onDragOver={e => allowDrop(e)} onDrop={e => handleDropPlayer2(e)}>
                        <TournamentPlayerName player={player2} />
                    </Col>
                    <Col className={"col-5 col-sm-4 col-lg-2 pb-3 paddedLikeInput"+MatchPlayerBg(player2)}>
                        {editing?
                        <div className="input-group">
                            <input className="form-control bg-dark text-white" value={player2Pts} onChange={(evt) => setPlayer2Pts(evt.target.value)}></input>
                            <button className={"btn "+(player1Win?"btn-outline-secondary":"btn-warning")} type="button" onClick={() => setPlayer1Win(false)}><i className="bi bi-trophy-fill" title="win"></i></button>
                        </div>:
                        <>
                        {player2?.points}
                        {player2?.points===null && player1?.opp_points!==null?<span className="text-muted" title="Opponent Reported Value">({player1?.opp_points})</span>:<></>}
                        {notNullAndNotEqual(player2?.points,player1?.opp_points)?<span className="text-danger" title="Opponent Reported Value">({player1?.opp_points})</span>:<></>}
                        
                        </>}
                    </Col>
                </Row>
            </Col>
            <Col className="col-2 col-md-1">
                {editing?
                <>
                    <a className="btn btn-outline-primary" onClick={cancel} title="Cancel Edit"><i className="bi bi-pen"></i></a>
                    <a className="btn btn-outline-success" onClick={save} title="Save Scores"><i className="bi bi-check-square"></i></a>
                    <a className="btn btn-outline-danger" onClick={wipe} title="Wipe Scores"><i className="bi bi-recycle"></i></a>
                    <a className="btn btn-danger" onClick={deleteMatch} title="Delete Match"><i className="bi bi-trash-fill"></i></a>
                </>:
                !props.round.finalized?
                    <a className="btn btn-outline-primary" onClick={edit} title="Edit Scores"><i className="bi bi-pen"></i></a>:
                    <></>
                }
                
            </Col>

        </Row>
        )
    } else {
        return (
            <Row className="roundRow">
                <Col className="col-1">{props.match.table_num}</Col>
                <Col className="col-9 col-md-10">
                    <Row>
                        <Col className={"col-7 col-sm-8 col-lg-4 pb-3 paddedLikeInput"+MatchPlayerBg(player1)}><TournamentPlayerName player={player1} /></Col>
                        <Col className={"col-5 col-sm-4 col-lg-2 pb-3 paddedLikeInput"+MatchPlayerBg(player1)}>{player1?.points}</Col>
                        <Col className={"col-7 col-sm-8 col-lg-4 pb-3 paddedLikeInput"+MatchPlayerBg(player2)}><TournamentPlayerName player={player2} /></Col>
                        <Col className={"col-5 col-sm-4 col-lg-2 pb-3 paddedLikeInput"+MatchPlayerBg(player2)}>{player2?.points}</Col>
                    </Row>
                </Col>
                <Col className="col-2 col-md-1"></Col>
            </Row>
            )
    }
}