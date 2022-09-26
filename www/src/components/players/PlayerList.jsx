import React from 'react';
import { Link } from 'react-router-dom';

export default function PlayerList(props) {
    if(props.data){
        return (
            <>
                {props.data.map((user) => 
                <div className="row" key={user.id}>
                    <div className="col-6">{user.name}</div>
                    <div className="col-5"><a href="mailto:{user.email}">{user.email}</a></div>
                    <div className="col-1 p-1"><Link to={"/players/"+user.id} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil-fill"></i></Link></div>
                </div>)}
            </>
        );
    } else {
        return (
            <div>Loading...</div>
        )
    }
}