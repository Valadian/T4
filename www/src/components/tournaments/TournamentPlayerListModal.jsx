import React, { useContext} from "react";
import { Button, Col, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import TournamentPlayerName from "./TournamentPlayerName";
import TournamentColoredText from "./TournamentColoredText"
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const ListColumn = ({tp, playerLists, config}) => {    
    return ( /*<Col key={tp.id} style={{position:"relative"}} xs={12} md={6}>*/
    <Row className="flex-grow-1" key={tp.id} style={{position:"relative"}}>
        <Col className="d-flex ">
        {playerLists[tp.id]?.raw?<>
            <div className="listFactionIconWrapperModal">
                <img className="listFactionIcon" src={playerLists[tp.id]?.Faction?.image} alt="Faction Icon"/>
            </div>
            <pre>{playerLists[tp.id]?.raw}</pre>
            </>:
            <span className="text-muted">No List</span>}
        </Col>
    </Row>
/*</Col>*/)
}
export default function TournamentPlayerListModal({onHide, show, tps, match}) {
    const {config, playerLists} = useContext(TournamentHomeContext);

    let m = match
    let state = (m?.TournamentOpponent)?(m.win===null?"PENDING":(m.win?"WIN":(m.disqualified?"DQ":(m.draw?"DRAW":"LOSS")))):(m?.win===false?"D/Q":"BYE")
    let opp_state = (m?.TournamentOpponent)?(m.win===null?"PENDING":(m.win?"LOSS":(m.disqualified?"BYE":(m.draw?"DRAW":"WIN")))):"N/A"
    
    if(tps.length>0){
        let tp1 = tps[0]
        let tp2 = tps[1]
        // let PlayerList = playerLists[tp.id]
        return (
            <Modal 
                onHide={onHide}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {match?<>{"Round "+match.Match.Round.round_num+" Table "+ match.Match.table_num+" lists"}</>:<TournamentPlayerName player={tp1} />}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col className="d-flex flex-column" xs={12} md={m?6:12}>
                            {m?<h3>
                                <TournamentPlayerName player={match?.TournamentPlayer} nameonly /> &nbsp;
                                <span  className={"badge "+(state==="PENDING"?"bg-warning":(m.win?"bg-info":(m.draw?"bg-secondary":"bg-danger")))}>{state} &nbsp;
                                    <span className="badge bg-dark"><TournamentColoredText value={m.points} min={0} max={config.MAX_POINTS}/> {config.POINTS_ACRONYM}</span>
                                </span>
                            </h3>:<></>}
                            <ListColumn tp={tp1} playerLists={playerLists} config={config} key={tp1.id}/>
                        </Col>
                        {tp2?<Col className="d-flex flex-column" xs={12} md={6}>
                            {m?<h3><TournamentPlayerName player={match?.TournamentOpponent} nameonly />&nbsp;
                                <span  className={"badge "+(opp_state==="PENDING"?"bg-warning":(m.win?"bg-danger":(m.draw?"bg-secondary":"bg-info")))}>{opp_state}&nbsp;
                                    <span className="badge bg-dark"><TournamentColoredText value={m.opp_points} min={0} max={config.MAX_POINTS}/> {config.POINTS_ACRONYM}</span>
                                </span>
                            </h3>:<></>}
                            <ListColumn tp={tp2} playerLists={playerLists} config={config} key={tp2.id}/>
                        </Col>:<></>}
                    </Row>

                    
                    {/* {m?<Row>
                        <Col xs={12} md={6}>
                            <h3>
                                <TournamentPlayerName player={match?.TournamentPlayer} nameonly /> &nbsp;
                                <span  className={"badge "+(state==="PENDING"?"bg-warning":(m.win?"bg-info":(m.draw?"bg-secondary":"bg-danger")))}>{state} &nbsp;
                                    <span className="badge bg-dark"><TournamentColoredText value={m.points} min={0} max={config.MAX_POINTS}/> {config.POINTS_ACRONYM}</span>
                                </span>
                            </h3> 
                        </Col>
                        {match?.TournamentOpponent?<Col>
                            <h3><TournamentPlayerName player={match?.TournamentOpponent} nameonly />&nbsp;
                                <span  className={"badge "+(opp_state==="PENDING"?"bg-warning":(m.win?"bg-danger":(m.draw?"bg-secondary":"bg-info")))}>{opp_state}&nbsp;
                                    <span className="badge bg-dark"><TournamentColoredText value={m.opp_points} min={0} max={config.MAX_POINTS}/> {config.POINTS_ACRONYM}</span>
                                </span>
                            </h3>
                        </Col>:<></>}
                    </Row>:<></>}
                    <Row>
                        {tps.map(tp => <ListColumn tp={tp} playerLists={playerLists} config={config} key={tp.id}/>)}
                    </Row> */}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}