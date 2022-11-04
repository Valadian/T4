
import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const updateTournamentNameDoc = `
  mutation updateTournamentName($name: String = "", $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {name: $name}) {
      returning {
        id
        name
      }
    }
  }
`;

export default function TournamenNameEditor(props) {
  const [newTournamentName, setNewTournamentName] = useState("");
    const { getAccessTokenSilently } = useAuth0();
    const {tournament, updateTournament} = useContext(TournamentHomeContext);
    useEffect(() => {
      setNewTournamentName(tournament.name);
    },[tournament.name, setNewTournamentName]);

    const save = async () => {
        if (!newTournamentName) {
            return;
        }

        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentName", updateTournamentNameDoc, {
          name: newTournamentName,
          tournament_id: tournament.id,
        },accessToken)
        .then(() => {
            updateTournament();
        })
        .then(() => {
          setNewTournamentName("");
        });
        props.onHide();
        // TODO: insert a "success" toast
    };

    const handleUpdate = (event) => {
      setNewTournamentName(event.target.value);
    };

    // const handleClose = () => {
    //     props.show = false;
    // };

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
              Change Event Name
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
                    label="Event Name"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={handleUpdate}
                      value={newTournamentName}
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