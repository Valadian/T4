import React, { useState, useEffect } from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";

const operationsDoc = `
  query AllTournaments($whereExpr: Tournament_bool_exp ) {
    Tournament(where: $whereExpr, order_by: {start: asc}) {
      id
      name
      location
      start
      public
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
      Rounds {
        finalized
      }
    }
  }
`;

export default function TournamentList(props) {
  const [tournaments, setTournaments] = useState([]);
  const { user, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    let where_expression = {};
    if (props.filter) {
      if(props.filter["location"]){
        where_expression['location'] = { 
          _eq: props.filter["location"] 
        }
      }
      if(props.filter["earliest"] || props.filter["latest"]){
        where_expression['start'] = {
          _gt: props.filter["earliest"],
          _lt: props.filter["latest"],
        }
      }
      // {_or: [
      //   {Creator: {id: {_eq: "google-oauth2|103553652899639741420"}}}, 
      //   {Ladder: {User: {id: {_eq: "google-oauth2|103553652899639741420"}}}}
      // ]}
      if(props.filter["creator_id"] || props.filter["player_id"]){
        where_expression['_or'] = []
        if(props.filter["creator_id"]){
          where_expression['_or'].push({Creator: { id: {
            _eq: props.filter["creator_id"] 
          }}})
        }
        if(props.filter["player_id"]){
          where_expression['_or'].push({Ladder: { User: { id: { 
            _eq: props.filter["player_id"] 
          }}}})
        }
      }
    }
    const fetchData = async () => {
      var accessToken = undefined
      if (user) {
        accessToken = await getAccessTokenSilently()
      }
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
        
  }, [getAccessTokenSilently, props.filter, user])
    
  return (
    <>
    {tournaments.length===0?<p className="text-danger">No Matches Found</p>:<></>}
    {tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
    </>
  )
 }