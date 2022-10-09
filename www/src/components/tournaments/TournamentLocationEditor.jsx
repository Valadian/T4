
import React, { useState, useEffect } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";

const updateTournamentLocationDoc = `
  mutation updateTournamentLocation($location: String = "", $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {location: $location}) {
      returning {
        name
        location
      }
    }
  }
`;

export default function TournamentLocationEditor(props) {
    const [newTournamentLocation, setNewTournamentLocation] = useState("");
    const { getAccessTokenSilently } = useAuth0();

    const updateTournamentLocation = async () => {
        if (!newTournamentLocation) {
            return;
        }

        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentLocation", updateTournamentLocationDoc, {
        location: newTournamentLocation,
        tournament_id: props.tournament.id,
        },accessToken)
        .then(() => {
            props.update_tournament();
        })
        .then(() => {
            setNewTournamentLocation("");
        });
        props.onHide();
        // TODO: insert a "success" toast
    };

    const handleDateUpdate = (event) => {
        setNewTournamentLocation(event.target.value);
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
              Change Event Location
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
                    label="Event Location"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={handleDateUpdate}
                      value={newTournamentLocation}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={updateTournamentLocation}>Ok</Button>
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