
import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { User } from "../../data/Models"
import {Collapse} from 'bootstrap'

const operationsDoc = `
query PlayerById($id: uuid) {
User(where: {id: {_eq: $id}}) {
    id
    name
    email
}
}`;

const updateDoc = `
mutation UpdateUser($name: String = "", $email: String = "", $id: uuid = "id") {
    update_User(_set: {email: $email, name: $name}, where: {id: {_eq: $id}}) {
        returning {
            email
            id
            name
        }
    }
}  
`

export default function PlayerEditor(props){
    const params = useParams()
    const alertRef = React.createRef()
    const [player, setPlayer] = useState()
    const [originalPlayer, setOriginalPlayer] = useState()
    const [hasEdits, setHasEdits] = useState(false)

    const setPlayerPartial = function(valueKeys){
        setPlayer(prevPlayer => ({...prevPlayer, ...valueKeys}))
    }

    useEffect(() => {
        Query("PlayerById", operationsDoc, {id:params.id})
        .then((data)=> {
            var value = null
            if(data){
                value = data.User[0]
            } else {
                value = new User()
            }
            setPlayer(value)
            setOriginalPlayer(value)
        });
        
    },[params])

    useEffect(() => {
        if (originalPlayer) {
            setHasEdits(
                (player.id!==originalPlayer.id) || 
                (player.name!==originalPlayer.name) || 
                (player.email!==originalPlayer.email))
        }
    }, [player, originalPlayer])

    const savePlayer = function() {
        Query("UpdateUser", updateDoc, {id:player.id, name:player.name, email:player.email})
        .then((data) => {
            const node = alertRef.current;
            // node.classList.add('show');
            new Collapse(node)
            // setTimeout(() => node.classList.remove('show'), 2000);
            setTimeout(() => new Collapse(node), 2000);
        });
    }
    const breadcrumbs = function() {
        return (
            <nav className="" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/players">Players</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{(player && player.name) || 'Adding Player...'}</li>
                </ol>
            </nav>
        )
    }
    
    if(player){
        return (
            <>
                {breadcrumbs()}
                <div>
                    {/* <div className="mb-3">
                        <label htmlFor="idInput" className="form-label">Id</label>
                        <input type="text" id="idInput" className="form-control" placeholder="Id" disabled value={player.id || ''} />
                    </div> */}
                    <div className="mb-3">
                        <label htmlFor="nameInput" className="form-label">Name</label>
                        <input type="text" id="nameInput" className="form-control" placeholder="Name" value={player.name || ''} onChange={(e) => setPlayerPartial({name: e.target.value})} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label">Email</label>
                        <input type="text" id="emailInput" className="form-control" placeholder="Email" value={player.email || ''} onChange={(e) => setPlayerPartial({email: e.target.value})} />
                    </div>
                </div>
                <div className="d-flex gap-3">
                    <button className="btn btn-outline-success" onClick={savePlayer}  disabled={!hasEdits}>Save</button>
                    {hasEdits && <button className="btn btn-outline-danger" onClick={() => window.history.back()}>Cancel</button>}
                    {!hasEdits && <button className="btn btn-outline-primary" onClick={() => window.history.back()}>Done</button>}
                    
                </div>
                <div ref={alertRef} className="alert alert-success collapse mt-3" role="alert">
                    User has been updated!
                </div>
            </>
        )
    } else {
        return (
            <>
                {breadcrumbs()}
                <div>Loading...</div>
            </>
        )
    }
}