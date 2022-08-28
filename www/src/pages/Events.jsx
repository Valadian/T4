import React from 'react';
import { Link } from 'react-router-dom';
import TournamentList from '../components/TournamentList';

function Events() {
    return (
        <>
        
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item">Events</li>
            </ol>
        </nav>
        <h1>All Events</h1>
        <TournamentList />
        </>
    );
}

export default Events;