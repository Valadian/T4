import React from "react";
import TournamentSummary from "./TournamentSummary";

class TournamentList extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.setState({tournaments:[]});
        startFetchMyQuery(this); 
      }
    render() {
        if(this.state){
            return (
                <>
                {this.state.tournaments.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
                </>
            )
        } else {
            return (
                <div>Loading...</div>
            )
        }
    }
}

async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "http://localhost:8080/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );

  return await result.json();
}

const operationsDoc = `
  query AllTournaments {
    Tournament {
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
        name
      }
    }
  }
`;

function fetchMyQuery() {
  return fetchGraphQL(
    operationsDoc,
    "AllTournaments",
    {}
  );
}

async function startFetchMyQuery(obj) {
  const { errors, data } = await fetchMyQuery();

  if (errors) {
    // handle those errors like a pro
    console.error(errors);
  }

  // do something great with this precious data
//   console.log(data);
  obj.setState({tournaments:data.Tournament})
}


export default TournamentList