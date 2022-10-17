import React, {useState,useEffect} from "react"
import {Tabs, Tab} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";

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
export default function TournamentRoundsTab(props) {
    const { user, getAccessTokenSilently } = useAuth0();
    const [roundNum, setRoundNum] = useState(0);
    const [roundDesc, setRoundDesc] = useState("");
    const [activeTab, setActiveTab] = useState()
    useEffect(() => {
        //console.log(props.rounds.length)
        setRoundNum(props.rounds.length+1)
    },[props.rounds])
    const addRound = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("addNewRound", insertDoc, {
            tournament_id: props.tournament_id,
            round_num: roundNum,
            description: roundDesc,
        },accessToken).then((data) => {
            //setRoundNum(+roundNum+1);
            props.update_tournament()
        });
    }
    const deleteRound = async (round_id) => {
        const accessToken = await getAccessTokenSilently()
        Query("deleteRound", deleteDoc, {
            id: round_id
        },accessToken).then((data) => {
            //setRoundNum(+roundNum+1);
            console.log(activeTab)
            var remaining_rounds = props.rounds.filter(r => r.id != data.delete_TournamentRound_by_pk.id)
            if(remaining_rounds.length>0){
                var last_round_num = remaining_rounds[remaining_rounds.length - 1].round_num
                setActiveTab("round_"+last_round_num)
            } else {
                setActiveTab("addRound")
            }
            props.update_tournament()
        });
    }
    const generateRound = async () => {
    }
    if (props.rounds) {
        return (
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                defaultActiveKey={props.rounds.length>0?"round_1":"addRound"}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {props.rounds.map(r => <Tab key={r.round_num} eventKey={"round_"+r.round_num} title={<span><i className="bi bi-bullseye"></i> Round {r.round_num}</span>}>

                    {r.Matches.length==0?<span className="form-group"><a className="btn btn-outline-danger" onClick={() => deleteRound(r.id)}><i className="bi bi-x"></i> Delete Round</a></span>:<></>}
                    {r.Matches.length==0?<span className="form-group"><a className="btn btn-outline-success" onClick={generateRound}><i className="bi bi-trophy-fill"></i> Generate Matches</a></span>:<></>}
                </Tab>
                )}
                {props.isOwner?
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