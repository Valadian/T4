import React from "react";
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext";
import { Tournament } from "../../data/Models";
import "react-datepicker/dist/react-datepicker.css";
import TournamentAdminHeader from "../../components/tournaments/TournamentAdminHeader";
import TournamentHeader from "../../components/tournaments/TournamentHeader";
import TournamentControlPanel from "../../components/tournaments/TournamentControlPanel";

function withParams(Component) {
  return (props) => <Component {...props} params={useParams()} />;
}

const tournamentByIdDoc = `
  query TournamentById($id: uuid) {
    Tournament(order_by: {start: desc}, where: {id: {_eq: $id}}) {
      id
      name
      description
      location
      start
      lists_visible
      lists_locked
      ladder_visible
      signups_open
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

class TournamentHome extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.queryTournament();
  }

  queryTournament() {
    const id = this.props.params.id;
    // this.setState({gameOptions:[]})
    Query("TournamentById", tournamentByIdDoc, { id: id }).then((response) => {
      var tournament = null;
      if (response && response.Tournament && response.Tournament.length > 0) {
        tournament = response.Tournament[0];
      } else {
        tournament = new Tournament();
      }
      tournament.start = Date.parse(tournament.start);
      this.setState({ tournament: tournament });
    });
  }

  setStateDate = (newDate) => {
    let updatedTournament = { ...this.state.tournament, start: newDate };
    this.setState({ tournament: updatedTournament });
  };

  breadcrumbs() {
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
            {(this.state &&
              this.state.tournament &&
              this.state.tournament.name) ||
              "Fetching Event..."}
          </li>
        </ol>
      </nav>
    );
  }

  render() {
    var is_owner = true; // stand-in for eventual authentication, of course

    if (is_owner) {
      if (this.state && this.state.tournament) {
        return (
          <>
            {this.breadcrumbs()}
            {/*eventually I'd like to make an interactive variant of this and present it to the TO as a quick way of editing an event.*/}
            <TournamentAdminHeader
              tournament={this.state.tournament}
              set_date={this.setStateDate}
            />
            <TournamentControlPanel tournament={this.state.tournament} />
          </>
        );
      } else {
        return (
          <>
            {this.breadcrumbs()}
            <div>Loading...</div>
          </>
        );
      }
    } else {
      if (this.state && this.state.tournament) {
        return (
          <>
            {this.breadcrumbs()}
            <TournamentHeader tournament={this.state.tournament} />
          </>
        );
      } else {
        return (
          <>
            {this.breadcrumbs()}
            <div>Loading...</div>
          </>
        );
      }
    }
  }
}

export default withParams(TournamentHome);
