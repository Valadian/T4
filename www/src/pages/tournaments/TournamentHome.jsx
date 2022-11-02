import React, { useState, useEffect, useRef, createContext, useReducer } from "react";
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
import TournamentSignUp from "../../components/tournaments/TournamentSignUp"


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
      public
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
        id
        name
      }
      Matches(order_by: {Match: {Round: {round_num: asc}}}) {
        id
        confirmed
        points
        opp_points
        mov
        win
        tournament_points
        TournamentOpponent {
          player_name
          User {
            id
            name
          }
          Matches {
            tournament_points
            confirmed
            Match {
                Round {
                  finalized
                }
              }
          }
        }
        Match {
          table_num
          Round {
            round_num
            finalized
          }
        }
      }
    }
  }
  
`;
const roundsDoc = `
query AllTournamentRounds($tournament_id: uuid!) {
    TournamentRound(where: {tournament_id: {_eq: $tournament_id}},order_by: {round_num: asc}) {
        Matches(order_by: {table_num: asc}) {
            id
            table_num
            Players {
                id
                match_id
                win
                tournament_points
                points
                opp_points
                confirmed
                player_name
                mov
                User {
                    id
                    name
                }
                TournamentOpponent {
                    id
                    player_name
                    User {
                        id
                        name
                    }
                }
                TournamentPlayer {
                    id
                    player_name
                    User {
                        id
                        name
                    }
                }
            }
        }
        id
        round_num
        description
        finalized
    }
}`;

const TournamentHomeContext = createContext()

function TournamentHome(props) {
    const { id } = useParams();
    const { user, getAccessTokenSilently } = useAuth0();
    const [tournament, setTournament] = useState();
    const [finalizedOnly, setFinalizedOnly] = useState(true);
    const [rounds, setRounds] = useState([]);
    const [activeTab, setActiveTab] = useState("ladder")
    const toaster = useRef(null);
    const [showSignUpTab, setShowSignUpTab] = useState(true);
    // const [ladder, setLadder] = useState([]);
    const sum = (arr) => arr.reduce((a, b) => a + b,0)
    const avg = (arr) => arr.length===0?0:sum(arr)/arr.length
    const max = (arr) => arr.reduce((a, b) => Math.max(a, b),0)
    const bakeLadder = (ladder, finalOnly) => {
        for(let l of ladder){
            if(finalOnly){
                l.tournament_points = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.tournament_points))
                l.mov = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.mov))
                l.win = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.win===true?1:0))
                l.loss = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.win===false?1:0))
                l.tournament_points_avg = l.tournament_points/(l.win+l.loss)
                l.mov_avg = l.mov/(l.win+l.loss)
                l.sos = avg(l.Matches.filter(mp => mp.Match.Round.finalized).filter(m=>m.win!=null).map(m => avg(m.TournamentOpponent?.Matches.filter(mp => mp.Match.Round.finalized).filter(m=>m.tournament_points!=null).map(om => om.tournament_points)??[3])))
            } else {
                l.tournament_points = sum(l.Matches.map(m => m.tournament_points))
                l.mov = sum(l.Matches.map(m => m.mov))
                l.win = sum(l.Matches.map(m => m.win===true?1:0))
                l.loss = sum(l.Matches.map(m => m.win===false?1:0))
                l.tournament_points_avg = l.tournament_points/(l.win+l.loss)
                l.mov_avg = l.mov/(l.win+l.loss)
                l.sos = avg(l.Matches.filter(m=>m.win!=null).map(m => avg(m.TournamentOpponent?.Matches.filter(m=>m.tournament_points!=null).map(om => om.tournament_points)??[3])))
            }
        }
        ladder.sort((a,b) => (b.tournament_points - a.tournament_points) || (b.mov - a.mov) || (b.sos - a.sos))
        //ladder.sort((a,b) => (b.tournament_points_avg - a.tournament_points_avg) || (b.mov_avg - a.mov_avg) || (b.sos - a.sos))
        
        let rank = 1 
        for(let l of ladder){
            l.rank = rank
            rank++
        }
        return ladder
    }
    const ladderReducer = (state, action) => {
        switch(action.type){
            case 'live':
                return bakeLadder(state, false)
            case 'finalized':
                return bakeLadder(state, true)
            case 'reset':
                bakeLadder(action.payload, finalizedOnly)
                return action.payload
            default:
                throw new Error();
        }
    }
    const [ladder, dispatchLadder] = useReducer(ladderReducer, []);
    // const [ladderMap, setLadderMap] = useState();
    
    useEffect(() => {
        if(ladder && tournament && user){
            var registered = ladder.map(l => user && (l.User?.id===user.sub)).reduce((a,b) => a||b,false) 
            setShowSignUpTab(tournament.signups_open && user && !registered)
        } else {
            setShowSignUpTab(false)
        }
    },[tournament, ladder, user])
    // const rebakeLadder = (finalizedOnlyOverride) => {
    //     bakeLadder(ladder)
    //     console.log(max(ladder.map(l => l.win+l.loss)))
    //     setLadder(ladder)
    // }
    // useEffect(() => {
    //     rebakeLadder(ladder)
        
    // },[ladder])

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
                    if (response && response.TournamentPlayer){ //Why is response undefined?
                        //bakeLadder(response.TournamentPlayer)
                        dispatchLadder({type: 'reset', payload: response.TournamentPlayer})
                        // setLadder(response.TournamentPlayer)
                        //setLadderMap(Object.assign({}, ...response.TournamentPlayer.map((l)=>({[l.User?.id??l.player_name]: l}))))
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
        var isParticipant = user!=null && ladder.filter(l => l.User).map((l)=>l.User?.id).includes(user?.sub)
        const context = {
            tournament, setTournament,
            ladder, dispatchLadder,
            rounds, setRounds,
            toaster,
            updateTournament,
            isOwner,
            isParticipant,
            activeTab,
            setActiveTab,
            finalizedOnly,
            setFinalizedOnly
            // rebakeLadder
        }

        //var round_count = matches.map(m => m.)
        return (
            <TournamentHomeContext.Provider value={context}>
                {breadcrumbs()}
                {isOwner && !tournament.public?<>
                    <h2 className="text-warning">This event is a Draft and hidden</h2>
                    <p className="text-muted">Click <b>Draft</b> toggle below to make public</p>
                </>:<></>}
                <Toaster ref={toaster} />
                {isOwner?<TournamentAdminHeader/>:<TournamentHeader/>}
                <Tabs
                    activeKey={activeTab}
                    onSelect={setActiveTab}
                    defaultActiveKey="ladder"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    // fill
                >
                    <Tab eventKey="ladder" title={<span><i className="bi bi-list-ol"></i> Ladder</span>}>
                        <Ladder />
                    </Tab>
                    <Tab eventKey="rounds" title={<span><i className="bi bi-play-circle-fill"></i> Rounds</span>}>
                        <TournamentRoundsTab />
                    </Tab>
                    {/* <Tab eventKey="log" title={<span><i className="bi bi-journals"></i> <span className="d-none d-md-inline">Event </span>Logs</span>}>
                    </Tab> */}
                    {isParticipant?<Tab eventKey="submit" title={<span><i className="bi bi-trophy-fill"></i> My Scores</span>}>
                        <TournamentResultSubmission />
                    </Tab>:<></>}
                    {showSignUpTab?<Tab eventKey="signup" title={<span><i className="bi bi-person-plus-fill"></i> Sign Up</span>}>
                        <TournamentSignUp />
                    </Tab>:<></>}
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