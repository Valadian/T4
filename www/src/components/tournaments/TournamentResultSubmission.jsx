import React, {useState,useEffect,useContext} from "react"
import {Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";

export default function TournamentResultSubmission(props) {
    const {rounds, ladder, tournament, updateTournament, isOwner, isParticipant} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const myGame = (round) => round.Matches.filter(isMine)[0]
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    const myself = (match) => match.Players.filter(p => p.User?.id==user?.sub)[0]
    const opponent = (match) => match.Players.filter(p => p.User?.id!=user?.sub)[0]
    return (
    <>
        <Row className="pb-1 header mb-3">
            <Col>Round #</Col>
            <Col>Table #</Col>
            <Col>Opponent</Col>
            <Col>Points</Col>
            <Col>TP</Col>
            <Col>W/L</Col>
        </Row>
        {rounds.filter(roundHasMyGame).map(r => { 
            var m = myGame(r)
            var mp_self = myself(m)
            var mp_opp = opponent(m)
        return (<Row key={r.id}>
                <Col>{r.round_num}</Col>
                <Col>{m.table_num}</Col>
                <Col><TournamentPlayerName player={opponent(m)}/></Col>
                <Col>{mp_self.points}</Col>
                <Col>{mp_self.tournament_points}</Col>
                {mp_self.win?
                <Col className="bg-success">WIN</Col>:
                <Col className="bg-danger">LOSS</Col>}
        </Row>)
        })}
    </>
    )
}