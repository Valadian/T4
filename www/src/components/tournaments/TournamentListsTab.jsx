import React, {useState,useEffect,useContext} from "react"
import {Button, Form, Row} from 'react-bootstrap'
import Select from 'react-select'
import Query from "../../data/T4GraphContext";
import { useAuth0 } from "@auth0/auth0-react";
import TournamentPlayerName from "./TournamentPlayerName";
import { TournamentHomeContext } from "../../pages/tournaments/TournamentHome";
import getScoringConfig from "../../util/rulesets"

const getFactionsDoc = `
query AllFactions($game: Game_enum!) {
    Faction(where: {game: {_eq: $game}}, order_by: {name: asc}) {
      acronym
      game
      image
      key
      name
    }
  }
`
const updateListDoc = `
mutation UpdatePlayerList($tournament_player_id: uuid!, $raw: String = null, $faction: String = null) {
    insert_PlayerList_one(object: {tournament_player_id: $tournament_player_id}, on_conflict: {constraint: PlayerList_tournament_player_id_key, update_columns: []}) {
      tournament_player_id
    }
    update_PlayerList(where: {tournament_player_id: {_eq: $tournament_player_id}}, _set: {faction: $faction, raw: $raw}) {
        returning {
            faction
            raw
        }
    }
  }
`
export default function TournamentListsTab() {
    const { user, getAccessTokenSilently } = useAuth0();
    const { tournament, isOwner, dispatchTournament, updateTournament } = useContext(TournamentHomeContext);
    const [factionOptions, setFactionOptions] = useState([])
    const [allFactions, setAllFactions] = useState({})

    useEffect(() => {
        Query("AllFactions", getFactionsDoc, { game: tournament.Game?.key })
        .then((response) => {
            setFactionOptions(response.Faction.map(g => {return {value:g.key, label:g.name}}))
            setAllFactions(Object.fromEntries(response.Faction.map(f => [f.key, f])))
        })
    },[tournament])


    const EditButton = ({User, Action}) => (isOwner || (User && User?.id===user?.sub))?
        ((tournament.lists_locked && !isOwner)?<Button variant="outline-secondary" title="Lists are locked" disabled><i className="bi bi-lock-fill"></i></Button>:
        <Button variant="outline-primary" onClick={Action} title="Set List">{tournament.lists_locked?<i className="bi bi-lock-fill"></i>:<i className="bi bi-pen"></i>}</Button>)
    :<></>
    const SuggestButton = ({User, Action}) => (user && !isOwner && !(User?.id===user?.sub))?<Button variant="outline-secondary" onClick={Action} title="Suggest List"><i className="bi bi-chat-left-text-fill"></i></Button>:<></>
    
    const ListCard = ({tournamentPlayer}) => {
        const [tp, setTp] = useState(tournamentPlayer)
        const [editing, setEditing] = useState(false)
        const [faction, setFaction] = useState(tp.PlayerList?.Faction)
        const [raw, setRaw] = useState(tp.PlayerList?.raw)
        const [factionSelected, setFactionSelected] = useState()
        const [rawList, setRawList] = useState(tp.PlayerList?.raw??"")
        useEffect(() => {

        })
        const toggleEdit = () => {
            if(editing){
                setEditing(false)
            } else {
                setRawList(raw??"")
                setFactionSelected(factionOptions.filter(o => o.value===faction?.key)[0])
                setEditing(true)
            }
        }
        const save = async () => {
            var accessToken = undefined
            if (user) {
                accessToken = await getAccessTokenSilently()
            }
            Query("UpdatePlayerList", updateListDoc, { 
                tournament_player_id:tp.id, 
                faction:factionSelected.value, 
                raw:rawList },accessToken)
            .then((response) => {
                setEditing(false);
                // setRaw(rawList);
                // setFaction(allFactions[factionSelected.value])
                // dispatchTournament({type: 'reset', payload: tournament})
                updateTournament();
            })
        }
        if(!tournament.lists_visible && !isOwner && !(user && (tp.User?.id===user?.sub))){
            return <></>
        }
        return <div className="card mb-1">
            <div className="card-header d-flex gap-3">
                <span className="me-auto"><TournamentPlayerName player={tp}/></span>
                <EditButton User={tp.User} Action={toggleEdit}/>
                {/* TODO: in the future would like to enable players to suggest/vote lists*/}
                {/* <SuggestButton User={tp.User} /> */}
            </div>
            <div className="card-body">
                {editing?<>
                    <div className="mb-3">
                        <label className="form-label">Faction</label>
                        <Select 
                            value={factionSelected} 
                            onChange={(vl) => setFactionSelected(vl)} 
                            classNamePrefix="react-select" 
                            className="react-select" 
                            options={factionOptions}/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">List</label>
                        <Form.Control
                            // className="h-100"
                            as="textarea"
                            placeholder="Paste Raw List Here"
                            rows={10}
                            required
                            onChange={(event) => setRawList(event.target.value)}
                            value={rawList}
                            autoFocus
                            className="mb-3"
                            style={{fontSize: 'smaller'}}
                        />
                    </div>
                    <div className="d-flex flex-row-reverse gap-3 ">
                        <Button variant="outline-success" onClick={save}>Save</Button>
                    </div>
                </>:<>
                    {raw?<>
                    <div className="listFactionIconWrapper">
                        <img className="listFactionIcon" src={faction?.image} alt="Faction Icon"/>
                    </div>
                    <pre>{raw}</pre>
                    </>:
                    <span className="text-muted">No List</span>}
                </>}
            </div>
        </div>
    }
    return (<>
        {(!tournament.lists_visible)?<h2 className="text-warning">Lists are Hidden</h2>:<></>}
        {tournament.Ladder.map(tp => <ListCard key={tp.id} tournamentPlayer={tp}/>)}
    </>)
}