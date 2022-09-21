import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const updateRegistrationDoc = `
  mutation updateRegistration($signups_open: Boolean, $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {signups_open: $signups_open}) {
      returning {
        name
        signups_open
      }
    }
  }
`;

class TournamentRegistrationToggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrationIsOpen: "",
    };
  }

  updateTournamentRegistration = () => {
    if (!this.props || !this.props.tournament.id) {
      return;
    }
    let registrationIsOpen = !this.props.tournament.signups_open;

    Query("updateRegistration", updateRegistrationDoc, {
      signups_open: registrationIsOpen,
      tournament_id: this.props.tournament.id,
    })
      .then((data) => this.setState({ registrationIsOpen: data.signups_open }))
      .then(() => this.props.update_tournament());
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props) {
      return (
        <Button
          variant="outline-primary"
          onClick={() => {
            this.updateTournamentRegistration();
          }}
          size="sm"
        >
          <i className="bi bi-person-plus-fill text-primary"></i>{" "}
          <span className="text-white">{this.props.button_text}</span>
        </Button>
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
export default TournamentRegistrationToggle;
