
import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import ReactMarkdown from 'react-markdown'

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
    useEffect(() => {
      setNewTournamentDescription(tournament.description);
    },[tournament.description, setNewTournamentDescription]);
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
        // .then(() => {
        //   setNewTournamentDescription("");
        // });
        props.onHide();
        // TODO: insert a "success" toast
    };

    const handleUpdate = (event) => {
      setNewTournamentDescription(event.target.value);
    };

    // const handleClose = () => {
    //     props.show = false;
    // };

    if (props) {
      return (
        <Modal
          onHide={props.onHide}
          size="lg"
          fullscreen={true}
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
            {/* <Form> */}
              <Row> {/* className="h-50 h-md-100"*/}
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group
                    controlId="formEventLocation"
                    // className="h-100"
                  >
                    {/* <FloatingLabel
                      controlId="eventLocation"
                      label=""
                      className="mb-3"
                      // h-100
                    > */}
                      <Form.Control
                        // className="h-100"
                        as="textarea"
                        placeholder="f"
                        rows={10}
                        required
                        onChange={handleUpdate}
                        value={newTournamentDescription}
                        autoFocus
                      />
                    {/* </FloatingLabel> */}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <div className="card">
                    <div className="card-header">
                      Preview:
                    </div>
                    <div className="card-body">
                      <ReactMarkdown>{newTournamentDescription}</ReactMarkdown>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row></Row>
            {/* </Form> */}
          </Modal.Body>
          <Modal.Footer>
            <p className="me-auto">For Formatting help see: <a href="https://www.markdownguide.org/basic-syntax/">MarkDown Guide</a></p>
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