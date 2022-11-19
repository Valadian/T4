import React, { useState, useEffect, useContext } from "react";
import { Tabs, Tab, Col, Row } from "react-bootstrap";
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentMatch from "./TournamentMatch";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";
import TournamentPlayerName from "./TournamentPlayerName";
// import generatePairings from "../../util/swiss";

const insertDoc = `
  mutation addNewRound($tournament_id: uuid!, $round_num: numeric!, $description: String!) {
    insert_TournamentRound(objects: {round_num: $round_num, description: $description, tournament_id: $tournament_id}) {
      affected_rows
      returning {
        id
      }
    }
  }`;

const deleteDoc = `
  mutation deleteRound($id: uuid!) {
    delete_TournamentRound_by_pk(id: $id) {
      id
    }
  }
  `;

const finalizeDoc = `
  mutation finalizeRound($id: uuid!, $finalized: Boolean!) {
    update_TournamentRound_by_pk(pk_columns: {id: $id}, _set: {finalized: $finalized}) {
      id
    }
  }
  `;

const addMatchDoc = `
  mutation addMatch($round_id: uuid!, $table_num: Int!) {
    insert_Match_one(object: {table_num: $table_num, round_id: $round_id, Players: {data: [{}, {}]}}) {
      id
    }
  }
  `;

const generateMatchesDoc = `
  mutation generateMatches($tournament_id: uuid!, $round_num: numeric = 0, $no_delete: Boolean = false) {
    NextRoundMatches(tournament_id: $tournament_id, round_num: $round_num, no_delete: $no_delete) {
      match_ids
    }
  }
  `;

