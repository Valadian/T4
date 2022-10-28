import React, {useState,useEffect,useContext} from "react"
import {Tabs, Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentMatch from "./TournamentMatch";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";

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
const insertMatchDoc = `
  mutation InsertMatch(
    $player1_name: String = "", 
    $player2_name: String = "", 
    $user1_id: String = null,
    $user2_id: String = null, 
    $tournament_user_id1: uuid!, 
    $tournament_user_id2: uuid = null, 
    $round_id: uuid = "", 
    $table_num: Int = null, 
    $player1_points: Int = null,
    $player1_mov: Int = null, 
    $player1_tp: Int = null,
    $player1_win: Boolean = null,
    $player2_points: Int = null,
    $player2_mov: Int = null, 
    $player2_tp: Int = null,
    $player2_win: Boolean = null,) {
      insert_Match(objects: {round_id: $round_id, table_num: $table_num, Players: {data: [
        {
            user_id: $user1_id, 
            player_name: $player1_name, 
            tournament_player_id: $tournament_user_id1, 
            tournament_opponent_id: $tournament_user_id2, 
            points: $player1_points, 
            opp_points: $player2_points, 
            mov: $player1_mov, 
            tournament_points: $player1_tp, 
            win: $player1_win
        },{
            user_id: $user2_id, 
            player_name: $player2_name, 
            tournament_player_id: $tournament_user_id2, 
            tournament_opponent_id: $tournament_user_id1, 
            points: $player2_points, 
            opp_points: $player1_points, 
            mov: $player2_mov, 
            tournament_points: $player2_tp, 
            win: $player2_win}]}}) {
        affected_rows
      }
    }
  `
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
    const { user, getAccessTokenSilently } = useAuth0();
    const [roundNum, setRoundNum] = useState(0);
    const [roundDesc, setRoundDesc] = useState("");
    const [activeTab, setActiveTab] = useState("round_1")
    const {rounds, ladder, tournament, updateTournament, isOwner} = useContext(TournamentHomeContext);
    
    useEffect(() => {
        //console.log(props.rounds.length)
        setRoundNum(rounds.length+1)
    },[rounds])
    const addRound = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("addNewRound", insertDoc, {
            tournament_id: tournament.id,
            round_num: roundNum,
            description: roundDesc,
        },accessToken).then((data) => {
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
            var remaining_rounds = rounds.filter(r => r.id != data.delete_TournamentRound_by_pk.id)
            if(remaining_rounds.length>0){
                var last_round_num = remaining_rounds[remaining_rounds.length - 1].round_num
                setActiveTab("round_"+last_round_num)
            } else {
                setActiveTab("addRound")
            }
            updateTournament()
        });
    }
    const generateRound = async (id) => {
        const accessToken = await getAccessTokenSilently()
        for (var table_num=0;table_num*2<ladder.length;table_num++){
            var player1 = ladder[table_num*2]
            var params = {
                player1_name: player1.player_name,
                user1_id: player1.user_id,
                round_id: id,
                table_num: table_num+1,
                tournament_user_id1: player1.id}
            if(table_num*2+1<ladder.length){
                var player2 = ladder[table_num*2+1]
                params['player2_name'] = player2.player_name
                params['user2_id'] = player2.user_id
                params['tournament_user_id2'] = player2.id
            } else {
                params['player1_points'] = 140
                params['player1_mov'] = 140
                params['player1_tp'] = 8
                params['player1_win'] = true
                params['player2_points'] = 0
                params['player2_mov'] = 0
                params['player2_tp'] = 3
                params['player2_win'] = false
            }
            Query("InsertMatch", insertMatchDoc, params ,accessToken)
            .then((data) => {
                updateTournament()
            });
        }
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
            // console.log(i,round.Matches[i-1]?.table_num)
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
        // console.log(table_num)
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
    if (rounds) {
        return (
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                defaultActiveKey={rounds.length>0?"round_1":"addRound"}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {rounds.map(r => {
                var unmatched = []
                if(isOwner&&r.Matches.length>0&&!r.finalized){
                    var all_players = ladder.map(l => {return {'player_name':l.player_name, 'User':l.User}});
                    var match_players = r.Matches.flatMap(m => m.Players.map(mp => {return {'player_name':mp.player_name, 'User':mp.User}}))
                    unmatched = all_players.filter(p => match_players.filter(mp => mp.player_name===p.player_name && mp.User?.id===p.User?.id).length===0);
                }
                return <Tab key={r.id} eventKey={"round_"+r.round_num} title={<span><i className="bi bi-bullseye"></i> <span className="d-none d-md-inline">Round </span>{r.round_num}</span>}>
                    <div className="d-flex flex-row-reverse">
                        {isOwner&&r.Matches.length===0?<span className="form-group"><a className="btn btn-outline-danger" onClick={() => deleteRound(r.id)}><i className="bi bi-x"></i> Delete Round</a></span>:<></>}
                        {isOwner&&r.Matches.length===0?<span className="form-group"><a className="btn btn-outline-success" onClick={() => generateRound(r.id)}><i className="bi bi-trophy-fill"></i> Generate Matches</a></span>:<></>}
                        {isOwner&&r.Matches.length>0&&!r.finalized?<span className="form-group"><a className="btn btn-outline-warning" onClick={() => setRoundLocked(r.id, true)}><i className="bi bi-trophy-fill"></i> Finalize Round</a></span>:<></>}
                        {isOwner&&r.Matches.length>0&&r.finalized?<span className="form-group"><a className="btn btn-outline-secondary" onClick={() => setRoundLocked(r.id, false)}><i className="bi bi-trophy-fill"></i> Reopen Round</a></span>:<></>}
                    </div>
                    <Row className="pb-1 header mb-3">
                        <Col className="col-1"><span className="d-none d-lg-inline">Table #</span><span className="d-inline d-lg-none">Tbl</span></Col>
                        <Col className="col-9 col-md-10">
                            <Row>
                                <Col className="col-7 col-sm-8 col-lg-4"></Col>
                                <Col className="col-5 col-sm-4 col-lg-2"><span className="d-none d-md-inline">Points</span><span className="d-inline d-md-none">pts</span></Col>
                                <Col className="col-7 col-sm-8 col-lg-4 d-none d-lg-block"></Col>
                                <Col className="col-5 col-sm-4 col-lg-2 d-none d-lg-block"><span className="d-none d-md-inline">Points</span><span className="d-inline d-md-none">pts</span></Col>
                            </Row>
                        </Col>
                        <Col className="col-2 col-md-1"></Col>
                    </Row>
                    {r.Matches.map(m => <TournamentMatch key={m.id} match={m} round={r}/>)}
                    {isOwner&&r.Matches.length>0&&!r.finalized?<Row>
                        <Col className="col-10 col-md-11"></Col>
                        <Col className="col-2 col-md-1">
                        <span className="form-group"><a className="btn btn-outline-success" onClick={() => addMatch(r)} title="Add Match"><i className="bi bi-plus"></i></a></span>
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
                    <div className="form-group"><a className="btn btn-outline-success" onClick={addRound}><i className="bi bi-plus"></i> Add Round</a></div>
                </Tab>:<></>}
            </Tabs>
        )
    } else {
      return <div>Loading...</div>;
    }
}