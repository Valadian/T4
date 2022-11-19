from operator import itemgetter
from application import QueryContext
import random

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
        self.match_history = QueryContext.getMatchHistory(self.tournament_id)["data"][
            "Tournament"
        ][0]

        if round_num and not no_delete:
            self.round = int(round_num)
            success = self.deleteRoundsAtOrAfter(self.round)
            self.match_history = QueryContext.getMatchHistory(self.tournament_id)[
                "data"
            ]["Tournament"][0]

        elif rounds_completed := self.match_history["Rounds_aggregate"]["aggregate"][
            "max"
        ]["round_num"]:
            self.round = int(rounds_completed) + 1
        else:
            self.round = 1

        try:
            app.logger.debug("=" * 30)
            app.logger.debug("Generating Round {}...".format(self.round))
            app.logger.debug("=" * 30)
            self.players = self.match_history["Ladder"]
            app.logger.debug("  Player list:")
            [app.logger.debug(p) for p in self.players]
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

    def deleteRoundsAtOrAfter(self, this_round):
        """Delete any round with a higher round_num than this_round,
        including all matches and match_players."""

        app.logger.debug("deleting some shit here")
        self.to_delete = []

        for round in self.match_history["Rounds"]:
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
        [self.addPreviousOpponents(player) for player in self.unpaired_players]
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

        app.logger.debug("=" * 30)
        app.logger.debug("[+] Pairings")

        if self.bye:
            app.logger.debug("{} has the bye".format(self.bye["id"]))
        else:
            app.logger.debug("No bye.")

    def addPreviousOpponents(self, player):

        player["previous_opponents"] = []

        app.logger.debug("[+] Opponents of {}".format(player["id"]))

        for previous_opponent in player["Matches"]:
            player["previous_opponents"].append(
                previous_opponent["TournamentOpponent"]["id"]
            )

        [
            app.logger.debug("  - {}".format(opponent))
            for opponent in player["previous_opponents"]
        ]

        return player

    def matchmakePlayer(self, player, player_index):
        """Recurse through the pairings order until we find the first
        player this player hasn't played against before, then pair them."""

        if (
            self.players_in_pairing_order[player_index + 1]
            not in player["previous_opponents"]
        ):
            self.unpaired_players.remove(player)
            self.unpaired_players.remove(
                self.players_in_pairing_order[player_index + 1]
            )
            app.logger.debug(
                "{} playing {}".format(
                    player["id"], self.players_in_pairing_order[player_index + 1]
                )
            )
            return [player, self.players_in_pairing_order[player_index + 1]]
        elif len(self.players_in_pairing_order) == player_index + 1:
            return
        else:
            return self.matchmakePlayer(player, player_index + 1)

    def postPairings(self):
        """Create the next round, its matches, then post the players to them."""

        match_count = len(self.pairings)

        if self.bye:
            match_count += 1

        new_matches = QueryContext.createMatches(
            self.tournament_id, self.round, match_count
        )

        self.new_match_ids = [
            match["id"] for match in new_matches["data"]["insert_Match"]["returning"]
        ]
        self.new_match_ids.reverse()

        self.populated_match_ids = []

        for pair in self.pairings:
            match_id = self.new_match_ids.pop()
            success = QueryContext.createMatchPlayers(pair, match_id)
            if success:
                self.populated_match_ids.append(match_id)
            else:
                app.logger.info(
                    "Failed to assign players {} to match {}.".format(
                        (pair[0]["id"], pair[1]["id"]), match_id
                    )
                )

        if self.bye:
            bye_match_id = self.new_match_ids.pop()
            success = QueryContext.createMatchPlayers((self.bye, "bye"), bye_match_id)
            if success:
                self.populated_match_ids.append(bye_match_id)
            else:
                app.logger.info(
                    "Failed to assign player {} to match {}.".format(self.bye, match_id)
                )

        self.populated_match_ids = list(dict.fromkeys(self.populated_match_ids))

        return True
