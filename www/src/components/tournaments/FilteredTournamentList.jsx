import React, { useState } from "react";

import add from "date-fns/add";
import DatePicker from "react-datepicker";
import { Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import LocationDropdown from "./LocationDropdown";
import TournamentList from "./TournamentList";
import { useAuth0 } from "@auth0/auth0-react";

export default function FilteredTournamentList(props) {
    const { user } = useAuth0();
    var today = new Date();
    const [location, setLocation] = useState(null)
    const [earliest, setEarliest] = useState(add(today, { months: -1 }))
    const [latest, setLatest] = useState(add(today, { years: 1 }))

    return (
      <div>
        <div className="row">
          <div className="col-4 col-md-4 p-0">
            <DatePicker
              selected={earliest}
              onChange={setEarliest}
              className="form-control"
              showPopperArrow={false}
            />
          </div>

          <div className="col-4 col-md-4 p-0">
            <DatePicker
              selected={latest}
              onChange={setLatest}
              className="form-control"
              showPopperArrow={false}
            />
          </div>
          <div className="col-4 col-sm-3 col-md-2 p-0">
            <LocationDropdown setLocation={setLocation} />
          </div>
          <div className="d-none d-sm-block col-sm-1 col-md-2 p-0">
            {user?<Link className="btn btn-outline-success" to="/events/add"><i className="bi bi-plus"></i><span className="d-none d-md-inline"> Create</span></Link>:<></>}
          </div>
        </div>
        <p />
        <TournamentList
          filter={{
            location: location,
            earliest: earliest,
            latest: latest,
          }}
        />
      </div>
    );
}