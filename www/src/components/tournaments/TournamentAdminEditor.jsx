import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const updateTournamentDateDoc = `
mutation updateTournamentPlayerByName($tournament_id: uuid = "", $player_name: String = "", $player_club: String = "") {
  insert_TournamentPlayer(objects: {tournament_id: $tournament_id, player_name: $player_name, club: $player_club}) {
    returning {
      player_name
      Tournament {
        name
      }
      id
    }
  }
}`;

export default function TournamentAdminEditor(props){
    const [newTournamentDate, setNewTournamentDate] = useState("");
    const [newPlayerName, setNewPlayerName] = useState("");
    const { getAccessTokenSilently } = useAuth0();
    const {tournament} = useContext(TournamentHomeContext);

    const updateTournamentDate = async (start_date) => {
        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentDate", updateTournamentDateDoc, {
        start_date: start_date,
        tournament_id: tournament.id,
        }, accessToken).then((data) => setNewTournamentDate(data.start));
    }

    const updateTournamentPlayerByName = () => {
        if (!newTournamentDate) {
        return;
        }

        const id = tournament.id;

        console.log(`New start date: ${newTournamentDate}`);
        console.log(`Tournament id: ${id}`);

        Query("updateTournamentDate", updateTournamentDateDoc, {
        start_date: newTournamentDate,
        tournament_id: id,
        }).then((data) =>
        // TODO: insert a "success" toast
        setNewTournamentDate(data.start)
        );
    };

    const handleDateUpdate = (event) => {
        console.log(event.target.value);
        setNewTournamentDate(event.target.value);
    };

    const handleClose = () => {
        props.show = false;
    };


    if (props) {
      return (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={props.show}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Change Event Administrators
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Form.Group
                  as={Col}
                  controlId="formPlayerName"
                  xs={{ span: 7 }}
                >
                  <FloatingLabel
                    controlId="playerName"
                    label="Player Name"
                    className="mb-3"
                    style={{}}
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      required
                      onChange={setNewPlayerName}
                      value={newPlayerName}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={updateTournamentPlayerByName}>Add</Button>
            <Button onClick={props.onHide}>Close</Button>
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