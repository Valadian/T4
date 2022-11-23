import React, { useState, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import TournamentPlayerEditor from "./TournamentPlayerEditor";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

export default function Ladder(props) {
    const {tournament, dispatchTournament, isOwner, finalizedOnly, setFinalizedOnly, config } = useContext(TournamentHomeContext);
    const [showTournamentPlayerEditor, setShowTournamentPlayerEditor] = useState(false);
    const [editPlayerNames, setEditPlayerNames] = useState(false);
    const [disqualifyMode, setDisqualifyMode] = useState(false);

    const toggleFinalizedOnly = () => {
      let next = !finalizedOnly
      setFinalizedOnly(next)
      if(next){
        dispatchTournament({type: 'finalized'})
      } else{
        dispatchTournament({type: 'live'})
      }
      // rebakeLadder(!finalizedOnly)
    }
    if (tournament?.Ladder) {
      //console.log("Got past the state check...");
      return (
        <div id="ladder">
          <div className="d-flex mb-3 gap-2">
            {isOwner?<button className="btn btn-outline-success" onClick={() => {
                    setShowTournamentPlayerEditor(true);
                  }} title="Add Player"><i className="bi bi-plus"></i></button>:<></>}
            {isOwner?<button className="btn btn-outline-primary" onClick={() => setEditPlayerNames(v => !v)} title="Override Names"><i className="bi bi-pen"></i></button>:<></>}
            {/* {isOwner && editPlayerNames?<button className="btn btn-outline-success" onClick={() => {}} title="Save Names"><i className="bi bi-save"></i></button>:<></>} */}
            {isOwner?<button className="btn btn-outline-danger pl-0 pr-0" onClick={() => setDisqualifyMode(v => !v)} title="Disqualify"><i className="bi bi-slash-circle"></i></button>:<></>}
            <span className="me-auto"></span>
            {finalizedOnly?<span className="form-group"><button className="btn btn-outline-secondary" onClick={toggleFinalizedOnly}>Finalized</button></span>:<></>}
            {!finalizedOnly?<span className="form-group"><button className="btn btn-outline-danger" onClick={toggleFinalizedOnly}>LIVE</button></span>:<></>}

          </div>
          <Row className="pb-1 header mb-3 sticky-top">
            <Col xs={1} lg={1}><span className="d-none d-md-inline">Rank</span><span className="d-inline d-md-none">#</span></Col>
            <Col xs={11} lg={4}>Player</Col>
            <Col xs={1} className="d-lg-none"></Col>
            <Col xs={3} lg={1} >W/L</Col>
            <Col xs={3} lg={2}  title={config.TPS_NAME}>{config.LADDER_COLS[0][0]}</Col>
            <Col xs={5} lg={2} >{config.LADDER_COLS[1][0]}{/*MoV<span className="d-none d-md-inline">/SoS</span>*/}</Col>
            <Col xs={2} className="d-none d-lg-block">Club
            </Col>
          </Row>
          {tournament.Ladder.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} editPlayerNames={editPlayerNames} setEditPlayerNames={setEditPlayerNames} disqualifyMode={disqualifyMode}/>
          ))}
          <TournamentPlayerEditor
              show={showTournamentPlayerEditor}
              onHide={() => setShowTournamentPlayerEditor(false)}
            />
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
}