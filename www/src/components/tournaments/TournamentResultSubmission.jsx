import React, {useState,useEffect,useContext} from "react"
import {Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";

const updateDoc = `
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean!, $mov: Int!) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, mov: $mov}) {
      id
    }
  }
  ` 

export default function TournamentResultSubmission(props) {
    const {rounds, ladder, tournament, updateTournament, isOwner, isParticipant} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();
    const [oppPts, setOppPts] = useState(0);
    const [points, setPoints] = useState(0);
    // const [calcMov, setCalcMov] = useState(0);
    const [mov, setMov] = useState(0);
    // const [calcTp, setCalcTP] = useState(0);
    const [tp, setTP] = useState(0);
    const [win, setWin] = useState("");
    const [matchId, setMatchId] = useState();

    const handleSetWin = (event) => {
        console.log(event.target.value)
        setWin(event.target.value);
    }

    useEffect(() => {
        setMov(Math.min(400,Math.max(0,points-oppPts)))
        if(points>oppPts){
            setWin(true)
        } else if (oppPts>points){
            setWin(false)
        } else {
            setWin("")
        }
    },[oppPts, points])

    useEffect(() => {
        var mov = points-oppPts
        var delta = Math.abs(points-oppPts)
        if (delta < 60) {
            setTP((mov>0||win)?6:5)
        } else if (delta<140) {
            setTP((mov>0||win)?7:4)
        } else if (delta<220) {
            setTP((mov>0||win)?8:3)
        } else if (delta<300) {
            setTP((mov>0||win)?9:2)
        } else {
            setTP((mov>0||win)?10:1)
        }
    },[points,oppPts,win])

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const myGame = (round) => round.Matches.filter(isMine)[0]
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    const myself = (match) => match.Players.filter(p => p.User?.id===user?.sub)[0]
    const opponent = (match) => match.Players.filter(p => p.User?.id!==user?.sub)[0]

    const editMatch = (mp) => {
        setMatchId(mp.id);
        setPoints(mp.points??0);
        setOppPts(mp.opp_points??0);
        setWin(mp.win);
    }
    const saveMatch = async (mp) => {
        if(win===""){
            return
        }
        mp.points = points
        mp.opp_points = oppPts
        mp.win = win
        setMatchId(null)
    
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: matchId,
            points: points,
            opp_points: oppPts,
            mov: mov,
            tournament_points: tp,
            win: win
        },accessToken)
        .then(() => {
            updateTournament();
        })
        .then(() => {
            setMatchId(null);
        });
    }
    return (
    <>
        <Row className="pb-1 header mb-3">
            <Col className="col-12 col-lg-3">Opponent</Col>
            <Col className="col-2">Self</Col>
            <Col className="col-2">Opp</Col>
            <Col className="col-2 col-lg-1">Mov</Col>
            <Col className="col-2 col-lg-1">TP</Col>
            <Col className="col-2">W/L</Col>
            <Col className="col-2 col-lg-1"></Col>
        </Row>
        {rounds.filter(roundHasMyGame).map(r => { 
            var m = myGame(r)
            var mp_self = myself(m)
            var mp_opp = opponent(m)
        return (
        <Row key={r.id}>
            <Col className="col-12 col-lg-3"><span title={"Round "+m.round_num}>Rnd {r.round_num}</span>, <span title={"Table "+m.table_num}>Tbl #{m.table_num}</span> vs. <TournamentPlayerName player={opponent(m)}/></Col>
            
            <Col className="col-2">
                {mp_self.id===matchId?
                <input className="form-control bg-dark text-white w-100" value={points} onChange={(evt) => setPoints(evt.target.value)}></input>:
                <span>{mp_self.points}&nbsp;
                    {mp_opp.opp_points!=null && mp_self.points!=null && mp_self.points!==mp_opp.opp_points?
                    <span className="text-danger" title="Opponent Reported Value">({mp_opp.opp_points})</span>:
                    (mp_self.points!=null && mp_opp.opp_points!=null?
                        <i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:
                        <></>)
                    }</span>}
            </Col>
            <Col className="col-2">
                {mp_self.id===matchId?
                <input className="form-control bg-dark text-white w-100" value={oppPts} onChange={(evt) => setOppPts(evt.target.value)}></input>:
                <span>{mp_self.opp_points}&nbsp;
                    {mp_opp.points!=null && mp_self.opp_points!=null && mp_self.opp_points!==mp_opp.points?
                    <span className="text-danger" title="Opponent Reported Value">({mp_opp.points})</span>:
                    (mp_self.opp_points!=null && mp_opp.points!=null?
                        <i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:
                        <></>)
                    }</span>}
            </Col>
            <Col className="col-2 col-lg-1" style={{padding: ".375rem .75rem"}}>{mp_self.id===matchId?mov:mp_self.mov}</Col>
            <Col className="col-2 col-lg-1" style={{padding: ".375rem .75rem"}}>{mp_self.id===matchId?tp:mp_self.tournament_points}&nbsp;
                    {mp_self.tournament_points!=null && mp_opp.tournament_points!=null && mp_self.tournament_points+mp_opp.tournament_points===11?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
            </Col>
            {mp_self.id===matchId?
            <Col className="col-2">
                <select className={"form-select bg-dark"+(win==="true"?" text-success":(win==="false"?" text-danger":""))} value={win} onChange={(evt) => setWin(evt.target.value)}>
                    <option value={true}>Win</option>
                    <option value={false}>Loss</option>
                    <option value="">?</option>
                </select>
            </Col>:
            <Col className="col-2" style={{padding: ".375rem .75rem"}}>
                <span style={{padding: ".375rem .75rem"}}>{mp_self.win?<span className="text-success">Win</span>:<span className="text-danger">Loss</span>}&nbsp;
                    {mp_opp.win!=null && mp_self.win!=null && mp_self.win===!mp_opp.win?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
                </span>
            </Col>}
            <Col className="col-2 col-lg-1">
                {mp_self.id===matchId?
                <a className="btn btn-outline-success" onClick={() => saveMatch(mp_self)}><i className="bi bi-check-square"></i></a>:
                <a className="btn btn-outline-primary" onClick={() => editMatch(mp_self)}><i className="bi bi-pen"></i></a>}
            </Col>
        </Row>)
        })}
    </>
    )
}