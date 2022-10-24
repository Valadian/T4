import React from 'react';
import TournamentList from '../components/tournaments/TournamentList';

function Home() {
    return (
        <>
        
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">Home</li>
            </ol>
        </nav>
        <div style={{'border':'#FF8000 solid 1px', 'border-radius': '.25rem'}}>
            <div className="progress" style={{'border-radius': '0rem'}}>
                <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
            </div>
            <div className="p-3">
            <p>This site is an early prototype under active development. Please report any issues found!</p>
            <p>email: <a href="mailto:admin@jesseberger.me">admin@jesseberger.me</a></p>
            <p>discord: <a href="https://discord.gg/TVsGh9fKkp">https://discord.gg/TVsGh9fKkp</a> (#tabletop-to-software-testing channel)</p>
            <p>github: <a href="https://github.com/Valadian/T4/issues">https://github.com/Valadian/T4/issues</a></p>
            </div>
            <div className="progress" style={{'border-radius': '0rem'}}>
                <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
            </div>
        </div>
        <br />
        <h2>
            Welcome to TableTop Tournament Tools (T4)!
        </h2>
        <p>
            After a long service to the worldwide tabletop community, tabletop.to recently retired in Oct 2022. T4.tools was pulled together by a few members of the Star Wars Armada community to fill that gap in our competitive tournament scene. In the tool's infancy, it is targeted to the Star Wars Armada ruleset, but will very soon be expanded to other AMG Star Wars Tabletop games, and to the more general tabletop community!
        </p>
        <h2>Implemented Features</h2>
        <ul>
            <li>Secure user authentication with Google OAuth support through Auth0</li>
            <li>Swiss Tournaments</li>
            <li>Swiss matchmaking</li>
            <li>Registered and unregistered users</li>
            <li>TO and user submitted scores</li>
            <li>Mobile friendly</li>
        </ul>
        <h2>Planned Features</h2>
        <ul>
            <li>Teams</li>
            <li>List submission</li>
            <li>List Analytics</li>
            <li>Offline capability (for internet deprived venues)</li>
        </ul>
        {/* <h1>My Events</h1>
        <TournamentList /> */}
        </>
    );
}

export default Home;