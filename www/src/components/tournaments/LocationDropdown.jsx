import React from "react";
import Query from "../../data/T4GraphContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

const operationsDoc = `
  query AllLocations {
    Tournament(order_by: {location: asc}) {
      location
    }
  }
`;

class LocationDropdown extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Query("AllLocations", operationsDoc).then((data) =>
      this.setState({ values: data.Tournament })
    );
  }

  render() {
    if (this.state && this.state.values && this.props.setLocation) {
      return (
        <DropdownButton
          title="Location"
          onSelect={(value) => {
            this.props.setLocation(value);
          }}
        >
          <Dropdown.Item eventKey={null}>Any Location</Dropdown.Item>
          {this.state.values.map((tourn) => (
            <Dropdown.Item key={tourn.location} eventKey={tourn.location}>
              {tourn.location}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default LocationDropdown;
