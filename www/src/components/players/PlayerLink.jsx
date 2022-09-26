import React from "react";
import { Link } from 'react-router-dom';

export default function PlayerLink(props) {
    return (
        <span className="col-12 col-lg-6"><i className="bi bi-person-fill"></i> <Link to={"/players/"+props.data.id}>{props.data.name}</Link></span>
    )
}