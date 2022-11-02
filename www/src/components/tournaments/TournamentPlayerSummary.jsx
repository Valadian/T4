import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../../data/T4GraphContext";
import TournamentPlayerName from "./TournamentPlayerName"
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const deleteDoc = `
mutation DeleteTournamentPlayer($id: uuid = "") {
    delete_TournamentPlayer_by_pk(id: $id) {
        id
    }
}`
export default function TournamentPlayerSummary(props) {
    const {updateTournament, isOwner} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();

    const deletePlayer = async (id) =>{
      let accessToken = await getAccessTokenSilently()
      Query("DeleteTournamentPlayer", deleteDoc, { id: id },accessToken)
        .then((response) => {
          updateTournament()
        })
    }
    //console.log(JSON.stringify(props));
    const TournamentPlayerMatchSummary = (tp)=>{
      return tp.Matches.map(m => {
        if(m.TournamentOpponent){
          if(m.win===null){
            return "ROUND "+m.Match.Round.round_num+" PENDING vs ["+(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name)+"]"
          }
          return "ROUND "+m.Match.Round.round_num+" "+(m.win?"WIN":"LOSS")+" ("+m.points+" : "+m.opp_points+") vs ["+(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name)+"] for "+m.tournament_points+" TP"
        } else {
          return "ROUND "+m.Match.Round.round_num+" "+(m.win===false?"D/Q":"BYE")+" ("+m.points+" : "+m.opp_points+")"
        }
      })
      .reduce((a,b) => a+b+"\n","")
    }
    const TournamentPlayerMatchSummaryRows = (tp)=>{
      return tp.Matches.map(m => {
        let state = m.TournamentOpponent?(m.win===null?"PENDING":(m.win?"WIN":"LOSS")):(m.win===false?"D/Q":"BYE")
        let oppname = m.TournamentOpponent?(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name):""

        return <>
          <Col xs={1}></Col>
          <Col xs={5} md={4}>&nbsp;- R{m.Match.Round.round_num} vs {oppname}</Col>
          <Col xs={2} md={1} className={state==="PENDING"?"text-warning":(m.win?"text-info":"text-danger")}>{state}</Col>
          <Col xs={1}>{m.tournament_points}</Col>
          <Col xs={3} md={2}>{m.points&&m.opp_points?"("+m.points+":"+m.opp_points+")":""}</Col>
          <Col xs={3} className="d-none d-md-flex"></Col>
        </>
      })
    }
    return (
      <>
      <Row className="accordion-row" data-bs-toggle="collapse" data-bs-target={"#TP"+props.player.id.replaceAll("-","")}>
        <Col className="col-1">{props.player.rank}</Col>
        <Col className="col-5 col-md-4" title={TournamentPlayerMatchSummary(props.player)}><TournamentPlayerName player={props.player} /></Col>
        <Col className="col-2 col-md-1"><span className={props.player.win>0?"text-info":""}>{props.player.win}</span><span className="d-none d-md-inline"> </span>/<span className="d-none d-md-inline"> </span><span className={props.player.loss>0?"text-danger":""}>{props.player.loss}</span></Col>
        <Col className="col-1">{props.player.tournament_points}</Col>
        <Col className="col-3 col-md-2">{props.player.mov}<span className="d-none d-md-inline"> / {props.player.sos.toFixed(2)}</span></Col>
        <Col className="col-3 d-none d-md-flex"><span className="me-auto">{props.player.club}</span>
        
        {isOwner && props.player.Matches.length===0?<a className="btn btn-sm btn-outline-danger" onClick={() => deletePlayer(props.player.id)}><i className="bi bi-x"></i></a>:<></>}
        </Col>
      </Row>
      <Row id={"TP"+props.player.id.replaceAll("-","")} data-bs-parent="#ladder" className="roundRow accordion-collapse collapse">
        {TournamentPlayerMatchSummaryRows(props.player)}
      </Row>
      </>
    );
}