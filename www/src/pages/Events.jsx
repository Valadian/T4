import React from 'react';
import { Link } from 'react-router-dom';
import TournamentList from '../components/tournaments/TournamentList';

function Events() {
    return (
        <>
        
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item">Events</li>
            </ol>
        </nav>
        
        <div className="row">
            <div className="col-11">
                <h1>All Events</h1>
            </div>
            <div className="col-1 p-1">
                <Link className="btn btn-sm btn-outline-success" to="/events/add"><i className="bi bi-plus"></i></Link>
            </div>
        </div>
        <TournamentList />
        </>
    );
}

export default Events;