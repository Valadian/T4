import React, { useState, useEffect } from "react";
import Query from "../../data/T4GraphContext";
import add from "date-fns/add";
import DatePicker from "react-datepicker";
import { Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import LocationDropdown from "./LocationDropdown";
import TournamentList from "./TournamentList";
import { useAuth0 } from "@auth0/auth0-react";
import { Col, Row, Button } from "react-bootstrap";

const getPreferencesDoc = `
query GetPreferences($user_id: String = "") {
  UserPreferences(where: {user_id: {_eq: $user_id}}) {
    location
  }
  UserGamePreferences(where: {user_id: {_eq: $user_id}}) {
    game
  }
  Game {
    key
    value
  }
}`
const getGamesDoc = `
query GetGames($user_id: String = "") {
  Game {
    key
    value
  }
}`

export default function FilteredTournamentList(props) {
    const { user, getAccessTokenSilently } = useAuth0();
    const [location, setLocation] = useState(null)
    const [earliest, setEarliest] = useState(null); //add(today, { months: -1 }))
    const [latest, setLatest] = useState(null); //add(today, { years: 1 }))
    const [keywordTemp, setKeywordTemp] = useState("")
    const [keyword, setKeyword] = useState("")

    const [filterFuture, setFilterFuture] = useState(true);
    const [filterPast, setFilterPast] = useState(false);
    // const [filterFutureCached, setFilterFutureCached] = useState(true);
    const [filterMine, setFilterMine] = useState(false);
    const [filterLive, setFilterLive] = useState(false);
    const [filterByDate, setFilterByDate] = useState(false);
    const [filterSearch, setFilterSearch] = useState(false);
    const [filterGamePreferences, setFilterGamePreferences] = useState([])
    const [allGames, setAllGames] = useState([])

    useEffect(() => {
      let fetchData = async () => {
        var accessToken = undefined
        if (user) {
          accessToken = await getAccessTokenSilently()
          Query("GetPreferences", getPreferencesDoc, { 
            user_id: user?.sub
          },accessToken)
          .then((response) => {
            // let {player_name, club, location} = response.UserPreferences
            // setLocation(location??"")
            if(response){
              setFilterGamePreferences((response.UserGamePreferences?.map(ugp => ugp.game))??[]);
              setAllGames(response.Game);
            }
          })
        } else {
          Query("GetGames", getGamesDoc)
          .then((response) => {
            if(response){
              setAllGames(response.Game);
            }
          })
        }
      }
      fetchData();
    },[user?.sub, user, getAccessTokenSilently])

    var today = new Date();
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
    if(filterGamePreferences.length>0){
      filter['game'] = filterGamePreferences
    }
    if(filterSearch){
      filter['search'] = keyword
    }
    const toggleFilterFuture = () => {
      if(filterFuture){
        setFilterFuture(false)
      } else {
        setFilterFuture(true)
        setFilterPast(false)
        setFilterByDate(false)
        setFilterLive(false)
        setFilterSearch(false)
      }
    }
    const toggleFilterLastMonth = () => {
      if(filterPast){
        setFilterPast(false)
      } else {
        setFilterPast(true)
        setFilterFuture(false)
        setFilterByDate(false)
        setFilterLive(false)
        setFilterSearch(false)
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
        setFilterLive(false)
        setFilterSearch(false)
      }
    }
    const toggleFilterLive = () => {
      if(filterLive){
        // setFilterFuture(filterFutureCached)
        setFilterLive(false)
      } else {
        // setFilterFutureCached(filterFuture)
        setFilterLive(true)
        setFilterFuture(false)
        setFilterPast(false)
        setFilterByDate(false)
        setFilterSearch(false)
      }
    }
    
    const toggleFilterSearch = () => {
      if(filterSearch){
        // setFilterFuture(filterFutureCached)
        setFilterSearch(false)
      } else {
        // setFilterFutureCached(filterFuture)
        setFilterSearch(true)
        setFilterLive(false)
        setFilterFuture(false)
        setFilterPast(false)
        setFilterByDate(false)
        setFilterGamePreferences([])
        setLocation(null)
      }
    }
    const setGamePreference = (key, value) => {
      if(value){
        setFilterGamePreferences(filterGamePreferences.filter(v => v!==key).concat([key]))
      } else {
        setFilterGamePreferences(filterGamePreferences.filter(v => v!==key))
      }
    }
    return (
      <div>
        <Row className="g-0 g-sm-1 g-md-3">
          <Col xs={5} md={6} lg={7}>
            <LocationDropdown setLocation={setLocation} location={location} />
          </Col>
          <Col xs={5} md={3} lg={2}>
          <div className="dropdown">
            <button style={{height:38}} className={"btn dropdown-toggle w-100 "+(filterGamePreferences.length>0?"btn-primary":"btn-outline-secondary")} type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">{/*data-bs-auto-close="outside"  */}
              <span className="overflow-ellipsis" style={{width:"90%"}}>
                {filterGamePreferences.length>0?filterGamePreferences.map(gp => gp.split("_")[2].trim()).join(","):"Games"}
              </span>
            </button>
            <div className="dropdown-menu px-4 py-3" aria-labelledby="dropdownMenuButton2">
              {allGames.map(g => 
              <div key={g.key} className="mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" onChange={(event) => setGamePreference(g.key,event.target.checked)} checked={filterGamePreferences.includes(g.key)}/>
                  <label className="form-check-label">
                  {g.value}
                  </label>
                </div>
              </div>)}
              {user?<p className="text-muted" style={{fontSize:14}}>* Set Defaults in User Profile</p>:<></>}
            </div>
          </div>
          </Col>
          <Col xs={2} md={3}>
          {user?<Link className="btn btn-outline-success float-end" to="/events/add"><i className="bi bi-plus"></i><span className="d-none d-md-inline"> Create</span></Link>:<></>}
          </Col>
          <Col xs={12} lg={6} className="pt-3">
            <div className="d-flex justify-content-start align-items-star gap-0 gap-sm-1">
              <Button size="sm" variant={filterFuture?"success":"outline-secondary"} onClick={toggleFilterFuture}>Future</Button>
              <Button size="sm" variant={filterPast?"warning":"outline-secondary"} onClick={toggleFilterLastMonth}>Past</Button>
              <Button size="sm" variant={filterLive?"danger":"outline-secondary"} onClick={toggleFilterLive}>Live</Button>
              <Button size="sm" variant={filterByDate?"primary":"outline-secondary"} onClick={toggleFilterByDate}><span className="d-inline d-sm-none"><i className="bi bi-calendar-date-fill"></i></span><span className="d-none d-sm-inline">By Date</span></Button>
              <Button size="sm" variant={filterSearch?"light":"outline-secondary"} onClick={toggleFilterSearch}><span className="d-inline d-sm-none"><i className="bi bi-search"></i></span><span className="d-none d-sm-inline">Search</span></Button>
              {user?<Button size="sm" variant={filterMine?"info":"outline-secondary"} onClick={() => setFilterMine(v => !v)}><span className="d-inline d-sm-none">Me</span><span className="d-none d-sm-inline">Mine</span></Button>:<></>}
            </div>
          </Col>
          {filterSearch?<>
            <Col xs={12} md={6} className="pt-3">
              <div className="input-group">
                <input className="form-control" value={keyword} onChange={(event) => setKeyword(event.target.value)}/>
                <Button variant="success" onClick={() =>setKeyword(keywordTemp)}><i className="bi bi-search"></i></Button>
              </div>
            </Col>
          </>:<></>} 
          {filterByDate?<>
            <Col xs={12} sm={6} lg={3} className="pt-3">
              <div className="input-group">
                <span className="input-group-text">From:</span>
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
              <div className="input-group">
                <span className="input-group-text">To:</span>
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