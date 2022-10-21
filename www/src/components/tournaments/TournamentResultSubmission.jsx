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
            <Col className="col-1 col-md-2"><span className="d-none d-md-inline">Round #</span><span className="d-inline d-md-none">Rnd</span></Col>
            <Col className="col-1 col-md-2"><span className="d-none d-md-inline">Table #</span><span className="d-inline d-md-none">Tbl</span></Col>
            <Col className="col-4 col-md-3"><span className="d-none d-md-inline">Opponent</span><span className="d-inline d-md-none">Opp</span></Col>
            <Col className="col-2">Points</Col>
            <Col className="col-1">TP</Col>
            <Col className="col-3 col-md-2">W/L</Col>
        </Row>
        {rounds.filter(roundHasMyGame).map(r => { 
            var m = myGame(r)
            var mp_self = myself(m)
            var mp_opp = opponent(m)
        return (<Row key={r.id}>
                <Col className="col-1 col-md-2">{r.round_num}</Col>
                <Col className="col-1 col-md-2">{m.table_num}</Col>
                <Col className="col-4 col-md-3"><TournamentPlayerName player={opponent(m)}/></Col>
                <Col className="col-2">{mp_self.points}</Col>
                <Col className="col-1">{mp_self.tournament_points}</Col>
                {mp_self.win?
                <Col className="col-3 col-md-2" className="bg-success">WIN</Col>:
                <Col className="col-3 col-md-2" className="bg-danger">LOSS</Col>}
        </Row>)
        })}
    </>
    )
}