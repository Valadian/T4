import React, { useState, useEffect } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";

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

export default function TournamentRegistrationToggle(props) {
    const [registrationIsOpen, setRegistrationIsOpen] = useState("");
    const { getAccessTokenSilently } = useAuth0();

    const updateTournamentRegistration = async() => {
        if (!props || !props.tournament.id) {
            return;
        }
        let registrationIsOpen = !props.tournament.signups_open;

        const accessToken = await getAccessTokenSilently()
        Query("updateRegistration", updateRegistrationDoc, {
            signups_open: registrationIsOpen,
            tournament_id: props.tournament.id,
        },accessToken)
        .then((data) => setRegistrationIsOpen(data.signups_open))
        .then(() => props.update_tournament());
    };

    const handleClose = () => {
        props.show = false;
    };

    if (props) {
        return (
            <Button
                variant="outline-primary"
                onClick={() => {
                    updateTournamentRegistration();
                }}
                size="sm"
            >
                <i className="bi bi-person-plus-fill text-primary"></i>{" "}
                <span className="text-white">{props.button_text}</span>
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