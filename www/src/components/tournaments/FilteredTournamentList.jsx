import React from "react";

import add from "date-fns/add";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationDropdown from "./LocationDropdown";
import TournamentList from "./TournamentList";

class FilteredTournamentList extends React.Component {
  constructor(props) {
    super(props);
    var today = new Date();
    this.state = {
      location: null,
      earliest: today,
      latest: add(today, { years: 1 }),
    };
  }

  render() {
    const setLocationFilter = (selected_location = null) => {
      this.setState({ location: selected_location });
    };
    const setEarliestFilter = (selected_earliest = null) => {
      this.setState({ earliest: selected_earliest });
    };
    const setLatestFilter = (selected_latest = null) => {
      this.setState({ latest: selected_latest });
    };

    return (
      <div>
        <div className="row">
          <div className="col-4">
            <DatePicker
              selected={this.state.earliest}
              onChange={(value) => {
                setEarliestFilter(value);
              }}
              className="form-control"
              showPopperArrow={false}
            />
          </div>

          <div className="col-4">
            <DatePicker
              selected={this.state.latest}
              onChange={(value) => {
                setLatestFilter(value);
              }}
              className="form-control"
              showPopperArrow={false}
            />
          </div>
          <div className="col-4">
            <LocationDropdown setLocation={setLocationFilter} />
          </div>
        </div>
        <p />
        <TournamentList
          filter={{
            location: this.state.location,
            earliest: this.state.earliest,
            latest: this.state.latest,
          }}
        />
      </div>
    );
  }
}

export default FilteredTournamentList;
