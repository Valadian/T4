import { Col, Row } from "react-bootstrap";

export default function TournamentMatch(props){
    var player1 = props.match.Players[0]
    var player2 = props.match.Players[1]
    return (
    <Row className="mb-3">
        <Col>{props.match.table_num}</Col>
        <Col>{player1?.player_name}</Col>
        <Col>{player1?.points}</Col>
        <Col>{player2?.player_name}</Col>
        <Col>{player2?.points}</Col>
    </Row>
    )
}