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
            <>
            {props.player.User.name}&nbsp;
            <i className="bi bi-check-circle-fill" title="Registered User"></i>&nbsp;
            {isYou?<span className="badge bg-info">You</span>:<></>}
            </>
        )
    } else {
        return (
            <>
            {props.player.player_name}
            </>
        )
    }
}