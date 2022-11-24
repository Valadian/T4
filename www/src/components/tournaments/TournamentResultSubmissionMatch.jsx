import React, {useState, useEffect, useContext} from "react"
import {Col, Row} from 'react-bootstrap'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"
import TournamentPlayerName from "./TournamentPlayerName";
import TournamentColoredText from "./TournamentColoredText";

const updateDoc = `
mutation updateMatchPlayer($id: uuid!, $points: Int!, $opp_points: Int!, $tournament_points: Int!, $win: Boolean!, $draw: Boolean!, $mov: numeric!) {
    update_MatchPlayer_by_pk(pk_columns: {id: $id}, _set: {points: $points, opp_points: $opp_points, tournament_points: $tournament_points, win: $win, draw: $draw, mov: $mov}) {
        id
    }
}` 

export default function TournamentResultSubmissionMatch(props){
    const {updateTournament,config} = useContext(TournamentHomeContext);
    const {getAccessTokenSilently } = useAuth0();

    const [oppPts, setOppPts] = useState(0);
    const [points, setPoints] = useState(0);
    const [mov, setMov] = useState(0);
    const [tp, setTP] = useState(0);
    // const [win, setWin] = useState("");
    // const [draw, setDraw] = useState("");
    const NO_RESULT = ""
    const WIN = "win"
    const LOSS = "loss"
    const DRAW = "draw"
    const [result, setResult] = useState(NO_RESULT)
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setMov(config.MOV_SCORING(+points,+oppPts))
        let win = config.WIN_SCORING(+points,+oppPts)
        let draw = config.DRAW_SCORING(+points,+oppPts)
        if(draw){
            setResult(DRAW)
        } else {
            if(win===true){
                setResult(WIN)
            }
            if(win===false){
                setResult(LOSS)
            }
        }
    },[oppPts, points,config])

    useEffect(() => {
        setTP(config.TP_SCORING(points, oppPts, result===WIN, result===DRAW))
    },[points,oppPts,result,config])

    const editMatch = () => {
        setPoints(props.mp_self.points??0);
        setOppPts(props.mp_self.opp_points??0);
        setResult(props.mp_self.draw?DRAW:props.mp_self.win?WIN:LOSS);
        setEditing(true);
    }
    const cancelMatch = () => setEditing(false)
    const saveMatch = async () => {
        if(result===NO_RESULT){
            return
        }
        props.mp_self.points = points
        props.mp_self.opp_points = oppPts
        props.mp_self.win = result===WIN?true:false
        props.mp_self.draw = result===DRAW?true:false
        setEditing(false)
    
        const accessToken = await getAccessTokenSilently()
        Query("updateMatchPlayer", updateDoc, {
            id: props.mp_self.id,
            points: points,
            opp_points: oppPts,
            mov: mov,
            tournament_points: tp,
            win: result===WIN,
            draw: result===DRAW
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
            <Col className="col-4 col-md-2">
                <input className="form-control w-100" value={points} onChange={(evt) => setPoints(evt.target.value)}></input>
            </Col>
            <Col className="col-4 col-md-2">
                <input className="form-control w-100" value={oppPts} onChange={(evt) => setOppPts(evt.target.value)}></input>
            </Col>
            <Col className="col-4 col-md-2">
                <select className={"form-select"+(result===WIN?" text-success":(result===LOSS?" text-danger":""))} value={result} onChange={(evt) => setResult(evt.target.value)}>
                    <option className="text-success" value={WIN}>Win</option>
                    <option className="text-danger" value={LOSS}>Loss</option>
                    {config.CAN_DRAW?<option className="text-muted" value={DRAW}>Draw</option>:<></>}
                    <option className="text-muted" value={NO_RESULT}>?</option>
                </select>
            </Col>
            <Col className="col-4 col-md-2 col-lg-1 paddedLikeInput">{config.MOV_DATATYPE==="numeric"?mov.toFixed(2):mov}</Col>
            <Col className="col-4 col-md-2 col-lg-1 paddedLikeInput">{tp}</Col>
            <Col className="col-4 col-md-2 col-lg-1">
                <button className="btn btn-outline-success" onClick={() => saveMatch()} title="Save Match"><i className="bi bi-check-square"></i></button>
                <button className="btn btn-outline-danger" onClick={cancelMatch} title="Cancel Edit"><i className="bi bi-x-square"></i></button>
            </Col>
        </>
    }
    const ViewCols = () => {
        return <>
            <Col className="col-4 col-md-2 paddedLikeInput">
                <span>{props.mp_self.points}&nbsp;
                    {notNullAndNotEqual(props.mp_opp.opp_points,props.mp_self.points)?<span className="text-danger" title="Opponent Reported Value">({props.mp_opp.opp_points})</span>:<></>}
                    {notNullAndEqual(props.mp_opp.opp_points,props.mp_self.points)?<i className="bi bi-check-circle-fill text-success" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-4 col-md-2 paddedLikeInput">
                <span>{props.mp_self.opp_points}&nbsp;
                    {notNullAndNotEqual(props.mp_opp.points,props.mp_self.opp_points)?<span className="text-danger" title="Opponent Reported Value">({props.mp_opp.points})</span>:<></>}
                    {notNullAndEqual(props.mp_opp.points,props.mp_self.opp_points)?<i className="bi bi-check-circle-fill text-success" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-4 col-md-2 paddedLikeInput">
                <span>{props.mp_self.win?<span className="text-success">Win</span>:(props.mp_self.draw?<span className="text-muted">Draw</span>:<span className="text-danger">Loss</span>)}&nbsp;
                    {(notNullAndNotEqual(props.mp_opp.win,props.mp_self.win) || 
                     (notNullAndEqual(props.mp_opp.draw,true) && notNullAndEqual(props.mp_self.draw,true)))?<i className="bi bi-check-circle-fill text-success" title="Verified"></i>:<></>}
                </span>
            </Col>
            <Col className="col-4 col-md-2 col-lg-1 paddedLikeInput"><TournamentColoredText value={config.MOV_DATATYPE==="numeric"?props.mp_self.mov?.toFixed(2):props.mp_self.mov} min={0} max={config.MAX_POINTS}/></Col>
            <Col className="col-4 col-md-2 col-lg-1 paddedLikeInput"><TournamentColoredText value={props.mp_self.tournament_points} min={config.MIN_TPS} max={config.MAX_TPS}/>&nbsp;
                    {/* {notNullAndAddsTo11(props.mp_self.tournament_points,props.mp_opp.tournament_points)?<i className="bi bi-check-circle-fill d-none d-md-inline text-success" title="Verified"></i>:<></>} */}
            </Col>
            <Col className="col-4 col-md-2 col-lg-1">
                {!props.round.finalized?
                <button className="btn btn-outline-primary" onClick={() => editMatch()}><i className="bi bi-pen"></i></button>:
                <></>}
            </Col>
            
        </>
    }
    var verified =  notNullAndEqual(props.mp_opp.opp_points,props.mp_self.points) && 
                    notNullAndEqual(props.mp_opp.points,props.mp_self.opp_points) &&
                    // Can no longer easily verify tournament points 
                    // notNullAndAddsTo11(props.mp_self.tournament_points,props.mp_opp.tournament_points) &&
                    ((props.mp_opp.draw!==true && props.mp_self.draw!==true && notNullAndNotEqual(props.mp_opp.win,props.mp_self.win)) ||
                    (notNullAndEqual(props.mp_opp.draw,true) && notNullAndEqual(props.mp_self.draw,true) && notNullAndEqual(props.mp_opp.win,props.mp_self.win)))
                    
    var conflict =  notNullAndNotEqual(props.mp_opp.opp_points,props.mp_self.points) || 
                    notNullAndNotEqual(props.mp_opp.points,props.mp_self.opp_points) ||
                    notNullAndNotEqual(props.mp_opp.draw,props.mp_self.draw) ||
                    ((props.mp_opp.draw!==true && props.mp_self.draw!==true && notNullAndEqual(props.mp_opp.win,props.mp_self.win)) ||
                     (notNullAndEqual(props.mp_opp.draw,true) && notNullAndEqual(props.mp_self.draw,true) && notNullAndNotEqual(props.mp_opp.win,props.mp_self.win)))
    return (
        <Row className={"pb-3 roundRow"+(verified?" roundVerified":"")+(conflict?" roundConflict":"")}>
            <Col className="col-12 col-lg-3 paddedLikeInput"><span title={"Round "+props.round.round_num}>Rnd {props.round.round_num}</span>, <span title={"Table "+props.match.table_num}>Tbl #{props.match.table_num}</span> vs. <TournamentPlayerName player={props.mp_opp}/></Col>
            
            
            {editing?
            EditCols():
            ViewCols()}
        </Row>
    )
}