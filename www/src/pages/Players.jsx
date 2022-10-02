import React, { useState, useEffect } from 'react';
import Query from "../data/T4GraphContext"
import { Link } from 'react-router-dom';
import PlayerList from '../components/players/PlayerList'
import { useAuth0 } from "@auth0/auth0-react";

const operationsDoc = `
query AllPlayers {
    User(order_by: {name: asc}) {
        id
        name
        picture
        nickname
    }
}`;
export default function Players(){
    const [players, setPlayers] = useState([])
    const { getAccessTokenSilently } = useAuth0()
    
    useEffect(() => {
        
      const fetchData = async () => {
        const accessToken = await getAccessTokenSilently()
        Query("AllPlayers", operationsDoc, null, accessToken)
        .then((data) => setPlayers(data.User))
      }
      fetchData();
    }, [getAccessTokenSilently])

    return (
        <>
            <nav className="" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item">Players</li>
                </ol>
            </nav>
            <div className="row">
                <div className="col-11">
                    <h1>Players</h1>
                </div>
                <div className="col-1 p-1">
                    <Link className="btn btn-sm btn-outline-success" to="/players/add"><i className="bi bi-plus"></i></Link>
                </div>
            </div>
            
            <PlayerList data={players}/>
            <br />
        </>
    );
}