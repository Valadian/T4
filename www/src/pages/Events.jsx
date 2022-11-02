import React from 'react';
import { Link } from 'react-router-dom';
import FilteredTournamentList from '../components/tournaments/FilteredTournamentList';
import { useAuth0 } from "@auth0/auth0-react";

function Events() {
    const { user } = useAuth0();

    return (
        <>
        
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item">Events</li>
            </ol>
        </nav>
        
        <div className="row">
            <div className="col-8">
                <h1>All Events</h1>
            </div>
            {/* <div className="col-4 p-1 d-flex flex-row-reverse">
                {user?<Link className="btn btn-outline-success" to="/events/add"><i className="bi bi-plus"></i> Create</Link>:<></>}
            </div> */}
        </div>
        <FilteredTournamentList />
        </>
    );
}

export default Events;