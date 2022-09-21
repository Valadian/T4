import React from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const updateLadderVisibilityDoc = `
  mutation UpdateLadderVisibility($ladder_visible: Boolean, $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {ladder_visible: $ladder_visible}) {
      returning {
        id
        ladder_visible
      }
    }
  }
`;

class TournamentLadderToggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ladderIsVisible: "",
    };
  }

  updateLadderVisibility = () => {
    if (!this.props || !this.props.tournament.id) {
      return;
    }
    let ladderIsVisible = !this.props.tournament.ladder_visible;

    Query("UpdateLadderVisibility", updateLadderVisibilityDoc, {
      ladder_visible: ladderIsVisible,
      tournament_id: this.props.tournament.id,
    })
      .then((data) => this.setState({ ladderIsVisible: data.ladder_visible }))
      .then(() => this.props.update_tournament());
  };

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    console.log(`Got here with... ${JSON.stringify(this.props)}`);
    if (this.props) {
      return (
        <Button
          variant="outline-primary"
          onClick={() => {
            this.updateLadderVisibility();
          }}
          size="sm"
        >
          <i className="bi bi-list-ol text-primary"></i>{" "}
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
export default TournamentLadderToggle;

{
  /* <Button
variant="outline-primary"
onClick={() => {
  setShowTournamentLadderProtectionEditor(true);
}}
size="sm"
>
<i className="bi bi-list-ol text-primary"></i>{" "}
<span className="text-white">{ladder_visibility}</span>
</Button> */
}
