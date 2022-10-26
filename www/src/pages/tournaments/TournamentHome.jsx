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
    const [ladder, setLadder] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [activeTab, setActiveTab] = useState("ladder")
    const toaster = useRef(null);
    const [showSignUpTab, setShowSignUpTab] = useState(true);
    
    useEffect(() => {
        if(ladder && tournament && user){
            var registered = ladder.map(l => user && (l.User?.id===user.sub)).reduce((a,b) => a||b,false) 
            setShowSignUpTab(tournament.signups_open && user && !registered)
        } else {
            setShowSignUpTab(false)
        }
    },[tournament, ladder, user])

    useEffect(() => {
        if(ladder){
            for(var l of ladder){
                l.mov = 0
                l.tournament_points=0
                l.win=0
                l.loss=0
                l.sos=0
            }
            let ladderDict = Object.assign({}, ...ladder.map((l)=>({[l.User?.id??l.player_name]: l})))
            for(var r of rounds){
                if(r.finalized){
                    for(var m of r.Matches){
                        for(var p of m.Players){
                            var key = p.User?.id??p.player_name
                            var l = ladderDict[key]
                            if(l){
                                l.mov+=p.mov
                                l.tournament_points+=p.tournament_points
                                if (p.win){
                                    l.win++
                                } else {
                                    l.loss++
                                }
                            }
                        }
                    }
                }
            }
            for(var r of rounds){
                if(r.finalized){
                    for(var m of r.Matches){
                        var p1 = m.Players[0]
                        var p2 = m.Players[1]
                        if(p1 && p2){
                            var p1_key = p1.User?.id??p1.player_name
                            var p2_key = p2.User?.id??p2.player_name
                            var p1_l = ladderDict[p1_key]
                            var p2_l = ladderDict[p2_key]
                            if(p1_l && p2_l){
                                p1_l.sos = (p1_l.sos_num??0)*(p1_l.sos??0) + p2_l.tournament_points/(p2_l.win+p2_l.loss)
                                p1_l.sos_num = (p1_l.sos_num??0) + 1
                                p1_l.sos = p1_l.sos/p1_l.sos_num
                                p2_l.sos = (p2_l.sos_num??0)*(p2_l.sos??0) + p1_l.tournament_points/(p1_l.win+p1_l.loss)
                                p2_l.sos_num = (p2_l.sos_num??0) + 1
                                p2_l.sos = p2_l.sos/p2_l.sos_num
                            }
                            if(p2_l && p1_l==null){
                                p2_l.sos = (p2_l.sos_num??0)*(p2_l.sos??0) + 3 //Bye
                                p2_l.sos_num = (p2_l.sos_num??0) + 1
                                p2_l.sos = p2_l.sos/p2_l.sos_num
                            }
                            if(p1_l && p2_l==null){
                                p1_l.sos = (p1_l.sos_num??0)*(p1_l.sos??0) + 3 //Bye
                                p1_l.sos_num = (p1_l.sos_num??0) + 1
                                p1_l.sos = p1_l.sos/p1_l.sos_num
                            }
                        }
                    }
                }
            }
            ladder.sort((a,b) => (b.tournament_points - a.tournament_points) || (b.mov - a.mov) || (b.sos - a.sos))
            var rank = 1 
            for(var l of ladder){
                l.rank = rank
                rank++
            }
            setLadder(ladder)
            //Go through again for SoS
        }
    },[ladder, rounds])
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
        var isParticipant = user!=null && ladder.filter(l => l.User).map((l)=>l.User?.id).includes(user?.sub)
        const context = {
            tournament, setTournament,
            ladder, setLadder,
            rounds, setRounds,
            toaster,
            updateTournament,
            isOwner,
            isParticipant,
            activeTab,
            setActiveTab
        }

        //var round_count = matches.map(m => m.)
        return (
            <TournamentHomeContext.Provider value={context}>
                {breadcrumbs()}
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
                    <Tab eventKey="log" title={<span><i className="bi bi-journals"></i> <span className="d-none d-md-inline">Event </span>Logs</span>}>
                    </Tab>
                    {isParticipant?<Tab eventKey="submit" title={<span><i className="bi bi-trophy-fill"></i> <span className="d-none d-md-inline">Result Submission</span><span className="d-inline d-md-none">Submit</span></span>}>
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