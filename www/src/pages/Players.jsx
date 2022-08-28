import React from 'react';
import Query from "../data/T4GraphContext"
import { Link } from 'react-router-dom';

const operationsDoc = `
query AllPlayers {
    User {
        id
        name
        email
    }
}`;
class Players extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    componentDidMount() {
        Query("AllPlayers", operationsDoc)
        .then((data) => this.setState({values:data.User}))
    }
    render() {
        if(this.state && this.state.values){
            return (
                <>
                    <nav className="" aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item">Players</li>
                        </ol>
                    </nav>
                    <h1>Players</h1>
                    <div className="container">
                        {this.state.values.map((user) => 
                        <div className="row" key={user.id}>
                            <div className="col-1 p-1"><Link to={"/players/"+user.id} className="btn btn-primary"><i className="bi bi-pencil-fill"></i></Link></div>
                            <div className="col-6">{user.name}</div>
                            <div className="col-5"><a href="mailto:{user.email}">{user.email}</a></div>
                        </div>)}
                    </div>
                    <br />
                    <Link className="btn btn-success" to="/players/add">Add</Link>
                </>
            );
        } else {
            return (
                <div>Loading...</div>
            )
        }
    }
}

export default Players;