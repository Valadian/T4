import React from 'react';
import TournamentList from '../components/TournamentList';

function Home() {
    return (
        <>
        
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">Home</li>
            </ol>
        </nav>
        <h1>My Events</h1>
        <TournamentList />
        </>
    );
}

export default Home;