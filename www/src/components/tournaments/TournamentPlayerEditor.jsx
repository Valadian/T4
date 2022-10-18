import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const userByEmailDoc = `
  query UserByEmail($email_address: String = "") {
    User(where: {email: {_eq: $email_address}}) {
      id
      name
    }
  }`;

const updateTournamentPlayerByIdDoc = `
  mutation updateTournamentPlayerById(
    $user_id: uuid = "", $tournament_id: uuid = "", $player_name: String = ""
  ) {
    insert_TournamentPlayer(
      objects: {
        tournament_id: $tournament_id, 
        user_id: $user_id, 
        player_name: $player_name}
    ) {
      returning {
        player_name
        Tournament {
          name
        }
        id
      }
    }
  }`;

const updateTournamentPlayerByNameDoc = `
  mutation updateTournamentPlayerByName(
    $tournament_id: uuid = "", 
    $player_name: String = "", 
    $player_club: String = ""
  ) {
    insert_TournamentPlayer(
      objects: {
        tournament_id: $tournament_id, 
        player_name: $player_name, 
        club: $player_club
      }
    ) {
      returning {
        player_name
        Tournament {
          name
        }
        id
      }
    }
  }`;

export default function TournamentPlayerEditor(props){
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerClub, setNewPlayerClub] = useState("");
    const [addedTournamentPlayer, setAddedTournamentPlayer] = useState("");
    const { getAccessTokenSilently } = useAuth0();
    const {tournament, updateTournament} = useContext(TournamentHomeContext);

    //Email is not a readable property
    // const getUserByEmail = function(player_email) {
    //     // I don't think we actually want to query this here; at the very least, we don't want to give the user feedback on the success of the query
    //     Query("UserByEmail", userByEmailDoc, { email_address: player_email });
    // }

    const updateTournamentPlayerById = async function(player_id) {
        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentPlayerById", updateTournamentPlayerByIdDoc, {
            user_id: player_id,
            tournament_id: tournament.id,
        },accessToken).then((data) =>
            setAddedTournamentPlayer(data.TournamentPlayer)
        );
    }

    const updateTournamentPlayerByName = async () => {
        if (newPlayerName == "") {
            return;
        }

        //TODO: Is this necessary? Defaults to "" now.
        //const player_club = newPlayerClub ?? "";

        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentPlayerByName", updateTournamentPlayerByNameDoc, {
            player_name: newPlayerName,
            tournament_id: tournament.id,
            player_club: newPlayerClub,
        },accessToken)
        .then((data) => {
            setAddedTournamentPlayer(data.insert_TournamentPlayer.returning[0]);
        })
        .then(() => {
          setNewPlayerClub("");
          setNewPlayerName("");
          updateTournament();
          props.onHide();
        });
        // TODO: insert a "success" toast
    };

    const handlePlayerNameUpdate = (event) => {
        setNewPlayerName(event.target.value);
    };

    const handlePlayerClubUpdate = (event) => {
        setNewPlayerClub(event.target.value);
    };

    const handleClose = () => {
        props.show = false;
    };

    if (props && tournament) {
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
              Add Players
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
                      onChange={handlePlayerNameUpdate}
                      value={newPlayerName}
                      autoFocus
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="formPlayerClub"
                  xs={{ span: 5 }}
                >
                  <FloatingLabel
                    controlId="playerClub"
                    label="Club (optional)"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      placeholder="f"
                      onChange={handlePlayerClubUpdate}
                      value={newPlayerClub}
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
          <div>${JSON.stringify(props)}</div>
          <div>${JSON.stringify({
            "newPlayerName":newPlayerName,
            "newPlayerClub":newPlayerClub,
            "addedTournamentPlayer":addedTournamentPlayer
          })}</div>
        </>
      );
    }
}