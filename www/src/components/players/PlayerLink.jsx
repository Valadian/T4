import React from "react";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

export default function PlayerLink(props) {
    const { user } = useAuth0();

    const isMe = props.data.id === user?.sub
    return (
        <span className="col-12 col-lg-6">
            <i className="bi bi-person-fill"></i> 
            <Link className={isMe?"selfUserLink":""} to={"/players/"+props.data.id}>{props.data.name}</Link> {isMe ? "(me)" : ""} 
        </span>
    )
}