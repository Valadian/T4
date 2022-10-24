import React, {useState,useEffect,useContext} from "react"
import {Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import ptsToTp from "../../util/armada";
import TournamentResultSubmissionMatch from "./TournamentResultSubmissionMatch";

const updateDoc = `
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean!, $mov: Int!) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, mov: $mov}) {
      id
    }
  }
  ` 

export default function TournamentResultSubmission(props) {
    const {rounds, ladder, tournament, updateTournament, isOwner, isParticipant} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const myGame = (round) => round.Matches.filter(isMine)[0]
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    const myself = (match) => match.Players.filter(p => p.User?.id===user?.sub)[0]
    const opponent = (match) => match.Players.filter(p => p.User?.id!==user?.sub)[0]

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
        {rounds.filter(roundHasMyGame).map(r => { 
            var m = myGame(r)
            var mp_self = myself(m)
            var mp_opp = opponent(m)
        return <TournamentResultSubmissionMatch key={r.id} round={r} match={m} mp_self={mp_self} mp_opp={mp_opp} />
        })}
    </>
    )
}