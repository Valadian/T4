from operator import itemgetter
from application import QueryContext

from flask import current_app as app


class ScoreUpdater:
    """
    Calculates and returns player scores for a given tournament_id. If
    you want live scores, $live should be True; otherwise,
    you'll get finalized scores.

    To get the scores, query with:

        mutation UpdateScores($tournament_id: uuid = "", $live) {
           UpdateScores: (tournament_id: $tournament_id, live: $live) {
                affected_rows
            }
        }

    """

    def __init__(self, tournament_id, live=True, tournament_data=False):

        self.tournament_id = tournament_id

        if tournament_data:
            self.tournament_data = tournament_data
        else:
            self.tournament_data = QueryContext.getTournamentData(
                self.tournament_id, live=live
            )["data"]["Tournament"][0]
        try:
            app.logger.debug("=" * 30)
            app.logger.debug("Calculating scores...")
            app.logger.debug("=" * 30)
            self.players = self.tournament_data["Ladder"]
        except KeyError:
            app.logger.debug(
                "Aborting... found no players in the ladder for tournament {}.".format(
                    tournament_id
                )
            )

            self.players = False
            return

    def addPreviousOpponents(self, player):

        player["previous_opponents"] = []

        for previous_match in player["Matches"]:
            not previous_match["TournamentOpponent"] or player[
                "previous_opponents"
            ].append(
                [
                    p
                    for p in self.players
                    if p["id"] == previous_match["TournamentOpponent"]["id"]
                ][0]
            )

        return player

    def calculateScores(self, players=False):
        """Calculate TP/MoV/SoS.  The default class method here is for
        Armada; replace for subclasses."""

        if not players:
            self.players = [self.addPreviousOpponents(player) for player in self.players]
        else:
            self.players = players

        for player in self.players:
            for player_match in player["Matches"]:
                if (
                    player_match["tournament_points"] is not None
                    and player_match["points"] is not None
                    and player_match["opp_points"] is not None
                ):
                    player["tournament_points"] += player_match["tournament_points"]
                    match_mov = (
                        int(player_match["points"] - player_match["opp_points"])
                        if player_match["points"] and player_match["opp_points"]
                        else 0
                    )
                    player["mov"] += match_mov if match_mov > 0 else 0

        for player in self.players:
            opp_record = {"tournament_points": 0, "rounds_played": 0}
            for opponent in player["previous_opponents"]:
                if opponent["player_name"].upper() == "BYE":
                    continue
                opp_record["tournament_points"] += opponent["tournament_points"]
                opp_record["rounds_played"] += len(opponent["Matches"])
            player["sos"] = (
                0
                if not opp_record["rounds_played"]
                else (opp_record["tournament_points"] / opp_record["rounds_played"])
            )

        return self.players

    def rankPlayers(self, players=False):

        # Fail gracefully if the tournament ladder is empty
        if players: 
            self.players = players
        if not self.players:
            return False

        self.players = sorted(
            self.players,
            key=itemgetter("tournament_points", "mov", "sos"),
            reverse=True,
        )

        return self.players

    def scoreAndRankPlayers(self):

        self.calculateScores()
        self.rankPlayers()

        return [
            {
                "id": tourney_player["id"],
                "player_name": tourney_player["player_name"],
                "tournament_points": tourney_player["tournament_points"],
                "mov": tourney_player["mov"],
                "sos": tourney_player["sos"],
            }
            for tourney_player in self.players
        ]


class ArmadaScoreUpdater(ScoreUpdater):
    def __init__(self, tournament_id, live=True, tournament_data=False):
        super().__init__(tournament_id, live, tournament_data)


class XWingScoreUpdater(ScoreUpdater):
    def __init__(self, tournament_id, live=True, tournament_data=False):
        super().__init__(tournament_id, live, tournament_data)


class LegionScoreUpdater(ScoreUpdater):
    def __init__(self, tournament_id, live=True, tournament_data=False):
        super().__init__(tournament_id, live, tournament_data)
