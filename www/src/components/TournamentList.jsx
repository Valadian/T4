import React from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../utils/T4GraphContext"

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
        name
      }
    }
  }
`;

class TournamentList extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.setState({query:[]});
        Query("AllTournaments", operationsDoc).then((data)=> this.setState({query:data.Tournament}));
      }
    render() {
        if(this.state){
            return (
                <>
                {this.state.query.map((tourn) => <TournamentSummary key={tourn.id} data={tourn} />)}
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