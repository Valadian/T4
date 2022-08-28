import React from "react";

class TournamentSummary extends React.Component {
    render () {
        return (
            <div className="row">
                <div className="row">
                    <a className="tournament-link" href={"/event/"+this.props.data.name}>{this.props.data.name}</a>
                </div>
                <div className="row text-muted small">
                    <div className="col-md-4 d-flex row">
                        <span className="col-12 col-xl-6 d-flex gap-3">
                            <span><i className="bi bi-calendar3"></i> {this.props.data.start}</span>
                            <span><i className="bi bi-people-fill"></i> {this.props.data.Ladder_aggregate.aggregate.count}</span>
                        </span>
                        <span className="col-12 col-xl-6">
                            {this.props.data.Game &&
                            <span><i className="bi bi-trophy-fill"></i> {this.props.data.Game.value} </span>
                            }
                        </span>
                    </div>
                    <div className="col-md-8 d-flex row">
                        <span className="col-12 col-lg-6"><i className="bi bi-globe"></i> {this.props.data.location}</span>
                        <span className="col-12 col-lg-6"><i className="bi bi-person-fill"></i> {this.props.data.Creator.name}</span>
                    </div>
                </div>
            </div>
        )
    }
}
export default TournamentSummary