import React, { useState, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import TournamentPlayerSummary from "./TournamentPlayerSummary";
import TournamentPlayerEditor from "./TournamentPlayerEditor";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

export default function Ladder(props) {
    const {tournament, dispatchTournament, isOwner, finalizedOnly, setFinalizedOnly } = useContext(TournamentHomeContext);
    const [showTournamentPlayerEditor, setShowTournamentPlayerEditor] = useState(false);

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
          <div className="d-flex mb-3">
            {isOwner?<button className="btn btn-outline-success" onClick={() => {
                    setShowTournamentPlayerEditor(true);
                  }} title="Add Player"><i className="bi bi-plus"></i></button>:<></>}
            <span className="me-auto"></span>
            {finalizedOnly?<span className="form-group"><button className="btn btn-outline-secondary" onClick={toggleFinalizedOnly}>Finalized</button></span>:<></>}
            {!finalizedOnly?<span className="form-group"><button className="btn btn-outline-danger" onClick={toggleFinalizedOnly}>LIVE</button></span>:<></>}

          </div>
          <Row className="pb-1 header mb-3">
            <Col className="col-1 col-md-1"><span className="d-none d-md-inline">Rank</span><span className="d-inline d-md-none">#</span></Col>
            <Col className="col-5 col-md-4">Player</Col>
            <Col className="col-2 col-md-1">W/L</Col>
            <Col className="col-1">TP</Col>
            <Col className="col-3 col-md-2">MoV<span className="d-none d-md-inline">/SoS</span></Col>
            <Col className="col-3 d-none d-md-block">Club
            </Col>
          </Row>
          {tournament.Ladder.map((player) => (
            <TournamentPlayerSummary key={player.id} player={player} />
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