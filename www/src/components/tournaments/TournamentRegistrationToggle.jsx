import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

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
    const { getAccessTokenSilently } = useAuth0();
    const {tournament, updateTournament} = useContext(TournamentHomeContext);

    const updateTournamentRegistration = async() => {
        if (!props || !tournament.id) {
            return;
        }
        let registrationIsOpen = !tournament.signups_open;

        const accessToken = await getAccessTokenSilently()
        Query("updateRegistration", updateRegistrationDoc, {
            signups_open: registrationIsOpen,
            tournament_id: tournament.id,
        },accessToken)
        .then(() => updateTournament());
    };

    const handleClose = () => {
        props.show = false;
    };

    if (props) {
        return (
            <Button
                variant={tournament.signups_open?"outline-success":"outline-secondary"}
                onClick={() => {
                    updateTournamentRegistration();
                }}
                size="sm"
            >
                <i className="bi bi-person-plus-fill text-primary"></i>{" "}
                <span>{props.button_text}</span>
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