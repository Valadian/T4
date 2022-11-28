import React, { useContext, useState, useEffect, useRef } from "react";
import { Col, Row, Form, FloatingLabel } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Query from "../../data/T4GraphContext";
import TournamentPlayerName from "./TournamentPlayerName"
import TournamentColoredText from "./TournamentColoredText"
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const deleteDoc = `
mutation DeleteTournamentPlayer($id: uuid = "") {
    delete_TournamentPlayer_by_pk(id: $id) {
        id
    }
}`

const withdrawDoc = `
mutation WithdrawTournamentPlayer($id: uuid!, $disqualified: Boolean = true) {
  update_TournamentPlayer_by_pk(pk_columns: {id: $id}, _set: {disqualified: $disqualified}) {
    id
    disqualified
  }
}`
const updateNameDoc = `
mutation UpdateNameTournamentPlayer($id: uuid = "", $player_name: String = null, $club: String = null) {
  update_TournamentPlayer_by_pk(pk_columns: {id: $id}, _set: {player_name: $player_name, club: $club}) {
    player_name
    club
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
    const {updateTournament, isOwner, tournament, config} = useContext(TournamentHomeContext);
    const { getAccessTokenSilently } = useAuth0();
    const [nameUpdate, setNameUpdate] = useState(props.player.player_name);
    const [clubUpdate, setClubUpdate] = useState(props.player.club);
    const [expanded, setExpanded] = useState(false);

    const stopPropagation = (event) =>{
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
    } 
    const deletePlayer = async (id) =>{
      let accessToken = await getAccessTokenSilently()
      Query("DeleteTournamentPlayer", deleteDoc, { id: id },accessToken)
        .then((response) => {
          updateTournament()
        })
    }
    
    const withdrawPlayer = async (id, dq) =>{
      let accessToken = await getAccessTokenSilently()
      Query("WithdrawTournamentPlayer", withdrawDoc, { id: id, disqualified: dq },accessToken)
        .then((response) => {
          updateTournament()
        })
    }
    const updatePlayerName = async (id) =>{
      let accessToken = await getAccessTokenSilently()
      Query("UpdateNameTournamentPlayer", updateNameDoc, { 
        id: id,
        player_name: nameUpdate===""?null:nameUpdate,
        club: clubUpdate===""?null:clubUpdate
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
      let state = m.TournamentOpponent?(m.win===null?"PENDING":(m.win?"WIN":(m.disqualified?"DQ":(m.draw?"DRAW":"LOSS")))):(m.win===false?"D/Q":"BYE")
      let oppname = m.TournamentOpponent?(m.TournamentOpponent.player_name??m.TournamentOpponent.User?.name):""

      return (<>
        <Col xs={1}></Col>
        <Col xs={11} lg={4}>&nbsp;- R{m.Match.Round.round_num} vs {oppname}</Col>
        <Col xs={1} className="d-lg-none"></Col>
        <Col xs={3} lg={1} className={state==="PENDING"?"text-warning":(m.win?"text-info2":(m.draw?"text-muted":"text-danger"))}>{state}</Col>
        <Col xs={3} lg={2}><TournamentColoredText value={m.tournament_points} min={config.MIN_TPS} max={config.MAX_TPS}/></Col>
        <Col xs={3} lg={2}>{m.points!==null&&m.opp_points!==null?<span>(<TournamentColoredText value={m.points} min={0} max={config.MAX_POINTS}/>:<TournamentColoredText value={m.opp_points} min={0} max={config.MAX_POINTS}/>)</span>:<></>}</Col>
        <Col xs={2} lg={2} className="d-flex"></Col>
      </>)
    }
    let max_tp = tournament?.Ladder?.map(l => l.tournament_points).reduce((a,b)=>Math.max(a,b),0)
    let min_tp = tournament?.Ladder?.map(l => l.tournament_points).reduce((a,b)=>Math.min(a,b),100)
    let max_mov = tournament?.Ladder?.map(l => l.mov).reduce((a,b)=>Math.max(a,b),0)
    let min_mov = tournament?.Ladder?.map(l => l.mov).reduce((a,b)=>Math.min(a,b),2000)
    let max_sos = tournament?.Ladder?.map(l => l.sos).reduce((a,b)=>Math.max(a,b),0)
    let min_sos = tournament?.Ladder?.map(l => l.sos).reduce((a,b)=>Math.min(a,b),10)
    return (
      <div>
      <Row onClick={() => setExpanded(v => !v)} className={"collapsible"+(expanded?" active":"")+(props.player.disqualified?" withdrawn":"")} >{/* "accordion-row"+  data-bs-toggle="collapse" data-bs-target={"#TP"+props.player.id.replaceAll("-","")} */}
        <Col xs={1}>{props.player.rank}</Col>
        <Col xs={11} lg={4} title={TournamentPlayerMatchSummary(props.player)}>
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
              onClick={stopPropagation}
              value={nameUpdate}
              autoFocus
            />
          </FloatingLabel>:<TournamentPlayerName player={props.player} />}
        </Col>
        <Col xs={1} className="d-lg-none"></Col>
        <Col xs={3} lg={1}><nobr>
          <span className={(props.player.win>0 && !props.player.disqualified)?"text-info2":""}>{props.player.win}</span><span className="d-none d-md-inline"> </span>/
          {config.CAN_DRAW?<><span className="d-none d-md-inline"> </span><span className={props.player.draw>0?"text-muted":""}>{props.player.draw}</span><span className="d-none d-md-inline"> </span>/</>:<></>}
          <span className="d-none d-md-inline"> </span><span className={(props.player.loss>0 && !props.player.disqualified)?"text-danger":""}>{props.player.loss}</span>
          </nobr></Col>
        <Col xs={3} lg={2}><nobr>
          {(config.LADDER_COLS[0][1].includes("tournament_points"))?(!props.player.disqualified?<TournamentColoredText value={props.player.tournament_points} min={min_tp} max={max_tp}/>:props.player.tournament_points):<></>}
          {(config.LADDER_COLS[0][1].includes("mov"))?(!props.player.disqualified?<TournamentColoredText value={typeof props.player.mov === "number" ? props.player.mov?.toFixed(2): props.player.mov} min={min_mov} max={max_mov}/>:props.player.mov?.toFixed(2)):<></>}
          {(config.LADDER_COLS[0][1].includes("emov"))?<>/<span className="d-none d-md-inline"> </span>{!props.player.disqualified?<TournamentColoredText value={typeof props.player.emov === "number" ? props.player.emov.toFixed(2) : props.player.emov} min={min_mov} max={max_mov}/>:props.player.emov?.toFixed(2)}</>:<></>}
          </nobr></Col>
        <Col xs={3} lg={2}><nobr>
          {(config.LADDER_COLS[1][1].includes("mov"))?(!props.player.disqualified?<TournamentColoredText value={config.MOV_DATATYPE==="numeric" && typeof props.player.mov === "number") ?props.player.mov?.toFixed(2):props.player.mov} min={min_mov} max={max_mov}/>:config.MOV_DATATYPE==="numeric"?props.player.mov?.toFixed(2):props.player.mov):<></>}
          {(config.LADDER_COLS[1][1].includes("sos"))?<><span className="d-none d-md-inline"> </span>{config.LADDER_COLS[1][1].includes("mov")?"/":""}<span className="d-none d-md-inline"> </span>{!props.player.disqualified?<TournamentColoredText value={typeof props.player.sos === "number" ? props.player.sos.toFixed(2) : props.player.sos} min={min_sos} max={max_sos}/>:props.player.sos?.toFixed(2)}</>:<></>}
          {(config.LADDER_COLS[1][1].includes("esos"))?<><span className="d-none d-md-inline"> </span>/<span className="d-none d-md-inline"> </span>{!props.player.disqualified?<TournamentColoredText value={typeof props.player.esos === "number" ? props.player.esos.toFixed(2) : props.player.esos} min={min_sos} max={max_sos}/>:props.player.esos?.toFixed(2)}</>:<></>}
          </nobr></Col>
        <Col xs={2} lg={2} className="d-flex" style={{position:'relative'}}>
          <span className="w-100">
            <span className="d-none d-md-block overflow-ellipsis">
              {props.editPlayerNames?
              <FloatingLabel
                controlId="nameOverride"
                label={props.player.club}
              >
                <Form.Control
                  type="text"
                  placeholder="f"
                  required
                  onChange={(event) => setClubUpdate(event.target.value)}
                  onClick={stopPropagation}
                  value={clubUpdate}
                  autoFocus
                />
              </FloatingLabel>:props.player.club}
            </span>
          </span>
        
          {props.editPlayerNames?<button className="btn btn-sm btn-outline-success" onClick={(event) => {stopPropagation(event);updatePlayerName(props.player.id);props.setEditPlayerNames(false);}}><i className="bi bi-save"></i></button>:

          (props.disqualifyMode?(!props.player.disqualified?<button className="btn btn-sm btn-outline-danger d-md-rightside" onClick={(event) => {stopPropagation(event);withdrawPlayer(props.player.id,true);}} title="Disqualify player"><i className="bi bi-slash-circle"></i></button>:
          <button className="btn btn-sm btn-outline-success" onClick={(event) => {stopPropagation(event);withdrawPlayer(props.player.id,false)}} title="Re-enter player"><i className="bi bi-plus"></i></button>):
          (isOwner && props.player.Matches.length===0?<button className="btn btn-sm btn-outline-danger d-md-rightside" onClick={(event) => {stopPropagation(event);deletePlayer(props.player.id)}}><i className="bi bi-x"></i></button>:<></>))
          }
        </Col>
      </Row>
      <Row style={{maxHeight:(expanded?"500px":null)}} className={"mb-1 match-summary-rows collapsible-content"} >{/*accordion-collapse  id={"TP"+props.player.id.replaceAll("-","")} data-bs-parent="#ladder" accordion-collapse collapse */}
        {props.player.Matches.map(m=> <TournamentPlayerMatchSummaryRows key={m.id} match={m}/>)}
        
      </Row>
      <div className="roundRow"></div>
      </div>
    );
}