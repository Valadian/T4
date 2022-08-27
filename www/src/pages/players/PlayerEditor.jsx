
import React from 'react';
import { useParams } from "react-router-dom";
import Query from "../../utils/T4GraphContext"


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

class PlayerEditor extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        const id = this.props.params.id;
        this.setState({query:[]});
        Query("PlayerById", operationsDoc, {id:id})
        .then((data)=> this.setState({query:data.User[0]}));
    }
    render() {
        
        if(this.state){
            return (
                <div>
                    <h1>Player: </h1>
                    <div>{this.state.query.id}</div>
                    <div>{this.state.query.name}</div>
                    <div>{this.state.query.email}</div>
                </div>
            )
        } else {
            return (
                <div>Loading...</div>
            )
        }

    }
}
export default withParams(PlayerEditor);