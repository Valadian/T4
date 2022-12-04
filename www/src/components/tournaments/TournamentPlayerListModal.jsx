import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import TournamentPlayerName from "./TournamentPlayerName";

export default function TournamentPlayerListModal({onHide, show, tp}) {
    if(tp){
        return (
            <Modal 
                onHide={onHide}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        List for <TournamentPlayerName player={tp} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col className="d-flex">
                        {tp.PlayerList?.raw?<>
                            <div className="listFactionIconWrapperModal">
                                <img className="listFactionIcon" src={tp.PlayerList?.Faction?.image} alt="Faction Icon"/>
                            </div>
                            <pre>{tp.PlayerList?.raw}</pre>
                            </>:
                            <span className="text-muted">No List</span>}
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}