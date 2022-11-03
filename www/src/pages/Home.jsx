import React from 'react';
import { useNavigate } from "react-router-dom";
import {Col, Row} from 'react-bootstrap'
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
    const { user, loginWithRedirect } = useAuth0();
    const navigate = useNavigate()
    return (
        <>
        {/* {user?<></>:<div className="d-flex flex-row-reverse">
            <h4 className="text-success">Log in to create Event <i className="bi bi-arrow-up-circle-fill"></i></h4>
        </div>} */}
        <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">Home</li>
            </ol>
        </nav>
        <Row>
            <Col xs={9}>
                <div className="mt-0" style={{'border':'#FF8000 solid 1px', 'borderRadius': '.25rem', 'fontSize': 'smaller'}}>
                    <div className="progress" style={{'borderRadius': '0rem'}}>
                        <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
                    </div>
                    <div className="p-2">
                        <p>This site is an early prototype under active development. Please report any issues found!</p>
                        <div>email: <a href="mailto:admin@jesseberger.me">admin@jesseberger.me</a></div>
                        <div>discord: <a href="https://discord.gg/TVsGh9fKkp">https://discord.gg/TVsGh9fKkp</a> (#tabletop-to-software-testing channel)</div>
                        <div>github: <a href="https://github.com/Valadian/T4/issues">https://github.com/Valadian/T4/issues</a></div>
                    </div>
                    <div className="progress" style={{'borderRadius': '0rem'}}>
                        <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
                    </div>
                </div>
            </Col>
            <Col xs={3}>
                <div className=" float-end homeIcon btn btn-outline-secondary" onClick={() => navigate("/events")}>
                    <span>
                        <h3 className="mb-0"><i className="bi bi-trophy-fill"></i></h3>
                        <span>Events</span>
                    </span>
                </div>
                {user?<></>:<div className="float-end homeIcon btn btn-outline-primary" onClick={() => loginWithRedirect()}>
                    <span>
                        <h3 className="mb-0"><i className="bi bi-box-arrow-in-right"></i></h3>
                        <span>Login</span>
                    </span>
                </div>}
            </Col>
        </Row>
        
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