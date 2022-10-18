import React, {useContext} from "react"
import { Col, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../../data/T4GraphContext";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const swapDoc = `
mutation SwapPlayers($id1: uuid!, $match_id1: uuid!, $id2: uuid!, $match_id2: uuid!) {
    update1: update_MatchPlayer_by_pk(pk_columns: {id: $id1}, _set: {match_id: $match_id2}) {
        id
    }
    update2: update_MatchPlayer_by_pk(pk_columns: {id: $id2}, _set: {match_id: $match_id1}) {
        id
    }
}
`
export default function TournamentMatch(props){
    const { user, getAccessTokenSilently } = useAuth0();
    const {updateTournament, isOwner} = useContext(TournamentHomeContext);

    var player1 = props.match.Players[0]
    var player2 = props.match.Players[1]
    const allowDrop = (ev) => ev.preventDefault();
    const dragPlayer1 = (e) => e.dataTransfer.setData("player",JSON.stringify(player1));
    const dragPlayer2 = (e) => e.dataTransfer.setData("player",JSON.stringify(player2));
    const swap = async (p1, p2) => {
        const accessToken = await getAccessTokenSilently()
        Query("SwapPlayers", swapDoc, { 
            id1: p1.id, 
            match_id1: p1.match_id,
            id2: p2.id, 
            match_id2: p2.match_id, },accessToken)
        .then((response) => {
            updateTournament();
        })
    }
    const handleDropPlayer1 = (e) => {
        var from = JSON.parse(e.dataTransfer.getData("player"))
        var to = player1
        swap(from, to);
        //console.log("Swapping: "+JSON.parse(e.dataTransfer.getData("player"))?.player_name+" for: "+player1?.player_name)
    }
    const handleDropPlayer2 = (e) => {
        var from = JSON.parse(e.dataTransfer.getData("player"))
        var to = player2
        swap(from, to);
        //console.log("Swapping: "+JSON.parse(e.dataTransfer.getData("player"))?.player_name+" for: "+player2?.player_name)
    }
    //TODO: Handle null player 2 (Buy)
    if(isOwner){
        return (
        <Row className="mb-3">
            <Col>{props.match.table_num}</Col>
            <Col className="draggablePlayer" draggable="true"  onDragStart={dragPlayer1} onDragOver={e => allowDrop(e)} onDrop={e => handleDropPlayer1(e)}>{player1?.player_name}</Col>
            <Col>{player1?.points}</Col>
            <Col className="draggablePlayer" draggable="true"  onDragStart={dragPlayer2} onDragOver={e => allowDrop(e)} onDrop={e => handleDropPlayer2(e)}>{player2?.player_name}</Col>
            <Col>{player2?.points}</Col>
        </Row>
        )
    } else {
        return (
            <Row className="mb-3">
                <Col>{props.match.table_num}</Col>
                <Col>{player1?.player_name}</Col>
                <Col>{player1?.points}</Col>
                <Col>{player2?.player_name}</Col>
                <Col>{player2?.points}</Col>
            </Row>
            )
    }
}