import React from "react";
import PlayerLink from "../players/PlayerLink";
import { Link } from 'react-router-dom';

class TournamentSummary extends React.Component {
    render () {
        return (
            <div className="row">
                <div className="row">
                    <Link to={"/events/"+this.props.data.name} className="tournament-link">{this.props.data.name}</Link>
                </div>
                <div className="row text-muted small">
                    <div className="col-12 col-lg-6 d-flex row">
                        <span className="col-12 col-sm-6 d-flex gap-3">
                            <span><i className="bi bi-calendar3"></i> {this.props.data.start}</span>
                            <span><i className="bi bi-people-fill"></i> {this.props.data.Ladder_aggregate.aggregate.count}</span>
                        </span>
                        <span className="col-12 col-sm-6">
                            {this.props.data.Game &&
                            <span><i className="bi bi-trophy-fill"></i> {this.props.data.Game.value} </span>
                            }
                        </span>
                    </div>
                    <div className="col-12 col-lg-6 d-flex row">
                        <span className="col-12 col-sm-6"><i className="bi bi-globe"></i> {this.props.data.location}</span>
                        <span className="col-12 col-sm-6"><PlayerLink data={this.props.data.Creator} /></span>
                    </div>
                </div>
            </div>
        )
    }
}
export default TournamentSummary