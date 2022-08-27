import React from 'react';
import Query from "../utils/T4GraphContext"

const operationsDoc = `
query AllPlayers {
    User {
        id
        name
        email
    }
}`;
class Players extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.setState({query:[]});
        Query("AllPlayers", operationsDoc).then((data)=> this.setState({query:data.User}));
    }
    render() {
        if(this.state){
            return (
                <div>
                    <h1>Players</h1>
                    <div className="container">
                        {this.state.query.map((user) => 
                        <div className="row" key={user.id}>
                            <div className="col-6"><a href={"players/"+user.id}>{user.name}</a></div>
                            <div className="col-6"><a href="mailto:{user.email}">{user.email}</a></div>
                        </div>)}
                    </div>
                    <br />
                    <button className="btn btn-primary">Add</button>
                </div>
            );
        } else {
            return (
                <div>Loading...</div>
            )
        }
    }
}

export default Players;