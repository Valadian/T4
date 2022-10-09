import React, { useState, useEffect }  from "react";
import Query from "../../data/T4GraphContext";
import { Form, Button, Col, FloatingLabel, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useAuth0 } from "@auth0/auth0-react";

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

export default function TournamentLadderToggle(props) {
    const [isLadderVisible, setIsLadderVisible] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    const updateLadderVisibility = async () => {
        if (!props || !props.tournament.id) {
            return;
        }
        // Almost certain this was a bug:
        //let ladderIsVisible = !props.tournament.ladder_visible;
        let ladderIsVisible = props.tournament.ladder_visible;

        const accessToken = await getAccessTokenSilently()
        Query("UpdateLadderVisibility", updateLadderVisibilityDoc, {
            ladder_visible: ladderIsVisible,
            tournament_id: props.tournament.id,
        },accessToken)
        .then((data) => setIsLadderVisible( data.ladder_visible ))
        .then(() => props.update_tournament());
    };

    const handleClose = () => {
        props.show = false;
    };

    console.log(`Got here with... ${JSON.stringify(props)}`);
    if (props) {
      return (
        <Button
          variant="outline-primary"
          onClick={updateLadderVisibility}
          size="sm"
        >
          <i className="bi bi-list-ol text-primary"></i>{" "}
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

/*{
   <Button
variant="outline-primary"
onClick={() => {
  setShowTournamentLadderProtectionEditor(true);
}}
size="sm"
>
<i className="bi bi-list-ol text-primary"></i>{" "}
<span className="text-white">{ladder_visibility}</span>
</Button> 
}*/