import React, { useState, useEffect, useRef, createContext } from "react";
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext";
import { Tournament } from "../../data/Models";
import "react-datepicker/dist/react-datepicker.css";
import Ladder from "../../components/tournaments/TournamentLadder";
import { useAuth0 } from "@auth0/auth0-react";
import Toaster from "../../components/Toaster"
import {Tabs, Tab} from 'react-bootstrap'
import TournamentAdminHeader from "../../components/tournaments/TournamentAdminHeader";
import TournamentHeader from "../../components/tournaments/TournamentHeader";
import TournamentRoundsTab from "../../components/tournaments/TournamentRoundsTab";
import TournamentResultSubmission from "../../components/tournaments/TournamentResultSubmission"


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
        id
      }
    }
  }
`;
const tournamentPlayersDoc = `
query AllTournamentPlayers($tournament_id: uuid!) {
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
const roundsDoc = `
query AllTournamentRounds($tournament_id: uuid!) {
    TournamentRound(where: {tournament_id: {_eq: $tournament_id}}) {
        Matches {
            id
            table_num
            Players {
                id
                match_id
                win
                tournament_points
                points
                confirmed
                player_name
                User {
                    id
                    name
                }
            }
        }
        id
        round_num
        description
    }
}`;

const TournamentHomeContext = createContext()

function TournamentHome(props) {
    const { id } = useParams();
    const { user, getAccessTokenSilently } = useAuth0();
    const [tournament, setTournament] = useState();
    const [ladder, setLadder] = useState([]);
    const [rounds, setRounds] = useState([]);
    const toaster = useRef(null);


    const queryTournament = async () => {
        var accessToken = undefined
        if (user) {
            accessToken = await getAccessTokenSilently()
        }
        Query("TournamentById", tournamentByIdDoc, { id: id },accessToken)
        .then((response) => {
            var tournament = null;
            if (response && response.Tournament && response.Tournament.length > 0) {
                tournament = response.Tournament[0];
            } else {
                tournament = new Tournament();
            }
            tournament.start = Date.parse(tournament.start);
            // console.log(`Updating the tournament...`);
            // console.log(tournament);
            setTournament(tournament);
        })
        .catch((error) => {
            toaster.current.ShowError(error);
        });
    }
    useEffect(() => {
        if(tournament){
            const fetchData = async () => {
                var accessToken = undefined
                if (user) {
                    accessToken = await getAccessTokenSilently()
                }
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
        }
    },[tournament])
    useEffect(() => {
        if(tournament) {
            const fetchData = async () => {
                var accessToken = undefined
                if (user) {
                    accessToken = await getAccessTokenSilently()
                }
                Query("AllTournamentRounds", roundsDoc, {
                    tournament_id: tournament.id,
                },accessToken)
                .then((response) => {
                    if (response){ //Why is response undefined?
                        setRounds(response.TournamentRound)
                    }
                })
            }
            fetchData();
        }
    }, [tournament])
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
    if (tournament?.id) {
        var isOwner = user?.sub === tournament.Creator.id;
        
        const context = {
            tournament, setTournament,
            ladder, setLadder,
            rounds, setRounds,
            toaster,
            updateTournament,
            isOwner
        }
        //var round_count = matches.map(m => m.)
        return (
            <TournamentHomeContext.Provider value={context}>
                {breadcrumbs()}
                <Toaster ref={toaster} />
                {isOwner?<TournamentAdminHeader/>:<TournamentHeader/>}
                <Tabs
                    defaultActiveKey="ladder"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    fill
                >
                    <Tab eventKey="ladder" title={<span><i className="bi bi-list-ol"></i> Ladder</span>}>
                        <Ladder />
                    </Tab>
                    <Tab eventKey="rounds" title={<span><i className="bi bi-play-circle-fill"></i> Rounds</span>}>
                        <TournamentRoundsTab />
                    </Tab>
                    <Tab eventKey="log" title={<span><i className="bi bi-journals"></i> Event Logs</span>}>
                    </Tab>
                    <Tab eventKey="submit" title={<span><i className="bi bi-trophy-fill"></i> Result Submission</span>}>
                        <TournamentResultSubmission />
                    </Tab>
                    <Tab eventKey="signup" title={<span><i className="bi bi-person-plus-fill"></i> Sign Up</span>}>
                    </Tab>
                </Tabs>
            </TournamentHomeContext.Provider>
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
export {TournamentHome, TournamentHomeContext}