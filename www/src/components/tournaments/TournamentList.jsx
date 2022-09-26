import React, { useState, useEffect } from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext"

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
    useEffect(() => {
      Query("AllTournaments", operationsDoc)
      .then((data)=> setTournaments(data.Tournament));
    }, [])
    
    return (
        <>
        {tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
        </>
    )
 }