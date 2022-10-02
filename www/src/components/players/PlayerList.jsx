import React from 'react';
import { Link } from 'react-router-dom';

export default function PlayerList(props) {
    if(props.data){
        return (
            <>
                {props.data.map((user) => 
                <div className="row" key={user.id}>
                    <div className="col-1">
                        {user.picture?
                        <img
                            src={user.picture}
                            alt="Profile"
                            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
                            width="30px"
                            height="30px"
                        />:<></>}
                    </div>
                    <div className="col-5">{user.name}</div>
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