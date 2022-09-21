import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

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

class TournamentListProtectionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listsAreLocked: "",
      listsAreVisible: "",
    };
  }

  updateTournamentListsLocked = () => {
    if (!this.props || !this.props.tournament.id) {
      return;
    }
    let listsAreLocked = !this.props.tournament.lists_locked;

    Query("updateListLock", updateListLockDoc, {
      lists_locked: listsAreLocked,
      tournament_id: this.props.tournament.id,
    })
      .then((data) => this.setState({ listsAreLocked: data.lists_locked }))
      .then(() => this.props.update_tournament());
  };

  updateTournamentListsVisible = () => {
    if (!this.props || !this.props.tournament.id) {
      return;
    }

    let listsAreVisible = !this.props.tournament.lists_visible;

    Query("updateListVisibility", updateListVisibilityDoc, {
      lists_visible: listsAreVisible,
      tournament_id: this.props.tournament.id,
    })
      .then((data) => this.setState({ listsAreLocked: data.lists_visible }))
      .then(() => this.props.update_tournament());
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props) {
      return (
        <Modal
          onHide={this.props.onHide}
          size="sm"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.props.show}
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
                    onChange={this.updateTournamentListsLocked}
                    checked={this.props.tournament.lists_locked}
                  />
                </Form.Group>
                <Form.Group controlId="formListsAreVisible">
                  <Form.Switch
                    id="lists_visible"
                    label="Lists Visible?"
                    onChange={this.updateTournamentListsVisible}
                    checked={this.props.tournament.lists_visible}
                  />
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.onHide}>Close</Button>
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
}
export default TournamentListProtectionEditor;
