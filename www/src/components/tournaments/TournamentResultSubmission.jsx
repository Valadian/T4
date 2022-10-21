import React, {useState,useEffect,useContext} from "react"
import {Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";

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

    const handleSetWin = (event) => {
        console.log(event.target.value)
        setWin(event.target.value);
    }

    useEffect(() => {
        setMov(Math.min(400,Math.max(0,points-oppPts)))
        if(points>oppPts){
            setWin("true")
        } else if (oppPts>points){
            setWin("false")
        } else {
            setWin("")
        }
    },[oppPts, points])

    useEffect(() => {
        var mov = points-oppPts
        var delta = Math.abs(points-oppPts)
        if (delta < 60) {
            setTP((mov>0||win==="true")?6:5)
        } else if (delta<140) {
            setTP((mov>0||win==="true")?7:4)
        } else if (delta<220) {
            setTP((mov>0||win==="true")?8:3)
        } else if (delta<300) {
            setTP((mov>0||win==="true")?9:2)
        } else {
            setTP((mov>0||win==="true")?10:1)
        }
    },[points,oppPts,win])

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const myGame = (round) => round.Matches.filter(isMine)[0]
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    const myself = (match) => match.Players.filter(p => p.User?.id===user?.sub)[0]
    const opponent = (match) => match.Players.filter(p => p.User?.id!==user?.sub)[0]
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
        return (<Row key={r.id}>
                <Col className="col-12 col-lg-3"><span title={"Round "+m.round_num}>R{r.round_num}</span>, <span title={"Table "+m.table_num}>T#{m.table_num}</span> vs. <TournamentPlayerName player={opponent(m)}/></Col>
                <Col className="col-2">
                    <input className="form-control bg-dark text-white w-100" value={points} onChange={(evt) => setPoints(evt.target.value)}></input>
                </Col>
                <Col className="col-2">
                    <input className="form-control bg-dark text-white w-100" value={oppPts} onChange={(evt) => setOppPts(evt.target.value)}></input>
                </Col>
                <Col className="col-2 col-lg-1" style={{padding: ".375rem .75rem"}}>{mov}</Col>
                <Col className="col-2 col-lg-1" style={{padding: ".375rem .75rem"}}>{tp}</Col>
                <Col className="col-2"><select className={"form-select bg-dark"+(win==="true"?" text-success":(win==="false"?" text-danger":""))} value={win} onChange={(evt) => setWin(evt.target.value)}>
                    <option value={true}>Win</option>
                    <option value={false}>Loss</option>
                    <option value="">?</option>
                    </select></Col>
                <Col className="col-2 col-lg-1"><a className="btn btn-outline-success"><i className="bi bi-check-square"></i></a></Col>
        </Row>)
        })}
    </>
    )
}