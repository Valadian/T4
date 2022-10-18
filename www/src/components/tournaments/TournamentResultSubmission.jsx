import React, {useState,useEffect,useContext} from "react"
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

export default function TournamentResultSubmission() {
    const {rounds, ladder, tournament, updateTournament, isOwner} = useContext(TournamentHomeContext);

    //Todo, filter matches on logged in user?
    return (
        <>
        {rounds.map(r => <>
            <div>Round {r.round_num} </div>
            {r.Matches.map(r => <>
                <div>Match</div>
            </>)}
        </>)}
        </>
    );
}