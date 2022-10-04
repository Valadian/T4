import React, { useState, useEffect } from "react";

import add from "date-fns/add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationDropdown from "./LocationDropdown";
import TournamentList from "./TournamentList";

export default function FilteredTournamentList(props) {
    var today = new Date();
    const [location, setLocation] = useState(null)
    const [earliest, setEarliest] = useState(today)
    const [latest, setLatest] = useState(add(today, { years: 1 }))

    return (
      <div>
        <div className="row">
          <div className="col-4">
            <DatePicker
              selected={earliest}
              onChange={setEarliest}
              className="form-control"
              showPopperArrow={false}
            />
          </div>

          <div className="col-4">
            <DatePicker
              selected={latest}
              onChange={setLatest}
              className="form-control"
              showPopperArrow={false}
            />
          </div>
          <div className="col-4">
            <LocationDropdown setLocation={setLocation} />
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