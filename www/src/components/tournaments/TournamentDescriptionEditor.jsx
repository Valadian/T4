
import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const updateTournamentDescriptionDoc = `
  mutation updateTournamentDescription($description: String = "", $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {description: $description}) {
      returning {
        name
        description
      }
    }
  }
`;

export default function TournamenDescriptionEditor(props) {
  const [newTournamentDescription, setNewTournamentDescription] = useState("");
    const { getAccessTokenSilently } = useAuth0();
    const {tournament, updateTournament} = useContext(TournamentHomeContext);

    const save = async () => {
        if (!newTournamentDescription) {
            return;
        }

        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentDescription", updateTournamentDescriptionDoc, {
        description: newTournamentDescription,
        tournament_id: tournament.id,
        },accessToken)
        .then(() => {
            updateTournament();
        })
        .then(() => {
          setNewTournamentDescription("");
        });
        props.onHide();
        // TODO: insert a "success" toast
    };

    const handleUpdate = (event) => {
      setNewTournamentDescription(event.target.value);
    };

    const handleClose = () => {
        props.show = false;
    };

    if (props) {
      return (
        <Modal
          onHide={props.onHide}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={props.show}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Change Event Description
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Form.Group
                  as={Col}
                  controlId="formEventLocation"
                  xs={{ span: 8, offset: 2 }}
                >
                  <FloatingLabel
                    controlId="eventLocation"
                    label="Event Description"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={handleUpdate}
                      value={newTournamentDescription}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={save}>Ok</Button>
            <Button onClick={props.onHide}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      );
    } else {
      return (
        <>
          <div>Loading...</div>
        </>
      );
    }
}