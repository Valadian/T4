import React from 'react';
import { Link, useParams } from "react-router-dom";
import Query from "../../data/T4GraphContext"
import { Tournament } from "../../data/Models"

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}
const operationsDoc = `
  query TournamentByName($name: name) {
    Tournament(order_by: {start: desc}, where: {name: {_eq: $name}}) {
      id
      name
      location
      start
      Ladder_aggregate {
        aggregate {
          count
        }
      }
      Game {
        value
      }
      Creator {
        name
      }
    }
  }
`;

class TournamentEditor extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        const name = this.props.params.name;
        Query("TournamentByName", operationsDoc, {name:name})
        .then((data)=> {
            if(data){
                this.setState(data.Tournament[0])
            } else {
                this.setState(new Tournament())
            }
        });
    }
}

export default withParams(TournamentEditor);