import React, {useState} from 'react';
import { useNavigate, Link } from "react-router-dom";
import {Col, Row} from 'react-bootstrap'
import { useAuth0 } from "@auth0/auth0-react";
import TournamentList from "../components/tournaments/TournamentList";
import {DarkLightToggle, DarkModeButton} from "../components/theme/DarkLightToggle";

function DarkModePrompt() {
    const [visible, setVisible] = useState(localStorage.getItem('theme')===null)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // dark mode
        if(visible){
            return (
                <div className='card mb-3'>
                    <div className='card-header d-flex'>
                        <span className='me-auto'> Dark Mode </span>
                        <DarkLightToggle />
                    </div>
                    <div className='card-body'>
                        <p>This website is best in dark mode! You can toggle here or later in your profile</p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-secondary" onClick={() => {localStorage.setItem('theme', ''); setVisible(false);}}>Dismiss</button>
                            <DarkModeButton title="Enable Dark Mode"/>
                        </div>
                    </div>
                </div>
            )
        } else {
            return <></>
        }
    } else {
        return <></>
    }
}
function Home() {
    const { user, loginWithRedirect } = useAuth0();
    const navigate = useNavigate()
    const [ showPast, setShowPast] = useState(false);
    return (
        <>
        {user?<></>:<div className="d-flex flex-row-reverse">
            <h4 className="text-success" onClick={() => loginWithRedirect()}>Log in to create Event <i className="bi bi-arrow-up-circle-fill"></i></h4>
        </div>}
        {/* <nav className="" aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">Home</li>
            </ol>
        </nav> */}
        
        <h2>TableTop Tournament Tools (T4)</h2>

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
        <DarkModePrompt/>
        {/* {user?<></>:<div className="homeIcon btn btn-outline-primary" onClick={() => loginWithRedirect()}>
            <span>
                <h3 className="mb-0"><i className="bi bi-box-arrow-in-right"></i></h3>
                <span>Login</span>
            </span>
        </div>} */}
        
        {user?<>
            <div className="d-flex gap-3">
                <h2>My Events</h2>
                <h2 className="me-auto text-muted">(<Link to="/events" title="All Events">All</Link>)</h2>
                <div>
                    {showPast?<button className="btn btn-sm btn-danger" onClick={() => setShowPast(p => !p)}>Hide Past</button>:
                    <button className="btn btn-sm btn-success" onClick={() => setShowPast(p => !p)}>Show Past</button>}
                </div>
            </div>
            
            <TournamentList pageSize={5}
            filter={{
                creator_id: user?.sub ?? "NOMATCHES",
                player_id: user?.sub ?? "NOMATCHES",
                earliest: showPast?null:new Date()
            }}
            />
        </>:
        <div className=" homeIcon btn btn-outline-secondary" onClick={() => navigate("/events")}>
            <span>
                <h3 className="mb-0"><i className="bi bi-trophy-fill"></i></h3>
                <span>Events</span>
            </span>
        </div>}
        </>
    );
}

export default Home;