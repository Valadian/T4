import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useReducer,
  useCallback,
} from "react";
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext";
import "react-datepicker/dist/react-datepicker.css";
import Ladder from "../../components/tournaments/TournamentLadder";
import { useAuth0 } from "@auth0/auth0-react";
import Toaster from "../../components/Toaster";
import { Tabs, Tab } from "react-bootstrap";
import TournamentAdminHeader from "../../components/tournaments/TournamentAdminHeader";
import TournamentHeader from "../../components/tournaments/TournamentHeader";
import TournamentRoundsTab from "../../components/tournaments/TournamentRoundsTab";
import TournamentResultSubmission from "../../components/tournaments/TournamentResultSubmission"
import TournamentSignUp from "../../components/tournaments/TournamentSignUp"
import getScoringConfig from "../../util/rulesets"

// const tournamentByIdDoc = `
//   query TournamentById($id: uuid) {
//     Tournament(order_by: {start: desc}, where: {id: {_eq: $id}}) {
//       id
//       name
//       description
//       location
//       start
//       lists_visible
//       lists_locked
//       ladder_visible
//       signups_open
//       public
//       Ladder_aggregate {
//         aggregate {
//           count
//         }
//       }
//       Game {
//         key
//         value
//       }
//       ScoringRuleset {
//         name
//       }
//       Creator {
//         name
//         id
//       }
//       Ladder {
//         player_list_id
//         rank
//         player_name
//         mov
//         loss
//         win
//         tournament_points
//         sos
//         club
//         group
//         id
//         tournament_id
//         disqualified
//         user_id
//         User {
//           id
//           name
//         }
//         Matches(order_by: {Match: {Round: {round_num: asc}}}) {
//           id
//           confirmed
//           points
//           opp_points
//           mov
//           win
//           draw
//           tournament_points
//           disqualified
//           tournament_opponent_id
//           TournamentOpponent {
//             id
//             player_name
//             User {
//               id
//               name
//             }
//             Matches {
//               tournament_points
//               confirmed
//               Match {
//                 Round {
//                   finalized
//                 }
//               }
//             }
//           }
//           Match {
//             table_num
//             Round {
//               round_num
//               finalized
//             }
//           }
//         }
//       }
//       Rounds(order_by: {round_num: asc}) {
//         Matches(order_by: {table_num: asc}) {
//             id
//             table_num
//             Players(order_by: {id: asc}) {
//                 id
//                 match_id
//                 win
//                 draw
//                 tournament_points
//                 points
//                 opp_points
//                 confirmed
//                 player_name
//                 mov
//                 disqualified
//                 User {
//                     id
//                     name
//                 }
//                 tournament_opponent_id
//                 TournamentOpponent {
//                     id
//                     player_name
//                     User {
//                         id
//                         name
//                     }
//                 }
//                 tournament_player_id
//                 TournamentPlayer {
//                     id
//                     player_name
//                     User {
//                         id
//                         name
//                     }
//                 }
//             }
//         }
//         id
//         round_num
//         description
//         finalized
//       }
//     }
//   }
// `;

const tournamentByIdDoc = `
  query TournamentById($id: uuid) {
    Tournament(order_by: { start: desc }, where: { id: { _eq: $id } }) {
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
        key
        value
      }
      ScoringRuleset {
        name
      }
      Creator {
        name
        id
      }
      Ladder {
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
        disqualified
        user_id
        User {
          id
          name
        }
        Matches(
          order_by: { Match: { Round: { round_num: asc } } },
          where: { deleted: { _eq: false } }
        ) {
          id
          confirmed
          points
          opp_points
          mov
          win
          draw
          tournament_points
          disqualified
          tournament_opponent_id
          tournament_player_id
          Match {
            table_num
            Round {
              round_num
              finalized
            }
          }
        }
      }
      Rounds(order_by: { round_num: asc }, where: { deleted: { _eq: false } }) {
        Matches(
          order_by: { table_num: asc }
          where: { deleted: { _eq: false } }
        ) {
          id
          table_num
          Players(order_by: { id: asc }, where: { deleted: { _eq: false } }) {
            id
            match_id
            win
            draw
            tournament_points
            points
            opp_points
            confirmed
            player_name
            mov
            disqualified
            User {
              id
              name
            }
            tournament_opponent_id
            tournament_player_id
          }
        }
        id
        round_num
        description
        finalized
      }
    }
  }
  `;
const TournamentHomeContext = createContext();

