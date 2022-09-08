import React from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext";
import LocationDropdown from "./LocationDropdown";

// Filter by Game, Country, City, date
// v---- doesn't work yet -----v

const tournamentOperationsDoc = `
  query AllTournaments($locationWhereExpr: Tournament_bool_exp ) {
    Tournament(where: $locationWhereExpr) {
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
`

class TournamentList extends React.Component {
  // constructor(props) {
  //     super(props);
  // }
  componentDidMount() {
    Query("AllTournaments", tournamentOperationsDoc).then((data) =>
      this.setState({ values: data.Tournament })
    );
  }
  render() {
    if (this.state && this.state.values) {
      return (
        <>
          <div>
            <LocationDropdown />
          </div>
          {this.state.values.map((tourn) => (
            <TournamentSummary key={tourn.id} data={tourn} />
          ))}
        </>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default TournamentList;
