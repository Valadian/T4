import React from "react";
import Query from "../../data/T4GraphContext";
import { Button, Col, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const updateTournamentDateDoc = `
  mutation UpdateTournamentDate($tournament_id: uuid = "", $start: date = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {start: $start}) {
      returning {
        id
        start
      }
    }
  }
`;

class TournamentDateEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_tournament_date: this.props.tournament.start,
    };
  }

  updateTournamentDate() {
    if (!this || !this.state || !this.state.new_tournament_date) {
      return;
    }

    const new_tournament_date = this.state.new_tournament_date;
    const id = this.props.tournament.id;

    Query("UpdateTournamentDate", updateTournamentDateDoc, {
      start: new_tournament_date,
      tournament_id: id,
    }).then((data) =>
      // TODO: insert a "success" toast
      this.setState({ new_tournament_date: data.start })
    );
    this.props.set_date(new_tournament_date);
  }

  handleClose = () => {
    this.props.show = false;
  };

  render() {
    if (this.props && this.props.tournament && this.state) {
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
              Update Event Date
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <DatePicker
                  selected={this.state.new_tournament_date}
                  onChange={(value) => {
                    this.setState({ new_tournament_date: value });
                  }}
                  // className="form-control"
                  inline
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.updateTournamentDate()}>Save</Button>
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
export default TournamentDateEditor;
