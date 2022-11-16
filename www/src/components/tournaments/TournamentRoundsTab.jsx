import React, {useState,useEffect,useContext} from "react"
import {Tabs, Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentMatch from "./TournamentMatch";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import generatePairings from "../../util/swiss";

const insertDoc = `
mutation addNewRound($tournament_id: uuid!, $round_num: numeric!, $description: String!) {
    insert_TournamentRound(objects: {round_num: $round_num, description: $description, tournament_id: $tournament_id}) {
      affected_rows
    }
  }`
const deleteDoc = `
  mutation deleteRound($id: uuid!) {
      delete_TournamentRound_by_pk(id: $id) {
          id
      }
  }`
const finalizeDoc = `
  mutation finalizeRound($id: uuid!, $finalized: Boolean!) {
      update_TournamentRound_by_pk(pk_columns: {id: $id}, _set: {finalized: $finalized}) {
        id
      }
    }
    ` 
const addMatchDoc = `
mutation addMatch($round_id: uuid!, $table_num: Int!) {
    insert_Match_one(object: {table_num: $table_num, round_id: $round_id, Players: {data: [{}, {}]}}) {
        id
    }
}
  
`
export default function TournamentRoundsTab(props) {
    const { getAccessTokenSilently } = useAuth0();
    const [roundNum, setRoundNum] = useState(0);
    const [roundDesc, setRoundDesc] = useState("");
    const [activeTab, setActiveTab] = useState("round_1")
    const {tournament, updateTournament, isOwner} = useContext(TournamentHomeContext);
    
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
            setActiveTab("round_"+roundNum)
            //setRoundNum(+roundNum+1);
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
                var last_round_num = remaining_rounds[remaining_rounds.length - 1].round_num
                setActiveTab("round_"+last_round_num)
            } else {
                setActiveTab("addRound")
            }
            updateTournament()
        });
    }
    const generateRound = async (id, firstRound) => {
        const accessToken = await getAccessTokenSilently()
        generatePairings(tournament.id, id, accessToken, updateTournament, firstRound)
    }
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
        return (e) => e.dataTransfer.setData("player",JSON.stringify(mp));
    }
    if (tournament) {
        return (
        <>
            
            {isOwner?<div className="mb-3 text-muted">TOs can <b>set/override</b> all <b>match scores</b> in this tab</div>:<></>}
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                defaultActiveKey={tournament.Rounds.length>0?"round_1":"addRound"}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {tournament.Rounds.map(r => {
                var unmatched = []
                if(isOwner&&r.Matches.length>0&&!r.finalized){
                    var all_players = tournament.Ladder.map(l => {return {'player_name':l.player_name, 'User':l.User, 'id':l.id}});
                    var match_players = r.Matches.flatMap(m => m.Players.map(mp => {return {'player_name':mp.player_name, 'User':mp.User}}))
                    unmatched = all_players.filter(p => match_players.filter(mp => mp.player_name===p.player_name && mp.User?.id===p.User?.id).length===0);
                }
                return <Tab key={r.id} eventKey={"round_"+r.round_num} title={<span><i className="bi bi-bullseye"></i> <span className="d-none d-md-inline">Round </span>{r.round_num}</span>}>
                    <div className="d-flex flex-row-reverse">
                        {isOwner&&r.Matches.length===0?<span className="form-group"><button className="btn btn-outline-danger" onClick={() => deleteRound(r.id)}><i className="bi bi-x"></i> Delete Round</button></span>:<></>}
                        {isOwner&&r.Matches.length===0?<span className="form-group"><button className="btn btn-outline-success" onClick={() => generateRound(r.id,r.round_num===1)}><i className="bi bi-trophy-fill"></i> Generate Matches</button></span>:<></>}
                        {isOwner&&r.Matches.length>0&&!r.finalized?<span className="form-group"><button className="btn btn-outline-warning" onClick={() => setRoundLocked(r.id, true)}><i className="bi bi-trophy-fill"></i> Finalize Round</button></span>:<></>}
                        {isOwner&&r.Matches.length>0&&r.finalized?<span className="form-group"><button className="btn btn-outline-secondary" onClick={() => setRoundLocked(r.id, false)}><i className="bi bi-trophy-fill"></i> Reopen Round</button></span>:<></>}
                    </div>
                    <Row className="pb-1 header mb-3">
                        <Col className="col-1"><span className="d-none d-lg-inline">Table #</span><span className="d-inline d-lg-none">Tbl</span></Col>
                        <Col xs={isOwner?10:11} md={isOwner?10:11}>
                            <Row>
                                <Col xs={5} sm={7} md={6} lg={4}></Col>
                                <Col xs={5} sm={3} md={3} lg={1}><span className="d-none d-md-inline">Points</span><span className="d-inline d-md-none">pts</span></Col>
                                <Col xs={2} sm={2} md={3} lg={1}>TPs</Col>
                                <Col xs={5} sm={7} md={6} lg={4} className="d-none d-lg-block"></Col>
                                <Col xs={5} sm={3} md={3} lg={1} className="d-none d-lg-block"><span className="d-none d-md-inline">Points</span><span className="d-inline d-md-none">pts</span></Col>
                                <Col xs={2} sm={2} md={3} lg={1} className="d-none d-lg-block">TPs</Col>
                            </Row>
                        </Col>
                        <Col xs={isOwner?1:0} md={isOwner?1:0}></Col>
                    </Row>
                    {r.Matches.map(m => <TournamentMatch key={m.id} match={m} round={r}/>)}
                    {isOwner&&r.Matches.length>0&&!r.finalized?<Row>
                        <Col className="col-10 col-md-11"></Col>
                        <Col className="col-2 col-md-1">
                        <span className="form-group"><button className="btn btn-outline-success" onClick={() => addMatch(r)} title="Add Match"><i className="bi bi-plus"></i></button></span>
                        </Col>
                    </Row>
                    :<></>}
                    {isOwner&&r.Matches.length>0&&!r.finalized?
                    <div className="d-flex flex-wrap gap-3">
                        {unmatched.length>0?<span className="text-muted">Unassigned Players:</span>:<></>}
                        {unmatched.map(mp => <span key={mp.User?.id??mp.player_name} className="draggablePlayer d-inline-flex" draggable="true" onDragStart={dragPlayer(mp)}>
                            <TournamentPlayerName player={mp} />
                        </span>)}
                    </div>:<></>}
                </Tab>})}
                {isOwner?
                <Tab eventKey="addRound" title={<span><i className="bi bi-plus-circle-fill"></i></span>}>
                    <div className="form-group mb-1">
                        <label htmlFor="roundNum">Round Num</label>
                        <input className="form-control" placeholder="Enter Round Num" value={roundNum} onChange={(e) => setRoundNum(e.target.value)} />
                    </div>
                    <div className="form-group mb-1">
                        <label htmlFor="roundDesc">Round Description</label>
                        <input className="form-control" placeholder="Enter Round Description (optional)"  value={roundDesc} onChange={(e) => setRoundDesc(e.target.value)}/>
                    </div>
                    <div className="form-group"><button className="btn btn-outline-success" onClick={addRound}><i className="bi bi-plus"></i> Add Round</button></div>
                </Tab>:<></>}
            </Tabs>
        </>
        )
    } else {
      return <div>Loading...</div>;
    }
}