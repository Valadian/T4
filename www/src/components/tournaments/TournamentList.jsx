import React from "react";
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

class TournamentList extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    componentDidMount() {
        Query("AllTournaments", operationsDoc)
        .then((data)=> this.setState({values:data.Tournament}));
      }
    render() {
        if(this.state && this.state.values){
            return (
                <>
                {this.state.values.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
                </>
            )
        } else {
            return (
                <div>Loading...</div>
            )
        }
    }
}

export default TournamentList