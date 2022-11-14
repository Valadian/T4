import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import {Col, Row} from 'react-bootstrap'
import { useAuth0 } from "@auth0/auth0-react";
import TournamentList from "../components/tournaments/TournamentList";

function Home() {
    const { user, loginWithRedirect } = useAuth0();
    const navigate = useNavigate()
    const [ showPast, setShowPast] = useState(false);
    return (
        <>
        {/* {user?<></>:<div className="d-flex flex-row-reverse">
            <h4 className="text-success">Log in to create Event <i className="bi bi-arrow-up-circle-fill"></i></h4>
        </div>} */}
        {/* <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">Home</li>
            </ol>
        </nav> */}
        
        <h2>
            Welcome to TableTop Tournament Tools (T4)!
        </h2>

        <div className="mt-0 mb-3" style={{'border':'#FF8000 solid 1px', 'borderRadius': '.25rem', 'fontSize': 'smaller'}}>
            <div className="progress" style={{'borderRadius': '0rem'}}>
                <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
            </div>
            <div className="p-2">
                This site is an early prototype under active development. Please report any issues found using any of the links at the bottom of the page!
            </div>
            <div className="progress" style={{'borderRadius': '0rem'}}>
                <div className="progress-bar progress-bar-striped bg-warning progress-bar-animated" role="progressbar" style={{width: '100%'}}></div>
            </div>
        </div>
        <div className=" homeIcon btn btn-outline-secondary" onClick={() => navigate("/events")}>
            <span>
                <h3 className="mb-0"><i className="bi bi-trophy-fill"></i></h3>
                <span>Events</span>
            </span>
        </div>
        {user?<></>:<div className="homeIcon btn btn-outline-primary" onClick={() => loginWithRedirect()}>
            <span>
                <h3 className="mb-0"><i className="bi bi-box-arrow-in-right"></i></h3>
                <span>Login</span>
            </span>
        </div>}
        
        {user?<>
            <div className="d-flex">
                <h1 className="me-auto">My Events</h1>
                <div>
                    {showPast?<button className="btn btn-sm btn-danger" onClick={() => setShowPast(p => !p)}>Hide Past</button>:
                    <button className="btn btn-sm btn-success" onClick={() => setShowPast(p => !p)}>Show Past</button>}
                </div>
            </div>
            
            <TournamentList
            filter={{
                creator_id: user?.sub ?? "NOMATCHES",
                player_id: user?.sub ?? "NOMATCHES",
                earliest: showPast?null:new Date()
            }}
            />
        </>:<></>}
        </>
    );
}

export default Home;