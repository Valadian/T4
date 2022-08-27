import React from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";

class Navbar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-dark">
                <div className="container">
                    <img src="/favicon.ico" alt="" width="32" height="32" className="d-inline-block align-text-top" />
                    <a className="navbar-brand ms-2 text-primary" href="#"><b>T<sup>4</sup></b></a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" to="/">Home</Link>
                            {/* <a className="nav-link active" aria-current="page" href="#">Home</a> */}
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/events">Events</Link>
                            {/* <a className="nav-link" href="#">Events</a> */}
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/players">Players</Link>
                            {/* <a className="nav-link" href="#">Players</a> */}
                        </li>
                        </ul>
                        <div className="d-flex">
                        <input className="form-control me-2 bg-dark text-white" type="search" placeholder="Search" aria-label="Search"/>
                        <Link className="btn btn-outline-secondary" to="/search">Search</Link>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }
}

export default Navbar