function TournamentHome() {
    const { id } = useParams();
    const { user, getAccessTokenSilently } = useAuth0();
    const [finalizedOnly, setFinalizedOnly] = useState(false);
    const [activeTab, setActiveTab] = useState("ladder")
    const toaster = useRef(null);
    const [showSignUpTab, setShowSignUpTab] = useState(false);
    const [config, setConfig] = useState(getScoringConfig())
    const sum = (arr) => arr.reduce((a, b) => a + b,0)
    const avg = (arr) => arr.length===0?0:sum(arr)/arr.length
    // const max = (arr) => arr.reduce((a, b) => Math.max(a, b),0)
    const bakeLadder = (tournament, finalOnly) => {
        if(tournament){
            let config = getScoringConfig(tournament?.Game?.key,tournament?.ScoringRuleset?.name)
            setConfig(config)
            
            //Make Tournament fully self referential
            let tpcache = Object.fromEntries(tournament.Ladder.map(l => [l.id,l]));
            for(let tp of tournament.Ladder){
                for (let mp of tp.Matches){
                    mp.TournamentOpponent = tpcache[mp.tournament_opponent_id]
                    mp.TournamentPlayer = tpcache[mp.tournament_player_id]
                }
            }
            for(let r of tournament.Rounds){
                for(let m of r.Matches){
                    for(let mp of m.Players){
                        mp.TournamentPlayer = tpcache[mp.tournament_player_id]
                        mp.TournamentOpponent = tpcache[mp.tournament_opponent_id]
                    }
                }
            }
            for(let l of tournament.Ladder){
                if(finalOnly){
                    l.tournament_points = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.tournament_points))
                    l.mov = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.mov))
                    l.win = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => m.win===true?1:0))
                    l.loss = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => (m.win===false && !m.draw)?1:0))
                    l.draw = sum(l.Matches.filter(mp => mp.Match.Round.finalized).map(m => (m.draw===true)?1:0))
                    l.tournament_points_avg = l.tournament_points/(l.win+l.loss)
                    l.mov_avg = l.mov/(l.win+l.loss)
                    l.sos = avg(l.Matches.filter(mp => mp.Match.Round.finalized).filter(m=>m.win!=null).map(
                        m => avg(m.TournamentOpponent?.Matches.filter(mp => mp.Match.Round.finalized).filter(m=>m.tournament_points!=null).map(
                            om => om.tournament_points)??[config.BUY_OPP_TPS])))
                    
                } else {
                    l.tournament_points = sum(l.Matches.map(m => m.tournament_points))
                    l.mov = sum(l.Matches.map(m => m.mov))
                    l.win = sum(l.Matches.map(m => m.win===true?1:0))
                    l.loss = sum(l.Matches.map(m => (m.win===false && !m.draw)?1:0))
                    l.draw = sum(l.Matches.map(m => (m.draw===true)?1:0))
                    l.tournament_points_avg = l.tournament_points/(l.win+l.loss)
                    l.mov_avg = l.mov/(l.win+l.loss)
                    l.sos = avg(l.Matches.filter(m=>m.win!=null).map(
                        m => avg(m.TournamentOpponent?.Matches.filter(m=>m.tournament_points!=null).map(
                            om => om.tournament_points)??[config.BUY_OPP_TPS])))
                    
                }
            }
            //Need to calculate base metrics for everyone first!
            for(let l of tournament.Ladder){
                if(finalOnly){
                    for(let key in config.CUSTOM_TOURNAMENT_METRICS){
                        l[key] = config.CUSTOM_TOURNAMENT_METRICS[key](l,mp => mp.Match.Round.finalized)
                    }
                } else {
                    for(let key in config.CUSTOM_TOURNAMENT_METRICS){
                        l[key] = config.CUSTOM_TOURNAMENT_METRICS[key](l)
                    }
                }
            }
            tournament.Ladder.sort((a,b) => {
                // (b.tournament_points - a.tournament_points) || (b.mov - a.mov) || (b.sos - a.sos)
                let props = config.LADDER_SORT;
                let result = 0
                for(let prop of props){
                    result = b[prop] - a[prop];
                    if(result!==0){
                        break;
                    }
                }
                return result
            })
            
            let rank = 1 
            for(let l of tournament.Ladder){
                l.rank = rank
                rank++
            }
        }
    return tournament;
  };
  const ladderReducer = (state, action) => {
    switch (action.type) {
      case "live":
        return bakeLadder(state, false);
      case "finalized":
        return bakeLadder(state, true);
      case "reset":
        bakeLadder(action.payload, finalizedOnly);
        return action.payload;
      default:
        throw new Error();
    }
    const [tournament, dispatchTournament] = useReducer(ladderReducer, null);
    
    // useEffect(() => {
    //     setConfig(getScoringConfig(tournament?.Game?.key,tournament?.ScoringRuleset?.name))
    // },[tournament])

    useEffect(() => {
        if(tournament && user){
            var registered = tournament.Ladder.map(l => user && (l.User?.id===user.sub)).reduce((a,b) => a||b,false) 
            setShowSignUpTab(tournament.signups_open && user && !registered)
        }
    },[tournament, user])

  const queryTournament = useCallback(async () => {
    var accessToken = undefined;
    if (user) {
      accessToken = await getAccessTokenSilently();
    }
    await Query("TournamentById", tournamentByIdDoc, { id: id }, accessToken)
      .then((response) => {
        var tournament = null;
        if (response && response.Tournament && response.Tournament.length > 0) {
          tournament = response.Tournament[0];
          tournament.start = Date.parse(tournament.start);
          dispatchTournament({ type: "reset", payload: tournament });
        }
      })
      .catch((error) => {
        toaster.current.ShowError(error);
      });
  }, [id, getAccessTokenSilently, user]);

  useEffect(() => {
    queryTournament();
  }, [id, queryTournament]);

    const updateTournament = () => {
        queryTournament();
    };
    const breadcrumbs = useCallback(() => {
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
                {(tournament?.name) ||
                "Fetching Event..."}
            </li>
            </ol>
        </nav>
        );
    },[tournament?.name])
    
    if (tournament?.id) {
        var isOwner = user?.sub === tournament.Creator.id;
        var isParticipant = user!=null && tournament.Ladder.filter(l => l.User).map((l)=>l.User?.id).includes(user?.sub)
        const context = {
            tournament, dispatchTournament,
            toaster,
            updateTournament,
            isOwner,
            isParticipant,
            activeTab,
            setActiveTab,
            finalizedOnly,
            setFinalizedOnly,
            config
            // rebakeLadder
        }

    //var round_count = matches.map(m => m.)
    return (
      <TournamentHomeContext.Provider value={context}>
        {breadcrumbs()}
        {isOwner && !tournament.public ? (
          <>
            <h2 className="text-warning">This event is a Draft and hidden</h2>
            <p className="text-muted">
              Click <b>Draft</b> toggle below to make public
            </p>
          </>
        ) : (
          <></>
        )}
        <Toaster ref={toaster} />
        {isOwner ? <TournamentAdminHeader /> : <TournamentHeader />}
        {isOwner &&
        tournament.signups_open &&
        tournament.Rounds.length > 0 &&
        tournament.Rounds[0].Matches.length > 0 ? (
          <h2 className="text-warning">
            Round 1 matchups generated but sign ups remain open (Disable above)
          </h2>
        ) : (
          <></>
        )}
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          defaultActiveKey="ladder"
          id="uncontrolled-tab-example"
          className="mb-3"
          // fill
        >
          <Tab
            eventKey="ladder"
            title={
              <span>
                <i className="bi bi-list-ol"></i> Ladder
              </span>
            }
          >
            {!tournament.ladder_visible ? (
              <h3 className="text-warning">
                <i className="bi bi-lock-fill"></i> Ladder is Hidden
              </h3>
            ) : (
              <></>
            )}
            {tournament.ladder_visible || isOwner ? <Ladder /> : <></>}
          </Tab>
          <Tab
            eventKey="rounds"
            title={
              <span>
                <i className="bi bi-play-circle-fill"></i> Rounds
              </span>
            }
          >
            <TournamentRoundsTab />
          </Tab>
          {/* <Tab eventKey="log" title={<span><i className="bi bi-journals"></i> <span className="d-none d-md-inline">Event </span>Logs</span>}>
                    </Tab> */}
          {isParticipant ? (
            <Tab
              eventKey="submit"
              title={
                <span>
                  <i className="bi bi-trophy-fill"></i> My Scores
                </span>
              }
            >
              <TournamentResultSubmission />
            </Tab>
          ) : (
            <></>
          )}
          {showSignUpTab ? (
            <Tab
              eventKey="signup"
              title={
                <span>
                  <i className="bi bi-person-plus-fill"></i> Sign Up
                </span>
              }
            >
              <TournamentSignUp />
            </Tab>
          ) : (
            <></>
          )}
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
export { TournamentHome, TournamentHomeContext };
