import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import { useNavigate } from "react-router-dom";

const deleteDoc = `
mutation deleteTournament($id: uuid = "") {
  update_Tournament_by_pk(pk_columns: {id: $id}, _set: {deleted: true}) {
    id
  }
}
`;

export default function TournamentDeleteModal(props){
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const { getAccessTokenSilently } = useAuth0();
    const {tournament} = useContext(TournamentHomeContext);
    const navigate = useNavigate();

    const deleteTournament = async function(player_id) {
        if(deleteConfirm==="DELETE"){
          const accessToken = await getAccessTokenSilently()
          Query("deleteTournament", deleteDoc, {
              id: tournament.id,
          },accessToken).then((data) => {
            setDeleteConfirm("");
            navigate("/events")
          });
        }
    }

    const handleConfirmationUpdate = (event) => {
      setDeleteConfirm(event.target.value);
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
            <Modal.Title id="contained-modal-title-vcenter" className="text-danger">
              Permanently Delete Tournament
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FloatingLabel
                controlId="confirm"
                label="To Confirm, type: 'DELETE'"
                className="mb-3"
                style={{}}
              >
                <Form.Control
                  type="text"
                  placeholder="f"
                  required
                  onChange={handleConfirmationUpdate}
                  value={deleteConfirm}
                  autoFocus
                />
              </FloatingLabel>
              <p className="text-danger"><b>Note: This is unrecoverable!</b></p>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={deleteTournament} className="btn-danger">DELETE</Button>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }
}