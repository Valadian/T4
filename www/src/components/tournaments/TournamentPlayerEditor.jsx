import React from "react";
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext";
import { User } from "../../data/Models";
import { Collapse } from "bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const tournamentPlayersByIdDoc = `
  query tournamentPlayersById($tournament_id: uuid = "") {
    TournamentPlayer(where: {tournament_id: {_eq: $tournament_id}}) {
      id
      player_name
    }
  }`;

const playerByEmailDoc = `
  query PlayerByEmail($email_address: String = "") {
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
mutation updateTournamentPlayerByName($tournament_id: uuid = "", $player_name: String = "") {
  insert_TournamentPlayer(objects: {tournament_id: $tournament_id, player_name: $player_name}) {
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
    console.log("Invoked TournamentPlayerEditor");
  }

  handleClose() {
    this.props.show = false;
  }

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
              Add Player
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Centered Modal</h4>
            <p>
              Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
              dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
              ac consectetur ac, vestibulum at eros.
            </p>
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
export default TournamentPlayerEditor;
