import React, { useState, useEffect } from "react";
import Query from "../../data/T4GraphContext";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useAuth0 } from "@auth0/auth0-react";

const operationsDoc = `
  query AllLocations {
    Tournament(distinct_on: location, order_by: {location: asc}) {
      location
    }
  }
`;

export default function LocationDropdown(props) {
    const { user, getAccessTokenSilently } = useAuth0();
    const [locations, setLocations] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            var accessToken = undefined
            if(user) {
              accessToken = await getAccessTokenSilently()
            }
            Query("AllLocations", operationsDoc,null,accessToken)
                .then((data)=> setLocations(data.Tournament));
        }
        fetchData();
    }, [getAccessTokenSilently])

    if (locations && props.setLocation) {
      return (
        <DropdownButton
          title="Location"
          onSelect={props.setLocation}
        >
          <Dropdown.Item eventKey={null}>Any Location</Dropdown.Item>
          {locations.map((tourn) => (
            <Dropdown.Item eventKey={tourn.location} key={tourn.location}>
              {tourn.location}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      );
    } else {
      return <div>Loading...</div>;
    }
}