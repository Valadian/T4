import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

const updateListLockDoc = `
  mutation updateListLock($tournament_id: uuid = "", $lists_locked: Boolean) {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {lists_locked: $lists_locked}) {
      returning {
        id
        lists_locked
      }
    }
  }
`;

const updateListVisibilityDoc = `
  mutation updateListVisibility($tournament_id: uuid = "", $lists_visible: Boolean) {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {lists_visible: $lists_visible}) {
      returning {
        id
        lists_visible
      }
    }
  }
`;

export default function TournamentListProtectionEditor(props) {
  const [listsAreLocked, setListsAreLocked] = useState(false);
  const [listsAreVisible, setListsAreVisible] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const { tournament, updateTournament } = useContext(TournamentHomeContext);

  const updateTournamentListsLocked = async () => {
    if (!props || !tournament.id) {
      return;
    }

    let listsAreLocked = !tournament.lists_locked;

    const accessToken = await getAccessTokenSilently();
    Query(
      "updateListLock",
      updateListLockDoc,
      {
        lists_locked: listsAreLocked,
        tournament_id: tournament.id,
      },
      accessToken
    )
      .then((data) => {
        setListsAreLocked(data.lists_locked);
        console.log(data.lists_locked);
      })
      .then(() => updateTournament());
  };

  const updateTournamentListsVisible = async () => {
    if (!props || !tournament.id) {
      return;
    }

    // Almost certain this was a bug:
    //let ladderIsVisible = !tournament.ladder_visible;
    // Not a bug, toggling the state.
    let listsAreVisible = !tournament.lists_visible;

    const accessToken = await getAccessTokenSilently();
    Query(
      "updateListVisibility",
      updateListVisibilityDoc,
      {
        lists_visible: listsAreVisible,
        tournament_id: tournament.id,
      },
      accessToken
    )
      .then((data) => setListsAreVisible(data.lists_visible))
      .then(() => updateTournament());
  };

  const handleClose = () => {
    props.show = false;
  };

  if (props) {
    return (
      <Modal
        onHide={props.onHide}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={props.show}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit List Protections
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Form.Group controlId="formListsAreLocked">
                <Form.Check
                  id="lists_locked"
                  type="switch"
                  label="Lock Lists?"
                  onChange={updateTournamentListsLocked}
                  checked={tournament.lists_locked}
                />
              </Form.Group>
              <Form.Group controlId="formListsAreVisible">
                <Form.Switch
                  id="lists_visible"
                  label="Lists Visible?"
                  onChange={updateTournamentListsVisible}
                  checked={tournament.lists_visible}
                />
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
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
