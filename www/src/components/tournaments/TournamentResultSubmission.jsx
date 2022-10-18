import React, {useState,useEffect,useContext} from "react"
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

export default function TournamentResultSubmission() {
    const {rounds, ladder, tournament, updateTournament, isOwner} = useContext(TournamentHomeContext);
    const { user, getAccessTokenSilently } = useAuth0();

    const isMine = (match) => match.Players.map(mp => mp.User?.id).includes(user?.sub)
    const roundHasMyGame = (round) => round.Matches.map(m => isMine(m)).reduce((a,b)=>a||b,false)
    //Todo, filter matches on logged in user?
    return (
        <>
        {rounds.map(r => <div key={r.id}>
            {roundHasMyGame(r)?<div>Round {r.round_num} </div>:<></>}
            {r.Matches.map(m => <div key={m.id}>
                {isMine(m)?<div>My Round</div>:<></>}
            </div>)}
        </div>)}
        </>
    );
}