import React, { useState, useEffect } from "react";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentPlayerName from "./TournamentPlayerName"

export default function TournamentPlayerSummary(props) {
    const { user, getAccessTokenSilently } = useAuth0();
    //console.log(JSON.stringify(props));
    const TournamentPlayerMatchSummary = (tp)=>{
      return tp.Matches.map(m => {
        if(m.TournamentOpponent){
          if(m.win===null){
            return "ROUND "+m.Match.Round.round_num+" PENDING vs ["+(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name)+"]"
          }
          return "ROUND "+m.Match.Round.round_num+" "+(m.win?"WIN":"LOSS")+" ("+m.points+" : "+m.opp_points+") vs ["+(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name)+"] for "+m.tournament_points+" TP"
        } else {
          return "ROUND "+m.Match.Round.round_num+" "+(m.win?"BYE":"D/Q")+" ("+m.points+" : "+m.opp_points+")"
        }
      })
      .reduce((a,b) => a+b+"\n","")
    }
    return (
      <Row>
        <Col className="col-1">{props.player.rank}</Col>
        <Col className="col-5 col-md-4" title={TournamentPlayerMatchSummary(props.player)}><TournamentPlayerName player={props.player} /></Col>
        <Col className="col-2 col-md-1"><span className={props.player.win>0?"text-info":""}>{props.player.win}</span> / <span className={props.player.loss>0?"text-danger":""}>{props.player.loss}</span></Col>
        <Col className="col-1">{props.player.tournament_points}</Col>
        <Col className="col-3 col-md-2">{props.player.mov} <span className="d-none d-md-inline">/ {props.player.sos.toFixed(2)}</span></Col>
        <Col className="col-3 d-none d-md-block">{props.player.club}</Col>
      </Row>
    );
}