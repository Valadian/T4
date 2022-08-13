import React from "react";

class TournamentSummary extends React.Component {
    render () {
        return (
            <div className="row">
                <div className="row">
                    <a href={"/event/"+this.props.data.name}>{this.props.data.name}</a>
                </div>
                <div className="row">
                    <div className="col-6-md">
                        <span>{this.props.data.start}</span>
                    </div>
                    <div className="col-6-md">
                        <span>{this.props.data.location}</span>
                    </div>
                </div>
            </div>
        )
    }
}
export default TournamentSummary