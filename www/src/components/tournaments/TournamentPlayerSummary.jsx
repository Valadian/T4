import React, { useContext, useState, useEffect, useRef } from "react";
import { Col, Row, Form, FloatingLabel, Button } from "react-bootstrap";
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
export default function TournamentPlayerSummary({player, editNameMode, disqualifyMode}) {
    const {updateTournament, isOwner, tournament, config, showLists, showMatchLists, playerLists} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();
    const [nameUpdate, setNameUpdate] = useState(player.player_name??"");
    const [clubUpdate, setClubUpdate] = useState(player.club);
    const [expanded, setExpanded] = useState(false);
    const [factionImage, setFactionImage] = useState(playerLists[player.id]?.Faction?.image)
    const [isEditing, setIsEditing] = useState(false)

    const isMe = user && user.sub===player.User?.id
    useEffect(() => {
      if(!editNameMode){
        setIsEditing(false)
      }
    },[editNameMode])
    useEffect(() => {
      setFactionImage(playerLists[player.id]?.Faction?.image)
    },[playerLists, player.id])

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
    const TournamentPlayerMatchSummaryRows = ({match})=>{
      let m = match
      let state = m.TournamentOpponent?(m.win===null?"PENDING":(m.win?"WIN":(m.disqualified?"DQ":(m.draw?"DRAW":"LOSS")))):(m.win===false?"D/Q":"BYE")
      let oppname = m.TournamentOpponent?(m.TournamentOpponent.player_name??m.TournamentOpponent.User?.name):""
      let oppid = m.TournamentOpponent?(m.TournamentOpponent.id):""
      
      const [oppFactionImage, setOppFactionImage] = useState(playerLists[oppid]?.Faction?.image)

      // useEffect(() => {
      //   setFactionImage(playerLists[oppid]?.Faction?.image)
      // },[playerLists, oppid])

      return (<>
        <Col xs={1}></Col>
        <Col xs={11} lg={4}>&nbsp;- R{m.Match.Round.round_num} vs {oppFactionImage?<img onClick={(event) => {stopPropagation(event);showMatchLists(m)}} title="Show List" src={oppFactionImage} height={20} width={20} alt=""/>:<span className="ladderFactionIconSpacer"></span>}
            {oppname}</Col>
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
      <Row onClick={() => setExpanded(v => !v)} className={"collapsible"+(expanded?" active":"")+(player.disqualified?" withdrawn":"")} >{/* "accordion-row"+  data-bs-toggle="collapse" data-bs-target={"#TP"+props.player.id.replaceAll("-","")} */}
        <Col xs={1}>{player.rank}</Col>
        <Col xs={11} lg={4} title={TournamentPlayerMatchSummary(player)}>
          {isEditing?
          <FloatingLabel
            controlId="nameOverride"
            label={player.player_name??player.User?.name}
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
          </FloatingLabel>:<>
            {factionImage?<img onClick={(event) => {stopPropagation(event);showLists(player)}} title="Show List" src={factionImage} height={20} width={20} alt=""/>:<span className="ladderFactionIconSpacer"></span>}
            <TournamentPlayerName player={player} />
          </>}
        </Col>
        <Col xs={1} className="d-lg-none"></Col>
        <Col xs={3} lg={1}><nobr>
          <span className={(player.win>0 && !player.disqualified)?"text-info2":""}>{player.win}</span><span className="d-none d-md-inline"> </span>/
          {config.CAN_DRAW?<><span className="d-none d-md-inline"> </span><span className={player.draw>0?"text-muted":""}>{player.draw}</span><span className="d-none d-md-inline"> </span>/</>:<></>}
          <span className="d-none d-md-inline"> </span><span className={(player.loss>0 && !player.disqualified)?"text-danger":""}>{player.loss}</span>
          </nobr></Col>
        <Col xs={3} lg={2}><nobr>
          {(config.LADDER_COLS[0][1].includes("tournament_points"))?(!player.disqualified?<TournamentColoredText value={player.tournament_points} min={min_tp} max={max_tp}/>:player.tournament_points):<></>}
          {(config.LADDER_COLS[0][1].includes("mov"))?(!player.disqualified?<TournamentColoredText value={player.mov?.toFixed(2)} min={min_mov} max={max_mov}/>:player.mov?.toFixed(2)):<></>}
          {(config.LADDER_COLS[0][1].includes("emov"))?<>/<span className="d-none d-md-inline"> </span>{!player.disqualified?<TournamentColoredText value={player.emov?.toFixed(2)} min={min_mov} max={max_mov}/>:player.emov?.toFixed(2)}</>:<></>}
          </nobr></Col>
        <Col xs={3} lg={2}><nobr>
          {(config.LADDER_COLS[1][1].includes("mov"))?(!player.disqualified?<TournamentColoredText value={config.MOV_DATATYPE==="numeric"?player.mov?.toFixed(2):player.mov} min={min_mov} max={max_mov}/>:config.MOV_DATATYPE==="numeric"?player.mov?.toFixed(2):player.mov):<></>}
          {(config.LADDER_COLS[1][1].includes("sos"))?<><span className="d-none d-md-inline"> </span>{config.LADDER_COLS[1][1].includes("mov")?"/":""}<span className="d-none d-md-inline"> </span>{!player.disqualified?<TournamentColoredText value={player.sos?.toFixed(2)} min={min_sos} max={max_sos}/>:player.sos?.toFixed(2)}</>:<></>}
          {(config.LADDER_COLS[1][1].includes("esos"))?<><span className="d-none d-md-inline"> </span>/<span className="d-none d-md-inline"> </span>{!player.disqualified?<TournamentColoredText value={player.esos?.toFixed(2)} min={min_sos} max={max_sos}/>:player.esos?.toFixed(2)}</>:<></>}
          </nobr></Col>
        <Col xs={2} lg={2} className="d-flex" style={{position:'relative'}}>
          <span className="w-100">
            <span className="d-none d-md-block overflow-ellipsis">
              {isEditing?
              <FloatingLabel
                controlId="nameOverride"
                label={player.club}
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
              </FloatingLabel>:player.club}
            </span>
          </span>
        
          {isEditing?<button className="btn btn-sm btn-outline-success" onClick={(event) => {stopPropagation(event);updatePlayerName(player.id);setIsEditing(false)}}><i className="bi bi-save"></i></button>:

          (disqualifyMode?(!player.disqualified?<button className="btn btn-sm btn-outline-danger" onClick={(event) => {stopPropagation(event);withdrawPlayer(player.id,true);}} title="Disqualify player"><i className="bi bi-slash-circle"></i></button>:
          <button className="btn btn-sm btn-outline-success " onClick={(event) => {stopPropagation(event);withdrawPlayer(player.id,false)}} title="Re-enter player"><i className="bi bi-plus"></i></button>):
          (isOwner && player.Matches.length===0?<button className="btn btn-sm btn-outline-danger" onClick={(event) => {stopPropagation(event);deletePlayer(player.id)}}><i className="bi bi-x"></i></button>:<></>))
          }
          {(((editNameMode && !isEditing)||(isMe && !disqualifyMode))?<button className="btn btn-sm btn-outline-primary" title="Edit Player" onClick={(event) => {stopPropagation(event);setIsEditing(v => !v)}}><i className="bi bi-pen"></i></button>:<></>)}
        </Col>
      </Row>
      <Row style={{maxHeight:(expanded?"500px":null)}} className={"mb-1 match-summary-rows collapsible-content"} >{/*accordion-collapse  id={"TP"+props.player.id.replaceAll("-","")} data-bs-parent="#ladder" accordion-collapse collapse */}
        {player.Matches.map(m=> <TournamentPlayerMatchSummaryRows key={m.id} match={m}/>)}
        
      </Row>
      <div className="roundRow"></div>
      </div>
    );
}