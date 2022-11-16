import React from 'react';
import { Link, NavLink } from "react-router-dom";
import AuthenticationButton from '../auth/AuthenticationButton';
import { Nav } from 'react-bootstrap';

export default function Navbar(props){
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container">
                
                <Link className="navbar-brand ms-2 text-primary" to="/" title="T4"><img src="/favicon.ico" alt="" width="32" height="32" className="d-inline-block align-text-top" /></Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <Nav.Link as={NavLink} to='/' exact="true">Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/events">Events</Nav.Link >
                        <Nav.Link as={NavLink} to="/features">Features</Nav.Link >
                        <Nav.Link as={NavLink} to="/about">About Us</Nav.Link >
                        {/* <Nav.Link as={NavLink} to="/players">Players</Nav.Link >*/}
                    
                    </ul>
                    <div className="d-flex gap-3">
                        {/* <div className="input-group">
                            <input className="form-control" type="search" placeholder="Search" aria-label="Search"/>
                            <Link className="btn btn-outline-secondary" to="/search"><i className="bi bi-search"></i></Link>
                        </div> */}
                        <AuthenticationButton/>
                    </div>
                </div>
            </div>
        </nav>
    )
}