import React from "react";
import TournamentSummary from "./TournamentSummary";
import Query from "../../data/T4GraphContext";

const tournamentOperationsDoc = `
  query AllTournaments($whereExpr: Tournament_bool_exp ) {
    Tournament(where: $whereExpr) {
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
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.performQuery();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      this.performQuery();
    }
  }

  performQuery() {
    let where_expression;
    if (this.props.filter) {
      if (this.props.filter["location"] == null) {
        where_expression = {
          location: {},
          start: {
            _gt: this.props.filter["earliest"],
            _lt: this.props.filter["latest"],
          },
        };
      } else {
        where_expression = {
          location: { _eq: this.props.filter["location"] },
          start: {
            _gt: this.props.filter["earliest"],
            _lt: this.props.filter["latest"],
          },
        };
      }

      Query("AllTournaments", tournamentOperationsDoc, {
        whereExpr: where_expression,
      }).then((data) => this.setState({ values: data.Tournament }));
    } else {
      Query("AllTournaments", tournamentOperationsDoc, {
        whereExpr: null,
      }).then((data) => this.setState({ values: data.Tournament }));
    }
  }

  render() {
    if (this.state && this.state.values) {
      return (
        <div>
          {this.state.values.map((tourn) => (
            <TournamentSummary key={tourn.id} data={tourn} />
          ))}
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default TournamentList;
