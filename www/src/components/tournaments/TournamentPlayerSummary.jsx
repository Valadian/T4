import React, { useContext, useState } from "react";
import { Col, Row, Form, FloatingLabel } from "react-bootstrap";
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
const updateNameDoc = `
mutation UpdateNameTournamentPlayer($id: uuid = "", $player_name: String = null) {
  update_TournamentPlayer_by_pk(pk_columns: {id: $id}, _set: {player_name: $player_name}) {
    player_name
    id
  }
  update_MatchPlayer(where: {tournament_player_id: {_eq: $id}}, _set: {player_name: $player_name}) {
    returning {
      id
      player_name
    }
  }
}`
export default function TournamentPlayerSummary(props) {
    const {updateTournament, isOwner} = useContext(TournamentHomeContext);
    const { getAccessTokenSilently } = useAuth0();
    const [nameUpdate, setNameUpdate] = useState(props.player.player_name);

    const deletePlayer = async (id) =>{
      let accessToken = await getAccessTokenSilently()
      Query("DeleteTournamentPlayer", deleteDoc, { id: id },accessToken)
        .then((response) => {
          updateTournament()
        })
    }
    const updatePlayerName = async (id) =>{
      let accessToken = await getAccessTokenSilently()
      Query("UpdateNameTournamentPlayer", updateNameDoc, { 
        id: id,
        player_name: nameUpdate===""?null:nameUpdate
      },accessToken)
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
    const TournamentPlayerMatchSummaryRows = (props)=>{
      let m = props.match
      let state = m.TournamentOpponent?(m.win===null?"PENDING":(m.win?"WIN":"LOSS")):(m.win===false?"D/Q":"BYE")
      let oppname = m.TournamentOpponent?(m.TournamentOpponent.User?.name??m.TournamentOpponent.player_name):""

      return (<>
        <Col xs={1}></Col>
        <Col xs={5} md={4}>&nbsp;- R{m.Match.Round.round_num} vs {oppname}</Col>
        <Col xs={2} md={1} className={state==="PENDING"?"text-warning":(m.win?"text-info":"text-danger")}>{state}</Col>
        <Col xs={1}>{m.tournament_points}</Col>
        <Col xs={3} md={2}>{m.points&&m.opp_points?"("+m.points+":"+m.opp_points+")":""}</Col>
        <Col xs={3} className="d-none d-md-flex"></Col>
      </>)
    }
    return (
      <>
      <Row className="accordion-row" data-bs-toggle="collapse" data-bs-target={"#TP"+props.player.id.replaceAll("-","")}>
        <Col className="col-1">{props.player.rank}</Col>
        <Col className="col-5 col-md-4" title={TournamentPlayerMatchSummary(props.player)}>
          {props.editPlayerNames?
                  <FloatingLabel
                    controlId="nameOverride"
                    label={props.player.player_name??props.player.User?.name}
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={(event) => setNameUpdate(event.target.value)}
                      value={nameUpdate}
                      autoFocus
                    />
                  </FloatingLabel>:<TournamentPlayerName player={props.player} />}
        </Col>
        <Col className="col-2 col-md-1"><span className={props.player.win>0?"text-info":""}>{props.player.win}</span><span className="d-none d-md-inline"> </span>/<span className="d-none d-md-inline"> </span><span className={props.player.loss>0?"text-danger":""}>{props.player.loss}</span></Col>
        <Col className="col-1">{props.player.tournament_points}</Col>
        <Col className="col-3 col-md-2">{props.player.mov}<span className="d-none d-md-inline"> / {props.player.sos.toFixed(2)}</span></Col>
        <Col className="col-3 d-none d-md-flex"><span className="me-auto">{props.player.club}</span>
        
        {props.editPlayerNames?<button className="btn btn-sm btn-outline-success" onClick={() => {updatePlayerName(props.player.id);props.setEditPlayerNames(false);}}><i className="bi bi-save"></i></button>:
        (props.disqualifyMode?<button className="btn btn-sm btn-outline-danger" onClick={() => {}}><i className="bi bi-slash-circle"></i></button>:
        (isOwner && props.player.Matches.length===0?<button className="btn btn-sm btn-outline-danger" onClick={() => deletePlayer(props.player.id)}><i className="bi bi-x"></i></button>:<></>))
        }
        </Col>
      </Row>
      <Row id={"TP"+props.player.id.replaceAll("-","")} data-bs-parent="#ladder" className="roundRow accordion-collapse collapse">
        {props.player.Matches.map(m=> <TournamentPlayerMatchSummaryRows key={m.id} match={m}/>)}
      </Row>
      </>
    );
}