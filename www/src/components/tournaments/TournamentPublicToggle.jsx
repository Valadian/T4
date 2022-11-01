import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";

const updatePublicDoc = `
  mutation UpdatePublic($public: Boolean, $tournament_id: uuid = "") {
    update_Tournament(where: {id: {_eq: $tournament_id}}, _set: {public: $public}) {
      returning {
        id
        public
      }
    }
  }
`;

export default function TournamentPublicToggle(props) {
  const { getAccessTokenSilently } = useAuth0();
  const { tournament, updateTournament } = useContext(TournamentHomeContext);

  const updatePublic = async () => {
    if (!props || !tournament.id) {
      return;
    }

    const accessToken = await getAccessTokenSilently();
    Query(
      "UpdatePublic",
      updatePublicDoc,
      {
        public: !tournament.public,
        tournament_id: tournament.id,
      },
      accessToken
    )
      .then(() => updateTournament());
  };

  const handleClose = () => {
    props.show = false;
  };

  //console.log(`Got here with... ${JSON.stringify(props)}`);
  if (props) {
    return (
      <Button
        variant={tournament.public?"outline-success":"outline-warning"}
        onClick={updatePublic}
        size="sm"
      >
        <i className="bi bi-list-ol text-primary"></i>{" "}
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

/*{
   <Button
variant="outline-secondary"
onClick={() => {
  setShowTournamentLadderProtectionEditor(true);
}}
size="sm"
>
<i className="bi bi-list-ol text-primary"></i>{" "}
<span>{ladder_visibility}</span>
</Button> 
}*/
