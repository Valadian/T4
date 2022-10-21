import { useAuth0 } from "@auth0/auth0-react";

export default function TournamentPlayerName(props){
    const { user, getAccessTokenSilently } = useAuth0();

    const isYou = (props.player.User && user && props.player.User.id===user.sub)
    if (props.player == undefined){
        return (
            <>**Player is null**</>
        )
    }
    if (props.player.User){
        return (
            <span className={isYou?"text-info":""}>
            {props.player.User.name}&nbsp;
            <i className="bi bi-check-circle-fill d-none d-md-inline" title="Registered User"></i><span className="d-inline d-md-none" title="Registered User">*</span>&nbsp;
            {isYou?<span className="badge bg-info d-none d-md-inline">You</span>:<></>}
            </span>
        )
    } else {
        return (
            <span>
            {props.player.player_name}
            </span>
        )
    }
}