import React, {useContext} from "react"
import {Col, Row} from 'react-bootstrap'
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentResultSubmissionMatch from "./TournamentResultSubmissionMatch";

export default function TournamentResultSubmission(props) {
    const {tournament} = useContext(TournamentHomeContext);
    const { user } = useAuth0();

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const myGame = (round) => round.Matches.filter(isMine)[0]
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    const myself = (match) => match.Players.filter(p => p.User?.id===user?.sub)[0]
    const opponent = (match) => match.Players.filter(p => p.User?.id!==user?.sub)[0]

    if(tournament){
        return (
        <>
            <Row className="pb-1 header mb-3">
                <Col className="col-12 col-lg-3">Opponent</Col>
                <Col className="col-2">Self</Col>
                <Col className="col-2">Opp</Col>
                <Col className="col-2 col-lg-1">Mov</Col>
                <Col className="col-2 col-lg-1">TP</Col>
                <Col className="col-2">W/L</Col>
                <Col className="col-2 col-lg-1"></Col>
            </Row>
            {tournament?.Rounds.filter(roundHasMyGame).map(r => { 
                var m = myGame(r)
                var mp_self = myself(m)
                var mp_opp = opponent(m)
            return <TournamentResultSubmissionMatch key={r.id} round={r} match={m} mp_self={mp_self} mp_opp={mp_opp} />
            })}
        </>
        )
    } else {
        return (
            <></>
        )
    }
}