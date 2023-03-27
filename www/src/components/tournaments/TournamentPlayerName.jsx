import { useAuth0 } from "@auth0/auth0-react";

export default function TournamentPlayerName(props){
    const { user } = useAuth0();

    const isYou = (props.player?.User && user && props.player.User.id===user.sub)
    if (props.player === undefined){
        return (
            <>**Player is null**</>
        )
    }
    if (props.player.User!=null){
        return (
            <span className={isYou?"text-info2":""}>
            {props.player.player_name??props.player.User.name}&nbsp;
            {props.nameonly?<></>:<><i className="bi bi-check-circle-fill d-none d-md-inline" title="Registered User"></i><span className="d-inline d-md-none" title="Registered User">*</span>&nbsp;
            {isYou?<span className="badge bg-info d-none d-md-inline">You</span>:<></>}</>}
            </span>
        )
    } else {
        if(props.player.player_name && props.player.player_name!=="") {
            return <span>{props.player.player_name}</span>
        } else  if(props.player.TournamentOpponent){
            return <span className="text-secondary">Bye</span>
        } else {
            return <span className="text-secondary">Empty</span>
        }
    }
}