export default function TournamentRoundsTab(props) {
    const { getAccessTokenSilently } = useAuth0();
    const [roundNum, setRoundNum] = useState(0);
    const [roundDesc, setRoundDesc] = useState("");
    const [activeTab, setActiveTab] = useState()
    const [swapping, setSwapping] = useState(false);
    const [swapTarget, setSwapTarget] = useState()
    const {tournament, updateTournament, isOwner, config} = useContext(TournamentHomeContext);
    
    useEffect(() => {
        setRoundNum(tournament?.Rounds.map(r => r.round_num).reduce((a,b) => Math.max(a,b),0)+1)
    },[tournament])
    const addRound = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("addNewRound", insertDoc, {
            tournament_id: tournament.id,
            round_num: roundNum,
            description: roundDesc,
        },accessToken).then((data) => {
            setActiveTab(data.insert_TournamentRound.returning[0].id)
            updateTournament()
        });
    }
    const deleteRound = async (round_id) => {
        const accessToken = await getAccessTokenSilently()
        Query("deleteRound", deleteDoc, {
            id: round_id
        },accessToken).then((data) => {
            //setRoundNum(+roundNum+1);
            var remaining_rounds = tournament?.Rounds.filter(r => r.id !== data.delete_TournamentRound_by_pk.id)
            if(remaining_rounds.length>0){
                
                var last_round_id = remaining_rounds[remaining_rounds.length-1].id
                setActiveTab(last_round_id)
            } else {
                setActiveTab("addRound")
            }
            updateTournament()
        });
    }
    const generateRound = async (round_number) => {
      const accessToken = await getAccessTokenSilently();
      if (round_number === null) {
        round_number = roundNum;
      } else {
        round_number = 1;
      }
      let vars = {
        tournament_id: tournament.id,
        round_num: round_number,
      };
  
      Query("generateMatches", generateMatchesDoc, vars, accessToken)
        .then(() => {
          updateTournament();
        })
        .then(() => setActiveTab("round_" + roundNum));
    };
    const setRoundLocked = async (round_id, finalized) => {
        const accessToken = await getAccessTokenSilently()
        Query("finalizeRound", finalizeDoc, {
            id: round_id,
            finalized: finalized
        },accessToken)
        .then(() => {
            updateTournament();
        });
    }
    const addMatch = async (round) => {
        var table_num = 1
        for(var i=1;i<=round.Matches.length+1;i++){
            if(round.Matches[i-1]){
                if(i<round.Matches[i-1].table_num){
                    table_num=i;
                    break;
                }
            } else {
                table_num=i;
                break;
            }
        }
        const accessToken = await getAccessTokenSilently()
        Query("addMatch", addMatchDoc, {
            round_id: round.id,
            table_num: table_num
        },accessToken)
        .then(() => {
            updateTournament();
        });
    }
    const dragPlayer = (mp) => {
        return (e) => e.dataTransfer.setData("player",JSON.stringify({
            'id':mp.id,
            'match_id':null,
            'tournament_opponent_id':null,
            'tournament_player_id':null,
            'player_name':mp.player_name,
            'User':mp.User
        }));
    }
    if (tournament) {
        return (
        <>
            {(!isOwner && tournament.Rounds.length===0)?<p className="text-muted">No Rounds have been created...</p>:<></>}
            {isOwner?<div className="mb-3 text-muted">TOs can <b>set/override</b> all <b>match scores</b> in this tab</div>:<></>}
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                defaultActiveKey={tournament.Rounds.length>0?(tournament.Rounds[tournament.Rounds.length-1].id):"addRound"}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {tournament.Rounds.map(r => {
                var unmatched = []
                if(isOwner&&r.Matches.length>0&&!r.finalized){
                    // var all_players = tournament.Ladder.map(l => {return {'player_name':l.player_name, 'User':l.User, 'id':l.id}});
                    var all_players = tournament.Ladder.filter(l => !l.disqualified);
                    //var match_players = r.Matches.flatMap(m => m.Players.map(mp => {return {'player_name':mp.player_name, 'User':mp.User}}))
                    var match_players = r.Matches.flatMap(m => m.Players.map(mp => mp.TournamentPlayer))
                    unmatched = all_players.filter(p => !match_players.includes(p));
                }
                let UnmatchedIndicator = () => unmatched.length>0?<i className="bi bi-exclamation-triangle-fill text-warning"></i>:""
                let LiveIndicator = () => (r.Matches.length>0 && !r.finalized)?<span className="badge bg-danger">Live</span>:""
                let UnmatchedPlayersWarningLabel = () => unmatched.length>0?<h2 className="text-warning me-auto">Unmatched Players!</h2>:<span className="me-auto"></span>
                let ReopenRoundButton = () => isOwner&&r.Matches.length>0&&r.finalized?<span className="form-group"><button className="btn btn-outline-secondary" onClick={() => setRoundLocked(r.id, false)}><i className="bi bi-trophy-fill"></i> Reopen Round</button></span>:<></>
                let FinalizeRoundButton = () => isOwner&&r.Matches.length>0&&!r.finalized?<span className="form-group"><button className="btn btn-outline-warning" onClick={() => setRoundLocked(r.id, true)}><i className="bi bi-trophy-fill"></i> Finalize Round</button></span>:<></>
                let FinalizePreviousWarningLabel = () =>(isOwner&&r.Matches.length===0&&tournament.Rounds.filter(or=>!or.finalized && or.round_num<r.round_num).length>0)?<h2 className="text-warning">Finalize Previous Rounds!</h2>:<></>
                let GenerateMatchesButton = () => isOwner&&r.Matches.length===0?<span className="form-group"><button className="btn btn-outline-success" onClick={() => generateRound(r.id,r.round_num===1)}><i className="bi bi-trophy-fill"></i> Generate Matches</button></span>:<></>
                let DeleteRoundButton = () => isOwner&&r.Matches.length===0?<span className="form-group"><button className="btn btn-outline-danger" onClick={() => deleteRound(r.id)}><i className="bi bi-x"></i> Delete Round</button></span>:<></>
                
                let SwapPlayersButton = () => isOwner&&r.Matches.length>0&&!r.finalized?<span className="form-group"><button className={"btn"+(swapping?" btn-warning text-dark swapping":" btn-outline-warning")} onClick={() => setSwapping(v => !v)} title="Swap Players"><i className="bi bi-arrow-left-right"></i></button></span>:<></>
                let AddMatchButton = () => isOwner&&r.Matches.length>0&&!r.finalized?<span className="form-group"><button className="btn btn-outline-success" onClick={() => addMatch(r)} title="Add Match"><i className="bi bi-plus"></i></button></span>:<></>
                
                return <Tab key={r.id} eventKey={ r.id} title={<span><i className="bi bi-bullseye"></i> <span className="d-none d-md-inline">Round </span>{r.round_num} <LiveIndicator /> <UnmatchedIndicator/> </span> }>
                    <div className="d-flex mb-3">
                        <UnmatchedPlayersWarningLabel />
                        <ReopenRoundButton />
                        <FinalizeRoundButton />
                        <FinalizePreviousWarningLabel />
                        <GenerateMatchesButton />
                        <DeleteRoundButton />
                    </div>
                    {r.Matches.length>0?<Row className="pb-1 header mb-3 sticky-top">
                        <Col className="col-1"><span className="d-none d-lg-inline">Table #</span><span className="d-inline d-lg-none">Tbl</span></Col>
                        <Col xs={isOwner?10:11}>
                            <Row>
                                <Col xs={5} sm={7} md={6} lg={3}></Col>
                                <Col xs={5} sm={3} md={3} lg={2}><span className="d-none d-md-inline">{config.POINTS_NAME}</span><span className="d-inline d-md-none">{config.POINTS_ACRONYM}s</span></Col>
                                <Col xs={2} sm={2} md={3} lg={1}>TPs</Col>
                                <Col xs={5} sm={7} md={6} lg={3} className="d-none d-lg-block"></Col>
                                <Col xs={5} sm={3} md={3} lg={2} className="d-none d-lg-block"><span className="d-none d-md-inline">{config.POINTS_NAME}</span><span className="d-inline d-md-none">{config.POINTS_ACRONYM}s</span></Col>
                                <Col xs={2} sm={2} md={3} lg={1} className="d-none d-lg-block">TPs</Col>
                            </Row>
                        </Col>
                        <Col xs={isOwner?1:0} md={isOwner?1:0}></Col>
                    </Row>:<></>}
                    {r.Matches.map(m => <TournamentMatch key={m.id} match={m} round={r} swapping={swapping} setSwapping={setSwapping} swapTarget={swapTarget} setSwapTarget={setSwapTarget}/>)}
                    {isOwner&&r.Matches.length>0&&!r.finalized?<Row>
                        <Col className="col-8 col-md-10"></Col>
                        <Col className="col-2 col-md-1 p-0 ">
                        <SwapPlayersButton />
                        </Col>
                        <Col className="col-2 col-md-1 p-0 ">
                        <AddMatchButton />
                        </Col>
                    </Row>
                    :<></>}
                    {isOwner&&r.Matches.length>0&&!r.finalized?
                    <div className="d-flex flex-wrap gap-3">
                        {unmatched.length>0?<span className="text-warning"><b>Unassigned Players:</b></span>:<></>}
                        {unmatched.map(mp => <span key={mp.User?.id??mp.player_name} className={"draggablePlayer d-inline-flex "+(mp===swapTarget?" swapping":"")} draggable="true" onDragStart={dragPlayer(mp)}>
                            <TournamentPlayerName player={mp} /> {swapping?<button className="btn btn-sm btn-warning" onClick={() => mp===swapTarget?setSwapTarget(null):setSwapTarget(mp)}><i className="bi bi-arrow-left-right"></i></button>:<></>}
                        </span>)}
                    </div>:<></>}
                    {(isOwner&&r.Matches.length>0&&!r.finalized)?<p><b>Note:</b> Swapping players require table to be unscored. Reset <i className="text-warning bi bi-recycle"></i> the table if needed.</p>:<></>}
                </Tab>})}
                {isOwner?
                <Tab eventKey="addRound" title={<span><i className="bi bi-plus-circle-fill"></i></span>}>
                    <div className="form-group mb-1">
                        <label htmlFor="roundNum">Round Num</label>
                        <input type="number" min="0" className={"form-control"+(isNaN(parseFloat(roundNum))?" is-invalid":"")} placeholder="Enter Round Num" value={roundNum} onChange={(e) => setRoundNum(e.target.value)} />
                        <div className="invalid-feedback">
                        Must be a number.
                        </div>
                    </div>
                    <div className="form-group mb-1">
                        <label htmlFor="roundDesc">Round Description</label>
                        <input className="form-control" placeholder="Enter Round Description (optional)"  value={roundDesc} onChange={(e) => setRoundDesc(e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <button
                        className="btn btn-outline-success"
                        onClick={() => generateRound(null)}
                      >
                    <i className="bi bi-plus"></i> Add Round</button></div>
                </Tab>:<></>}
            </Tabs>
        </>
        )
    } else {
      return <div>Loading...</div>;
    }
}
