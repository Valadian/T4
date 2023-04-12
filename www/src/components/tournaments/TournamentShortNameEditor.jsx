
import React, { useState, useEffect, useContext } from "react";
import Query from "../../data/T4GraphContext";
import { Form, FloatingLabel } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import {TournamentHomeContext} from "../../pages/tournaments/TournamentHome"

const updateTournamentShortNameDoc = `
  mutation updateTournamentShortName($id: uuid!, $short_name: String = null) {
    update_Tournament_by_pk(pk_columns: {id: $id}, _set: {short_name: $short_name}) {
      id
      short_name
    }
  }
  
`;

export default function TournamentNameEditor() {
    const [uniqueName, setUniqueName] = useState("");
    const [editingUniqueName, setEditingUniqueName] = useState(false);
    const { getAccessTokenSilently } = useAuth0();
    const {tournament, updateTournament, toaster} = useContext(TournamentHomeContext);
    const [ saveFailed, setSaveFailed ] = useState(false);
    useEffect(() => {
        setUniqueName(tournament.short_name??"");
    },[tournament.short_name, setUniqueName]);

    const save = async () => {
        var potentiallyNullUniqueName = uniqueName
        if (!potentiallyNullUniqueName) {
          potentiallyNullUniqueName = null
        }
        const accessToken = await getAccessTokenSilently()
        Query("updateTournamentShortName", updateTournamentShortNameDoc, {
          short_name: potentiallyNullUniqueName,
          id: tournament.id,
        },accessToken)
        .then(() => {
            updateTournament();
        })
        .then(() => {
          if(potentiallyNullUniqueName){
            toaster.current.ShowSuccess("Short Name Reserved!");
          } else {  
            toaster.current.ShowInfo("Short Name Cleared!");
          }
          setSaveFailed(false);
        })
        .catch((error)=>{
          toaster.current.ShowError("Short Name Already Taken!");
          setUniqueName(tournament.short_name??"");
          setSaveFailed(true);
        })
        // .then(() => {
        //   setUniqueName("");
        // });
        setEditingUniqueName(false)
    };

    return (
      <div className="d-flex">
        {editingUniqueName?
        <>
          <FloatingLabel
          className="w-100"
          controlId="shortName"
          label="Unique Short Name (like: 2023_ARMADA_WORLDS)"
            >
            <Form.Control
              type="text"
              placeholder=""
              required
              onChange={(event) => setUniqueName(event.target.value)}
              value={uniqueName}
              autoFocus
            />
          </FloatingLabel>
          <button className="btn btn-outline-success" onClick={() => {
                save();
              }} title="Save Unique Name"><i className="bi bi-save"></i></button>
          <button className="btn btn-outline-danger" onClick={() => {
                    setEditingUniqueName(false);
                  }} title="Cancel Edit Unique Name"><i className="bi bi-pen"></i></button>

        </>:<>
          <div className={"card card-no-grow w-100"+(saveFailed?" border-danger text-danger":"")}>
            <div className="card-body">
              <b>Unique Shortname: </b> {uniqueName}
            </div>
          </div>
          <button className="btn btn-outline-primary" onClick={() => {
                    setEditingUniqueName(true);
                  }} title="Edit Unique Name"><i className="bi bi-pen"></i></button>
        </>}
      </div>
    );
}