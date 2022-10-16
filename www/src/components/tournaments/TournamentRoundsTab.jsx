import React from "react"
import {Tabs, Tab} from 'react-bootstrap'

export default function TournamentRoundsTab(props) {
    if (props.rounds) {
        return (
            <Tabs
                defaultActiveKey={props.rounds.length>0?"round_1":"addRound"}
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {props.rounds.map(r => <Tab eventKey={"round_"+r.round_num} title={<span><i className="bi bi-bullseye"></i> Round {r.round_num}</span>}>

                        </Tab>
                )}
                <Tab eventKey="addRound" title={<span><i className="bi bi-plus-circle-fill"></i></span>}>
                    <div className="form-group mb-1">
                        <label htmlFor="roundNum">Round Num</label>
                        <input className="form-control" aria-describedby="emailHelp" placeholder="Enter Round Num" />
                    </div>
                    <div className="form-group mb-1">
                        <label htmlFor="roundDesc">Round Description</label>
                        <input className="form-control" aria-describedby="emailHelp" placeholder="Enter Round Description (optional)" />
                    </div>
                    <div className="form-group"><a className="btn btn-outline-success" ><i className="bi bi-plus"></i> Add Round</a></div>
                </Tab>
            </Tabs>
        )
    } else {
      return <div>Loading...</div>;
    }
}