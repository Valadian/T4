import React, { useState } from "react";

import add from "date-fns/add";
import DatePicker from "react-datepicker";
import { Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import LocationDropdown from "./LocationDropdown";
import TournamentList from "./TournamentList";
import { useAuth0 } from "@auth0/auth0-react";
import { Col, Row, Button } from "react-bootstrap";

export default function FilteredTournamentList(props) {
    const { user } = useAuth0();
    var today = new Date();
    const [location, setLocation] = useState(null)
    const [earliest, setEarliest] = useState(null); //add(today, { months: -1 }))
    const [latest, setLatest] = useState(null); //add(today, { years: 1 }))

    const [filterFuture, setFilterFuture] = useState(true);
    const [filterPast, setFilterPast] = useState(false);
    // const [filterFutureCached, setFilterFutureCached] = useState(true);
    const [filterMine, setFilterMine] = useState(false);
    const [filterLive, setFilterLive] = useState(false);
    const [filterByDate, setFilterByDate] = useState(false);

    var today = new Date(Date.now());
    today.setHours(0, 0, 0, 0)
    var filter = {
      location: location
    }
    if(earliest) {
      filter["earliest"] = earliest
    }
    if(latest) {
      filter["latest"] = latest
    }
    if(user && filterMine){
      filter['creator_id'] = user.sub
      filter['player_id'] = user.sub
    }
    if(filterFuture){
      filter['earliest'] = today
    }
    
    if(filterPast){
      filter['latest'] = today
    }
    if(filterLive){
      filter['live'] = true
    }
    const toggleFilterFuture = () => {
      if(filterFuture){
        setFilterFuture(false)
      } else {
        setFilterFuture(true)
        setFilterPast(false)
        setFilterByDate(false)
      }
    }
    const toggleFilterLastMonth = () => {
      if(filterPast){
        setFilterPast(false)
      } else {
        setFilterPast(true)
        setFilterFuture(false)
        setFilterByDate(false)
      }
    }
    const toggleFilterByDate = () => {
      if(filterByDate){
        // setFilterFuture(filterFutureCached)
        setFilterByDate(false)
        setEarliest(null)
        setLatest(null)
      } else {
        // setFilterFutureCached(filterFuture)
        setFilterByDate(true)
        setFilterFuture(false)
        setFilterPast(false)
      }
    }
    return (
      <div>
        <Row>
          <Col xs={9}>
            <LocationDropdown setLocation={setLocation} location={location} />
          </Col>
          <Col xs={3}>
          {user?<Link className="btn btn-outline-success float-end" to="/events/add"><i className="bi bi-plus"></i><span className="d-none d-sm-inline"> Create</span></Link>:<></>}
          </Col>
          <Col xs={12} lg={6} className="pt-3">
            <div className="d-flex justify-content-start align-items-star gap-1">
              <Button size="sm" variant={filterFuture?"success":"outline-secondary"} onClick={toggleFilterFuture}>Future</Button>
              <Button size="sm" variant={filterPast?"warning":"outline-secondary"} onClick={toggleFilterLastMonth}>Past <span className="d-none d-md-inline">Month</span></Button>
              <Button size="sm" variant={filterByDate?"primary":"outline-secondary"} onClick={toggleFilterByDate}><span className="d-none d-sm-inline">By</span> Date</Button>
              <Button size="sm" variant={filterLive?"danger":"outline-secondary"} onClick={() => setFilterLive(v => !v)}>Live</Button>
              {user?<Button size="sm" variant={filterMine?"info":"outline-secondary"} onClick={() => setFilterMine(v => !v)}>Mine</Button>:<></>}
            </div>
          </Col>
                 
          {filterByDate?<>
            <Col xs={12} sm={6} lg={3} className="pt-3">
              <div class="input-group">
                <span class="input-group-text">From:</span>
                <div className="form-control p-0">
                  <DatePicker
                    selected={earliest}
                    onChange={setEarliest}
                    className={"form-control"}
                    showPopperArrow={false}
                    isClearable="true"
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6} lg={3} className="pt-3">
              <div class="input-group">
                <span class="input-group-text">To:</span>
                <div className="form-control p-0">
                  <DatePicker
                    selected={latest}
                    onChange={setLatest}
                    className="form-control"
                    showPopperArrow={false}
                    isClearable="true"
                  />
                </div>
              </div>
            </Col>
          </>:<></>}
        </Row>   
        <p />
        <TournamentList
          orderBy={filterPast?"desc":"asc"}
          filter={filter}
        />
      </div>
    );
}