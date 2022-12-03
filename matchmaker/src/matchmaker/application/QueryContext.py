import os
import requests

from flask import current_app as app


def Query(operation_name, operation_doc, variables):

    if int(os.environ.get("MATCHMAKER_INSECURE_USE_HTTP")):
        url = "http://{}/v1/graphql".format(os.environ.get("MATCHMAKER_HASURA_URL"))
    else:
        url = "https://{}/v1/graphql".format(os.environ.get("MATCHMAKER_HASURA_URL"))
    data = {
        "query": str(operation_doc),
        "variables": variables,
        "operationName": operation_name,
    }

    headers = {
        "X-Hasura-Admin-Secret": os.environ.get("MATCHMAKER_HASURA_ADMIN_SECRET")
    }

    r = requests.post(url, json=data, headers=headers)

    return r.json()


def getTournamentData(tourney_id, live=True):

    operation_name = "getTournamentData"
    vars = {"tournament_id": str(tourney_id)}

    get_tournament_data_doc = (
        """
        query getTournamentData($tournament_id: uuid = "") {
            Tournament(where: {id: {_eq: $tournament_id}, deleted: {_eq: false}}) {
                game
                scoring_ruleset_id
                Ladder {
                    id
                    player_name
                    tournament_points
                    mov
                    sos
                    user_id
                    Matches(where: {Match: {Round: """
        + ("" if live else "{finalized: {_eq: true}}, _and: ")
        + """{deleted: {_eq: false}}}}) {
                        tournament_points
                        points
                        TournamentOpponent {
                            id
                            player_name
                        }
                        opp_points
                    }
                }
                Rounds_aggregate(where: {deleted: {_eq: false}}) {
                    aggregate {
                        max {
                            round_num
                        }
                    }
                }
                Rounds(where: {deleted: {_eq: false}}) {
                    Matches {
                        id
                        Players {
                            id
                        }
                    }
                    id
                    round_num
                }
            }
        }
    """
    )

    match_history = Query(operation_name, get_tournament_data_doc, vars)

    return match_history


def deleteRounds(rounds_to_delete=[]):
    """Deletes the list of rounds and all children."""

    # app.logger.debug(rounds_to_delete)
    things_to_delete = {
        "rounds": [round["id"] for round in rounds_to_delete],
        "matches": [],
        "match_players": [],
    }
    for round in rounds_to_delete:
        for match in round["Matches"]:
            things_to_delete["matches"].append(match["id"])
            for match_player in match["Players"]:
                things_to_delete["match_players"].append(match_player["id"])

    operation_name = "DeleteThings"
    vars = things_to_delete
    delete_things_doc = """
        mutation DeleteThings($match_players: [uuid!]! = "", $matches: [uuid!]! = "", $rounds: [uuid!]! = "") {
            update_MatchPlayer(where: {id: {_in: $match_players}}, _set: {deleted: true}) {
                affected_rows
            }
            update_Match(where: {id: {_in: $matches}}, _set: {deleted: true}) {
                affected_rows
            }
            update_TournamentRound(where: {id: {_in: $rounds}}, _set: {deleted: true}) {
                affected_rows
            }
        }
    """

    response = Query(operation_name, delete_things_doc, vars)
    success = not bool("errors" in response.keys())
    if not success:
        app.logger.debug(things_to_delete)
        app.logger.debug(response)
    return success


def createRound(tourney_id, round_num):

    operation_name = "CreateRound"
    vars = {"tournament_id": tourney_id, "round_num": round_num}
    create_round_doc = """
        mutation CreateRound($round_num: numeric = "", $tournament_id: uuid = "") {
            insert_TournamentRound(objects: {round_num: $round_num, tournament_id: $tournament_id}) {
                returning {
                    id
                }
            }
        }
    """

    round_id = Query(operation_name, create_round_doc, vars)["data"][
        "insert_TournamentRound"
    ]["returning"][0]["id"]

    return round_id


def createMatches(tourney_id, round_num, count):

    round_id = createRound(tourney_id, round_num)
    operation_name = "CreateMatches"
    matches_list = [
        {"round_id": round_id, "table_num": table_num + 1} for table_num in range(count)
    ]
    vars = {"matches": matches_list}
    create_matches_doc = """
        mutation CreateMatches($matches: [Match_insert_input!] !) {
            insert_Match(objects: $matches) {
                returning {
                    id
                    table_num
                }
            }
        }
    """

    new_matches = Query(operation_name, create_matches_doc, vars)

    return round_id, new_matches


def createMatchPlayers(pairings, match_ids):

    """Take the list of player pairings and the list of match ids and
    create MatchPlayers in those matches appropriately."""

    operation_name = "CreateMatchPlayers"
    create_match_player_doc = """
        mutation CreateMatchPlayers($match_players: [MatchPlayer_insert_input!] = {}) {
            insert_MatchPlayer(objects: $match_players) {
                affected_rows
                returning {
                    Match {
                        id
                    }
                }
            }
        }
    """

    populated_matches = []

    for pair in pairings:
        match_id = match_ids.pop()

        app.logger.debug("[+] Next pair...")

        if pair[1] == "BYE":
            populated_matches.append(
                {
                    "tournament_player_id": pair[0]["id"],
                    "player_name": pair[0]["player_name"],
                    "user_id": pair[0]["user_id"],
                    "tournament_opponent_id": None,
                    "match_id": match_id,
                    "confirmed": False,
                    "disqualified": False,
                    "tournament_points": 0,
                    "mov": 0,
                }
            )
            populated_matches.append(
                {
                    "tournament_player_id": None,
                    "player_name": "BYE",
                    "tournament_opponent_id": pair[0]["id"],
                    "match_id": match_id,
                    "confirmed": False,
                    "disqualified": False,
                    "tournament_points": 0,
                    "mov": 0,
                }
            )
        else:
            populated_matches.append(
                {
                    "tournament_player_id": pair[0]["id"],
                    "player_name": pair[0]["player_name"],
                    "user_id": pair[0]["user_id"],
                    "tournament_opponent_id": pair[1]["id"],
                    "match_id": match_id,
                    "confirmed": False,
                    "disqualified": False,
                    "tournament_points": 0,
                    "mov": 0,
                }
            )
            populated_matches.append(
                {
                    "tournament_player_id": pair[1]["id"],
                    "player_name": pair[1]["player_name"],
                    "user_id": pair[1]["user_id"],
                    "tournament_opponent_id": pair[0]["id"],
                    "match_id": match_id,
                    "confirmed": False,
                    "disqualified": False,
                    "tournament_points": 0,
                    "mov": 0,
                }
            )

    vars = {"match_players": populated_matches}

    response = Query(operation_name, create_match_player_doc, vars)

    success = not bool("errors" in response.keys())
    if not success:
        app.logger.debug(response)
        return False
    return response["data"]
