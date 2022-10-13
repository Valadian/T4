import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext";
import { Tournament } from "../../data/Models";
import "react-datepicker/dist/react-datepicker.css";
import TournamentAdminHeader from "../../components/tournaments/TournamentAdminHeader";
import TournamentHeader from "../../components/tournaments/TournamentHeader";
import Ladder from "../../components/tournaments/TournamentLadder";
import { useAuth0 } from "@auth0/auth0-react";
import Toaster from "../../components/Toaster"


const tournamentByIdDoc = `
  query TournamentById($id: uuid) {
    Tournament(order_by: {start: desc}, where: {id: {_eq: $id}}) {
      id
      name
      description
      location
      start
      lists_visible
      lists_locked
      ladder_visible
      signups_open
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Game {
        value
      }
      Creator {
        name
      }
    }
  }
`;
const tournamentPlayersDoc = `
query AllTournamentPlayers($tournament_id: uuid = "") {
  TournamentPlayer(where: {Tournament: {id: {_eq: $tournament_id}}}) {
    player_list_id
    rank
    player_name
    mov
    loss
    win
    tournament_points
    sos
    club
    group
    id
    tournament_id
    user_id
    User {
      name
    }
  }
}
`;
export default function TournamentHome(props) {
    const { id } = useParams();
    const { getAccessTokenSilently } = useAuth0();
    const [tournament, setTournament] = useState();
    const [ladder, setLadder] = useState([]);
    const toaster = useRef(null);


    const queryTournament = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("TournamentById", tournamentByIdDoc, { id: id },accessToken)
        .then((response) => {
            var tournament = null;
            if (response && response.Tournament && response.Tournament.length > 0) {
                tournament = response.Tournament[0];
            } else {
                tournament = new Tournament();
            }
            tournament.start = Date.parse(tournament.start);
            console.log(`Updating the tournament...`);
            console.log(tournament);
            setTournament(tournament);
        })
        .catch((error) => {
            toaster.current.ShowError(error);
        });
    }
    useEffect(() => {
        const fetchData = async () => {
            const accessToken = await getAccessTokenSilently()
            Query("AllTournamentPlayers", tournamentPlayersDoc, {
                tournament_id: tournament.id,
            },accessToken)
            .then((response) => {
                if (response){ //Why is response undefined?
                    setLadder(response.TournamentPlayer)
                }
            })
        }
        fetchData();
    },[tournament])
    
    useEffect(() => {
        queryTournament();
    },[])

    const updateTournament = () => {
        queryTournament();
    };

    const breadcrumbs = () => {
        return (
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
            <li className="breadcrumb-item">
                <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
                <Link to="/events">Events</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
                {(tournament && tournament.name) ||
                "Fetching Event..."}
            </li>
            </ol>
        </nav>
        );
    }

    var is_owner = true; // stand-in for eventual authentication, of course

    if (is_owner) {
        if (tournament) {
            return (
                <>
                {breadcrumbs()}
                <Toaster ref={toaster} />
                <TournamentAdminHeader
                    tournament={tournament}
                    update_tournament={updateTournament}
                />
                <Ladder
                    Ladder={ladder}
                    update_tournament={updateTournament}
                />
                </>
            );
        } else {
            return (
                <>
                {breadcrumbs()}
                <div>Loading...</div>
                </>
            );
        }
    } else {
        if (tournament) {
        return (
            <>
            {breadcrumbs()}
            <TournamentHeader tournament={tournament} />
            </>
        );
        } else {
        return (
            <>
            {breadcrumbs()}
            <div>Loading...</div>
            </>
        );
        }
    }
}