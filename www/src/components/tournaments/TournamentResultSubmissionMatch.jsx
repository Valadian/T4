import React, {useState, useEffect, useContext} from "react"
import {Tab, Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import ptsToTp from "../../util/armada";


const updateDoc = `
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean!, $mov: Int!) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, mov: $mov}) {
        id
    }
}` 

export default function TournamentResultSubmissionMatch(props){
    const {rounds, ladder, tournament, updateTournament, isOwner, isParticipant} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();

    const [oppPts, setOppPts] = useState(0);
    const [points, setPoints] = useState(0);
    const [mov, setMov] = useState(0);
    const [tp, setTP] = useState(0);
    const [win, setWin] = useState("");
    const [editing, setEditing] = useState(false);

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
        setTP(ptsToTp(points, oppPts, win))
    },[points,oppPts,win])

    const editMatch = () => {
        setPoints(props.mp_self.points??0);
        setOppPts(props.mp_self.opp_points??0);
        setWin(props.mp_self.win);
        setEditing(true);
    }
    const cancelMatch = () => setEditing(false)
    const saveMatch = async () => {
        if(win===""){
            return
        }
        props.mp_self.points = points
        props.mp_self.opp_points = oppPts
        props.mp_self.win = win
        setEditing(false)
    
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: props.mp_self.id,
            points: points,
            opp_points: oppPts,
            mov: mov,
            tournament_points: tp,
            win: win
        },accessToken)
        .then(() => {
            updateTournament();
        })
    }
    const notNullAndEqual = (v1,v2) => v1!=null && v2!=null && v1===v2
    const notNullAndNotEqual = (v1,v2) => v1!=null && v2!=null && v1!==v2
    const notNullAndAddsTo11 = (v1,v2) => v1!=null && v2!=null && v1+v2===11
    const EditCols = () => {
        return <>
            <Col className="col-2">
                <input className="form-control w-100" value={points} onChange={(evt) => setPoints(evt.target.value)}></input>
            </Col>
            <Col className="col-2">
                <input className="form-control w-100" value={oppPts} onChange={(evt) => setOppPts(evt.target.value)}></input>
            </Col>
            <Col className="col-2 col-lg-1 paddedLikeInput">{mov}</Col>
            <Col className="col-2 col-lg-1 paddedLikeInput">{tp}</Col>
            <Col className="col-2">
                <select className={"form-select bg-dark"+(win==="true"?" text-success":(win==="false"?" text-danger":""))} value={win} onChange={(evt) => setWin(evt.target.value)}>
                    <option value={true}>Win</option>
                    <option value={false}>Loss</option>
                    <option value="">?</option>
                </select>
            </Col>
            <Col className="col-2 col-lg-1">
                <a className="btn btn-outline-success" onClick={() => saveMatch()} title="Save Match"><i className="bi bi-check-square"></i></a>
                <a className="btn btn-outline-danger" onClick={cancelMatch} title="Cancel Edit"><i className="bi bi-x-square"></i></a>
            </Col>
        </>
    }
    const ViewCols = () => {
        return <>
            <Col className="col-2 paddedLikeInput">
                <span>{props.mp_self.points}&nbsp;
                    {notNullAndNotEqual(props.mp_opp.opp_points,props.mp_self.points)?<span className="text-danger" title="Opponent Reported Value">({props.mp_opp.opp_points})</span>:<></>}
                    {notNullAndEqual(props.mp_opp.opp_points,props.mp_self.points)?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-2 paddedLikeInput">
                <span>{props.mp_self.opp_points}&nbsp;
                    {notNullAndNotEqual(props.mp_opp.points,props.mp_self.opp_points)?<span className="text-danger" title="Opponent Reported Value">({props.mp_opp.points})</span>:<></>}
                    {notNullAndEqual(props.mp_opp.points,props.mp_self.opp_points)?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-2 col-lg-1 paddedLikeInput">{props.mp_self.mov}</Col>
            <Col className="col-2 col-lg-1 paddedLikeInput">{props.mp_self.tournament_points}&nbsp;
                    {notNullAndAddsTo11(props.mp_self.tournament_points,props.mp_opp.tournament_points)?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
            </Col>
            <Col className="col-2 paddedLikeInput">
                <span>{props.mp_self.win?<span className="text-success">Win</span>:<span className="text-danger">Loss</span>}&nbsp;
                    {notNullAndNotEqual(props.mp_opp.win,props.mp_self.win)?<i className="bi bi-check-circle-fill d-none d-md-inline text-info" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-2 col-lg-1">
                {!props.round.finalized?
                <a className="btn btn-outline-primary" onClick={() => editMatch()}><i className="bi bi-pen"></i></a>:
                <></>}
            </Col>
            
        </>
    }
    var verified =  notNullAndEqual(props.mp_opp.opp_points,props.mp_self.points) && 
                    notNullAndEqual(props.mp_opp.points,props.mp_self.opp_points) &&
                    notNullAndAddsTo11(props.mp_self.tournament_points,props.mp_opp.tournament_points) &&
                    notNullAndNotEqual(props.mp_opp.win,props.mp_self.win)
                    
    var conflict =  notNullAndNotEqual(props.mp_opp.opp_points,props.mp_self.points) || 
                    notNullAndNotEqual(props.mp_opp.points,props.mp_self.opp_points) ||
                    notNullAndEqual(props.mp_opp.win,props.mp_self.win)
    return (
        <Row className={"pb-3 roundRow"+(verified?" roundVerified":"")+(conflict?" roundConflict":"")}>
            <Col className="col-12 col-lg-3 paddedLikeInput"><span title={"Round "+props.round.round_num}>Rnd {props.round.round_num}</span>, <span title={"Table "+props.match.table_num}>Tbl #{props.match.table_num}</span> vs. <TournamentPlayerName player={props.mp_opp}/></Col>
            
            
            {editing?
            EditCols():
            ViewCols()}
        </Row>
    )
}