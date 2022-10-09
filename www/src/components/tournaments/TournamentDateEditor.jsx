import React, { useState, useEffect } from "react";
import Query from "../../data/T4GraphContext";
import { Button, Col, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth0 } from "@auth0/auth0-react";

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

export default function TournamentDateEditor(props) {
    const [newTournamentDate, setNewTournamentDate] = useState(props.tournament.start);
    const { getAccessTokenSilently } = useAuth0();

    const updateTournamentDate = async (new_tournament_date) => {
        if (!(props?.tournament?.id)) {
        return;
        }

        const id = props.tournament.id;

        const accessToken = await getAccessTokenSilently()
        Query("UpdateTournamentDate", updateTournamentDateDoc, {
        start: newTournamentDate,
        tournament_id: id,
        },accessToken).then((data) =>
        // TODO: insert a "success" toast
        setNewTournamentDate(data.start)
        );
        props.update_tournament();
    }

    const handleClose = () => {
        props.show = false;
    };


    if (props && props.tournament && newTournamentDate) {
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
              Update Event Date
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col className="d-flex">
                <DatePicker
                  selected={newTournamentDate}
                  onChange={updateTournamentDate}
                  className=""
                  inline
                />
              </Col>
            </Row>
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