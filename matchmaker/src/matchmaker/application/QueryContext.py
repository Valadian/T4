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


def getMatchHistory(tourney_id):

    operation_name = "getMatchHistory"
    vars = {"tournament_id": str(tourney_id)}

    # get_match_history_doc = """
    #     query getMatchHistory($tournament_id: uuid = "") {
    #         Match(where: {Round: {tournament_id: {_eq: $tournament_id}}}) {
    #             Players {
    #                 id
    #             }
    #             Round {
    #                 round_num
    #             }
    #         }
    #         Tournament(where: {id: {_eq: $tournament_id}}) {
    #             Ladder {
    #                 id
    #                 tournament_points
    #                 mov
    #                 sos
    #             }
    #         }
    #     }
    # """

    get_match_history_doc = """
        query getMatchHistory($tournament_id: uuid = "") {
            Tournament(where: {id: {_eq: $tournament_id}}) {
                Ladder {
                    id
                    tournament_points
                    mov
                    sos
                    Matches(where: {Match: {Round: {finalized: {_eq: true}}}}) {
                        TournamentOpponent {
                            id
                        }
                    }
                }
                Rounds_aggregate {
                    aggregate {
                        max {
                            round_num
                        }
                    }
                }
            }
        }
    """

    match_history = Query(operation_name, get_match_history_doc, vars)

    return match_history


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

    return new_matches


def createMatchPlayers(pair, match_id):

    operation_name = "CreateMatchPlayer"
    create_match_player_doc = """
        mutation CreateMatchPlayer(
            $tournament_player_id: uuid!, 
            $tournament_opponent_id: uuid, 
            $match_id: uuid!
            ) {
        insert_MatchPlayer(
            objects: {
                tournament_player_id: $tournament_player_id,
                tournament_opponent_id: $tournament_opponent_id,
                match_id: $match_id,
                confirmed: false,
                disqualified: false
            }) {
                affected_rows
            }
        }
    """

    # Pair bye with null
    if pair[1] == "bye":
        vars = {
            "tournament_player_id": pair[0]["id"],
            "match_id": match_id,
        }
        response = Query(operation_name, create_match_player_doc, vars)
        success = not bool("errors" in response.keys())

        return success

    vars = {
        "tournament_player_id": pair[0]["id"],
        "tournament_opponent_id": pair[1]["id"],
        "match_id": match_id,
    }
    response = Query(operation_name, create_match_player_doc, vars)
    success_a = not bool("errors" in response.keys())

    vars = {
        "tournament_player_id": pair[1]["id"],
        "tournament_opponent_id": pair[0]["id"],
        "match_id": match_id,
    }
    response = Query(operation_name, create_match_player_doc, vars)
    success_b = not bool("errors" in response.keys())

    success = success_a and success_b
    if not success:
        app.logger.debug(response)
    return success
