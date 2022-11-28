from operator import itemgetter
from application import QueryContext
import random
from time import time

from flask import current_app as app


class Matchmaker:
    """
    Makes player matchups for T4.

    To generate pairings, query with:

        mutation nextRoundMatches($tournament_id: uuid!, $round_num: numeric = 0, $no_delete: Boolean = false) {
            NextRoundMatches(tournament_id: $tournament_id, round_num: $round_num, no_delete: $no_delete) {
                match_ids
            }
        }

    The simplest way to use it, and in most cases what you want, is to
    generate the next round's pairings.  For this case, query with
    just the $tournament_id.

    To generate pairings for an arbitrary round AND DELETE ALL
    SUBSEQUENT ONES, query with $tournament_id and $round_num of the
    round you want to generate.  If round_num exists, it will be
    deleted and regenerated.
    """

    def __init__(self, tournament_id, round_num=False, no_delete=False):

        self.tournament_id = tournament_id
        self.tournament_data = QueryContext.getTournamentData(self.tournament_id)[
            "data"
        ]["Tournament"][0]

        if round_num and not no_delete:
            self.round = int(round_num)
            success = self.deleteRoundsAtOrAfter(self.round)
            self.tournament_data = QueryContext.getTournamentData(self.tournament_id)[
                "data"
            ]["Tournament"][0]

        elif rounds_completed := self.tournament_data["Rounds_aggregate"]["aggregate"][
            "max"
        ]["round_num"]:
            self.round = int(rounds_completed) + 1
        else:
            self.round = 1

        try:
            app.logger.debug("=" * 30)
            app.logger.debug("Generating Round {}...".format(self.round))
            app.logger.debug("=" * 30)
            self.players = self.tournament_data["Ladder"]
        except KeyError:
            app.logger.debug(
                "Aborting... found no players in the ladder for tournament {}.".format(
                    tournament_id
                )
            )

            self.players = False
            self.pairings = False
            return

        random.shuffle(self.players)
        self.unpaired_players = self.players

        self.pairings = []
        self.bye = None

    def calculateScores(self):
        """Calculate TP/MoV/SoS"""

        for player in self.players:
            for player_match in player["Matches"]:
                player["tournament_points"] += player_match["tournament_points"]
                match_mov = int(player_match["points"] - player_match["opp_points"])
                player["mov"] += match_mov if match_mov > 0 else 0

        for player in self.players:
            opp_performance = {"tournament_points": 0, "rounds_played": 0}
            for opponent in player["previous_opponents"]:
                if opponent["player_name"].upper() == "BYE":
                    continue
                opp_performance["tournament_points"] += opponent["tournament_points"]
                opp_performance["rounds_played"] += len(opponent["Matches"])
            player["sos"] = not opp_performance["rounds_played"] or (
                opp_performance["tournament_points"] / opp_performance["rounds_played"]
            )

        return [
            {
                "id": tourney_player["id"],
                "tournament_points": tourney_player["tournament_points"],
                "mov": tourney_player["mov"],
                "sos": tourney_player["sos"],
            }
            for tourney_player in self.players
        ]

    def deleteRoundsAtOrAfter(self, this_round):
        """Delete any round with a higher round_num than this_round,
        including all matches and match_players."""

        app.logger.debug("deleting some shit here")
        self.to_delete = []

        for round in self.tournament_data["Rounds"]:
            if int(round["round_num"]) < this_round:
                pass
            else:
                app.logger.debug("Deleting round {}".format(this_round))
                self.to_delete.append(round)

        success = QueryContext.deleteRounds(self.to_delete)
        return success

    def generatePairings(self):

        # Fail gracefully if the tournament ladder is empty
        if not self.players:
            return False

        [self.addPreviousOpponents(player) for player in self.unpaired_players]
        scores = self.calculateScores()

        # Bye bye bye
        if len(self.players) % 2:
            # Rank players to find last place for the bye
            players_ranked = sorted(
                self.players,
                key=itemgetter("tournament_points", "mov", "sos"),
                reverse=True,
            )

            self.bye = players_ranked[-1]
            self.unpaired_players.remove(self.bye)

        # Shuffle then sort on TP only to randomize within TP tiers
        random.shuffle(self.players)
        self.players_in_pairing_order = sorted(
            self.players, key=itemgetter("tournament_points"), reverse=True
        )

        # iterate through the shuffled player list and generate pairings
        for p_idx, player in enumerate(self.players_in_pairing_order):

            if (player in self.unpaired_players) and (
                player_pair := self.matchmakePlayer(player, p_idx)
            ):
                self.pairings.append(player_pair)

        not self.bye or self.pairings.append([self.bye, "BYE"])

        if self.bye:
            app.logger.debug("{} has the bye".format(self.bye["id"]))
        else:
            app.logger.debug("No bye.")

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

    def matchmakePlayer(self, player, player_index):
        """Recurse through the pairings order until we find the first
        player this player hasn't played against before, then pair them."""

        if self.players_in_pairing_order[player_index + 1] not in [
            p["id"] for p in player["previous_opponents"]
        ]:
            self.unpaired_players.remove(player)
            self.unpaired_players.remove(
                self.players_in_pairing_order[player_index + 1]
            )

            return [player, self.players_in_pairing_order[player_index + 1]]
        elif len(self.players_in_pairing_order) == player_index + 1:
            return
        else:
            return self.matchmakePlayer(player, player_index + 1)

    def postPairings(self):
        """Create the next round, its matches, then post the players to them."""

        match_count = len(self.pairings)

        app.logger.debug("[+] Creating matches...")
        start_time = time()
        new_matches = QueryContext.createMatches(
            self.tournament_id, self.round, match_count
        )
        match_create_time = time() - start_time
        app.logger.debug("[*] Finished in {}sec".format(str(match_create_time)))

        self.new_match_ids = [
            match["id"] for match in new_matches["data"]["insert_Match"]["returning"]
        ]
        self.new_match_ids.reverse()

        app.logger.debug("[+] Creating and assigning match players...")
        start_time = time()
        self.populated_match_ids = QueryContext.createMatchPlayers(
            self.pairings, self.new_match_ids
        )
        match_player_create_time = time() - start_time
        app.logger.debug("[*] Finished in {}sec".format(str(match_player_create_time)))

        return True


class Armada(Matchmaker):
    """Matchmaking class for Armada."""

    def __init__(self, tournament_id, round_num=False, no_delete=False):

        super().__init__(tournament_id, round_num, no_delete)


class Legion(Matchmaker):
    """Matchmaking class for Legion."""

    def __init__(self, tournament_id, round_num=False, no_delete=False):

        super().__init__(tournament_id, round_num, no_delete)


class XWing(Matchmaker):
    """Matchmaking class for X-Wing."""

    def __init__(self, tournament_id, round_num=False, no_delete=False):

        super().__init__(tournament_id, round_num, no_delete)
