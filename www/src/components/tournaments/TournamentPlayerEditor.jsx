import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const userByEmailDoc = `
  query UserByEmail($email_address: String = "") {
    User(where: {email: {_eq: $email_address}}) {
      id
      name
    }
  }`;

const updateTournamentPlayerByIdDoc = `
  mutation updateTournamentPlayerById($user_id: uuid = "", $tournament_id: uuid = "", $player_name: String = "") {
    insert_TournamentPlayer(objects: {tournament_id: $tournament_id, user_id: $user_id, player_name: $player_name}) {
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

class TournamentPlayerEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_player_name: "",
      new_player_club: "",
    };
    console.log(
      `Invoked TournamentPlayerEditor with props ${JSON.stringify(this.props)}`
    );
  }

  getUserByEmail(player_email) {
    // I don't think we actually want to query this here; at the very least, we don't want to give the user feedback on the success of the query
    Query("UserByEmail", userByEmailDoc, { email_address: player_email });
  }

  updateTournamentPlayerById(player_id) {
    Query("updateTournamentPlayerById", updateTournamentPlayerByIdDoc, {
      user_id: player_id,
      tournament_id: this.props.tournament_id,
    }).then((data) =>
      this.setState({ added_tournament_player: data.TournamentPlayer })
    );
  }

  updateTournamentPlayerByName = () => {
    if (!this.state || !this.state.new_player_name) {
      return;
    }

    const new_player_name = this.state.new_player_name;
    const id = this.props.tournament_id;
    const player_club = this.state.new_player_club
      ? this.state.new_player_club
      : "";

    console.log(`New player name: ${new_player_name}`);
    console.log(`Tournament id: ${id}`);

    Query("updateTournamentPlayerByName", updateTournamentPlayerByNameDoc, {
      player_name: new_player_name,
      tournament_id: id,
      player_club: player_club,
    }).then((data) =>
      this.setState({ added_tournament_player: data.TournamentPlayer })
    );
    // TODO: insert a "success" toast
    this.setState({ new_player_club: "", new_player_name: "" });
  };

  handlePlayerNameUpdate = (event) => {
    console.log(event.target.value);
    this.setState({ new_player_name: event.target.value });
  };

  handlePlayerClubUpdate = (event) => {
    console.log(event.target.value);
    this.setState({ new_player_club: event.target.value });
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props) {
      return (
        <Modal
          {...this.props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.props.show}
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
                      onChange={this.handlePlayerNameUpdate}
                      value={this.state.new_player_name}
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
                      onChange={this.handlePlayerClubUpdate}
                      value={this.state.new_player_club}
                    />
                  </FloatingLabel>
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.updateTournamentPlayerByName}>Add</Button>
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
export default TournamentPlayerEditor;
