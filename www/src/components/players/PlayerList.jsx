import React from 'react';
import { Link } from 'react-router-dom';

class PlayerList extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    // componentDidMount() {
    // }
    render() {
        if(this.props.data){
            return (
                <>
                    {this.props.data.map((user) => 
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
}

export default PlayerList;