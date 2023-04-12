import React from "react";
import PlayerLink from "../players/PlayerLink";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

export default function TournamentSummary({data}) {
    const { user } = useAuth0();

    const isOwner = user?.sub === data.Creator.id
    const isParticipant = user!=null && data.Ladder.filter(l => l.User).map((l)=>l.User?.id).includes(user?.sub)

    const linkUrl = (data) => {
        if(data.short_name){
            return "/e/"+data.short_name
        } else {
            return "/events/"+data.id
        }
    }
    return (
        <div className="card mb-3">
            <div className="card-header">
                <Link to={linkUrl(data)} className="tournament-link">{data.name}&nbsp;
                    {isOwner ? <><span className="badge bg-info">Owner</span>&nbsp;</>:<></>}
                    {isParticipant ? <><span className="badge bg-success">Participant</span>&nbsp;</>:<></>}
                    {!(data.public) ? <><span className="badge bg-warning">Private</span>&nbsp;</>:<></>}
                    {(data.Rounds.length!==data.Rounds.filter(r => r.finalized).length) ? <><span className="badge bg-danger">Live</span>&nbsp;</>:<></>}
                    {(data.Rounds.length>0 && data.Rounds.length===data.Rounds.filter(r => r.finalized).length) ? <><span className="badge bg-secondary">Complete</span>&nbsp;</>:<></>}
                </Link>
            </div>
            <div className="text-muted small card-body">
                <div className="row">
                    <div className="col-12 col-lg-6 d-flex row">
                        <span className="col-12 col-sm-6 d-flex gap-3">
                            <span><i className="bi bi-calendar3"></i> {data.start}</span>
                            <span><i className="bi bi-people-fill"></i> {data.Ladder_aggregate.aggregate.count}</span>
                        </span>
                        <span className="col-12 col-sm-6">
                            {data.Game &&
                            <span><i className="bi bi-trophy-fill"></i> {data.Game.value} </span>
                            }
                        </span>
                    </div>
                    <div className="col-12 col-lg-6 d-flex row">
                        <span className="col-12 col-sm-6"><i className="bi bi-globe"></i> {data.location}</span>
                        <span className="col-12 col-sm-6"><PlayerLink data={data.Creator} /></span>
                    </div>
                </div>
            </div>
        </div>
    )
}