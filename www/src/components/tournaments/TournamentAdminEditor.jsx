import React, { useState, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const updateCreatorNameDoc = `
mutation updateCreatorName($id: uuid!, $creator_name: String = null) {
  update_Tournament_by_pk(pk_columns: {id: $id}, _set: {creator_name: $creator_name}) {
    creator_name
  }
}`;

export default function TournamentAdminEditor({show, onHide}){
    const {updateTournament, tournament} = useContext(TournamentHomeContext);
    const [newPlayerName, setNewPlayerName] = useState(tournament.creator_name??"");
    const { getAccessTokenSilently } = useAuth0();

    const updateTournamentPlayerByName = async () => {

        const accessToken = await getAccessTokenSilently()
        
        Query("updateCreatorName", updateCreatorNameDoc, {
          id: tournament.id,
          creator_name: newPlayerName?newPlayerName:null,
          }, accessToken).then((data) => {
            // TODO: insert a "success" toast
            onHide()
            updateTournament()
          }
        );
    };

    // const handleDateUpdate = (event) => {
    //     console.log(event.target.value);
    //     setNewTournamentDate(event.target.value);
    // };

    // const handleClose = () => {
    //     props.show = false;
    // };


    return (
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Event Administrators
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <h4>Override Creator Name</h4>
              <Form.Group
                as={Col}
                controlId="formPlayerName"
                xs={{ span: 7 }}
              >
                <FloatingLabel
                  controlId="playerName"
                  label={tournament.Creator.name}
                  className="mb-3"
                  style={{}}
                >
                  <Form.Control
                    type="text"
                    placeholder="f"
                    required
                    onChange={(event) => setNewPlayerName(event.target.value)}
                    value={newPlayerName}
                    // autoFocus
                  />
                </FloatingLabel>
              </Form.Group>
            </Row>
            <Row>
              <h4>Assistant Tournament Operators</h4>
              <p className="text-muted">Not yet Implemented</p>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={"success"} onClick={updateTournamentPlayerByName}>Update</Button>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
}