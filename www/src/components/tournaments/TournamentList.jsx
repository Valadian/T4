import React, { useState, useEffect } from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext"
import { useAuth0 } from "@auth0/auth0-react";

const operationsDoc = `
  query AllTournaments {
    Tournament(order_by: {start: desc}) {
      id
      name
      location
      start
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Game {
        value
      }
      Creator {
        id
        name
      }
    }
  }
`;

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([])
    // constructor(props) {
    //     super(props);
    // }
    const { getAccessTokenSilently } = useAuth0();
    useEffect(() => {
      const fetchData = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("AllTournaments", operationsDoc,null,accessToken)
            .then((data)=> setTournaments(data.Tournament));
      }
      fetchData();
    }, [getAccessTokenSilently])
    
    return (
        <>
        {tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
        </>
    )
 }