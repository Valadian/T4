import React from "react";
import PlayerLink from "../players/PlayerLink";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

export default function TournamentSummary(props) {
    const { user } = useAuth0();

    const isOwner = user?.sub === props.data.Creator.id
    const isParticipant = props.data.Ladder.map((l)=>l.User?.id).includes(user?.sub)
    return (
        <div className="row">
            <div className="row">
                <Link to={"/events/"+props.data.id} className="tournament-link">{props.data.name}&nbsp;
                    {isOwner ? <span className="badge bg-info">Owner</span>:<></>}
                    {isParticipant ? <span className="badge bg-success">Participant</span>:<></>}
                </Link>
            </div>
            <div className="row text-muted small">
                <div className="col-12 col-lg-6 d-flex row">
                    <span className="col-12 col-sm-6 d-flex gap-3">
                        <span><i className="bi bi-calendar3"></i> {props.data.start}</span>
                        <span><i className="bi bi-people-fill"></i> {props.data.Ladder_aggregate.aggregate.count}</span>
                    </span>
                    <span className="col-12 col-sm-6">
                        {props.data.Game &&
                        <span><i className="bi bi-trophy-fill"></i> {props.data.Game.value} </span>
                        }
                    </span>
                </div>
                <div className="col-12 col-lg-6 d-flex row">
                    <span className="col-12 col-sm-6"><i className="bi bi-globe"></i> {props.data.location}</span>
                    <span className="col-12 col-sm-6"><PlayerLink data={props.data.Creator} /></span>
                </div>
            </div>
        </div>
    )
}