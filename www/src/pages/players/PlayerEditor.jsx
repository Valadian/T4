
import React from 'react';
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { User } from "../../data/Models"
import {Collapse} from 'bootstrap'


function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
  }

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

class PlayerEditor extends React.Component {
    constructor(props) {
        super(props);
        this.alertRef = React.createRef();
    }
    componentDidMount() {
        const id = this.props.params.id;
        // this.setState({});
        Query("PlayerById", operationsDoc, {id:id})
        .then((data)=> {
            if(data){
                this.setState(data.User[0])
            } else {
                this.setState(new User())
            }
        });
    }
    savePlayer() {
        Query("UpdateUser", updateDoc, {id:this.state.id, name:this.state.name, email:this.state.email})
        .then((data) => {
            const node = this.alertRef.current;
            // node.classList.add('show');
            new Collapse(node)
            // setTimeout(() => node.classList.remove('show'), 2000);
            setTimeout(() => new Collapse(node), 2000);
        });
    }
    render() {
        
        if(this.state){
            return (
                <>
                    <nav className="" aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item"><Link to="/players">Players</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{this.state.name || 'Adding Player...'}</li>
                        </ol>
                    </nav>
                    <div>
                        <div className="mb-3">
                            <label htmlFor="idInput" className="form-label">Id</label>
                            <input type="text" id="idInput" className="form-control" placeholder="Id" disabled value={this.state.id || ''} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="nameInput" className="form-label">Name</label>
                            <input type="text" id="nameInput" className="form-control" placeholder="Name" value={this.state.name || ''} onChange={(e) => this.setState({name: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label">Email</label>
                            <input type="text" id="emailInput" className="form-control" placeholder="Email" value={this.state.email || ''} onChange={(e) => this.setState({email: e.target.value})} />
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn btn-success" onClick={this.savePlayer.bind(this)}>Save</button>
                        <Link className="btn btn-danger" to="/players">Cancel</Link>
                    </div>
                    <div ref={this.alertRef} className="alert alert-success collapse mt-3" role="alert">
                        User has been updated!
                    </div>
                </>
            )
        } else {
            return (
                <div>Loading...</div>
            )
        }

    }
}
export default withParams(PlayerEditor);