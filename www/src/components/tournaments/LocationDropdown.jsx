import React from "react";
import Query from "../../data/T4GraphContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

// Filter by Game, Country, City, date
// v---- doesn't work yet -----v

const operationsDoc = `
  query AllLocations {
    Tournament(order_by: {location: asc}) {
      location
    }
  }
`

class LocationDropdown extends React.Component {
  // constructor(props) {
  //     super(props);
  // }
  componentDidMount() {
    Query("AllLocations", operationsDoc).then((data) =>
      this.setState({ values: data.Tournament })
    );
  }
  render() {
    if (this.state && this.state.values) {
      return (
        <DropdownButton title='Location' onSelect={function(evt){console.log(evt)}}>
          {this.state.values.map((tourn) => (
            <Dropdown.Item eventKey={tourn.location}>{tourn.location}</Dropdown.Item>
          ))}
        </DropdownButton>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default LocationDropdown;
