import React from "react";
import { Link } from 'react-router-dom';

export default class PlayerLink extends React.Component {
    render () {
        return (
            <span className="col-12 col-lg-6"><i className="bi bi-person-fill"></i> <Link to={"/players/"+this.props.data.id}>{this.props.data.name}</Link></span>
        )
    }
}