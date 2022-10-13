import React, { useState, useEffect } from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";

const operationsDoc = `
  query AllTournaments($whereExpr: Tournament_bool_exp ) {
    Tournament(where: $whereExpr, order_by: {start: desc}) {
      id
      name
      location
      start
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Ladder {
        User {
          id
          name
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

export default function TournamentList(props) {
  const [tournaments, setTournaments] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    let where_expression = null;
    if (props.filter) {
      if (props.filter["location"] == null) {
        where_expression = {
          location: {},
          start: {
            _gt: props.filter["earliest"],
            _lt: props.filter["latest"],
          },
        };
      } else {
        where_expression = {
          location: { _eq: props.filter["location"] },
          start: {
            _gt: props.filter["earliest"],
            _lt: props.filter["latest"],
          },
        };
      }
    }
    const fetchData = async () => {
      const accessToken = await getAccessTokenSilently()
      Query("AllTournaments", operationsDoc,{
        whereExpr: where_expression
      },accessToken)
        .then((data)=> {
          if (data){
            setTournaments(data.Tournament)
          }
        });
    }
    fetchData();
        
  }, [getAccessTokenSilently, props.filter])
    
  return (
    <>
    {tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
    </>
  )
 }