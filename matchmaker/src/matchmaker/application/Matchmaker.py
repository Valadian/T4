from operator import itemgetter
from application import QueryContext
import random
import application.UpdateScores as UpdateScores
from time import time

from flask import current_app as app


class Matchmaker(UpdateScores.ScoreUpdater):
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
            # we occasionally need to include DQ'd/dropped players
            self.players_inc_dq = self.tournament_data["Ladder"]
            self.players = list(
                filter(lambda p: not p["disqualified"], self.players_inc_dq)
            )
        except KeyError as exc:
            app.logger.debug(
                "Aborting... found no players in the ladder for tournament {}.".format(
                    tournament_id
                )
            )
            app.logger.debug("Error: {}".format(exc))

            self.players = False
            self.pairings = False

            return False

        return True

    def deleteRoundsAtOrAfter(self, this_round):
        """Delete any round with a higher round_num than this_round,
        including all matches and match_players."""

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

        self.pairings = []
        self.bye = None

        [self.addPreviousOpponents(player) for player in self.players]
        self.unpaired_players = self.players

        self.scorer = UpdateScores.ScoreUpdater(
            self.tournament_id, tournament_data=self.tournament_data
        )

        self.players = list(
            filter(
                lambda p: not p["disqualified"],
                self.scorer.calculateScores(self.players_inc_dq),
            )
        )

        # Bye bye bye
        self.bye = self.assignBye()

        # Shuffle then sort on TP only to randomize within TP tiers
        random.shuffle(self.unpaired_players)
        self.players_in_pairing_order = sorted(
            self.unpaired_players, key=itemgetter("tournament_points"), reverse=True
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

        app.logger.debug("Number of pairings: " + str(len(self.pairings)))

    def addPreviousOpponents(self, player):

        # app.logger.debug("Adding previous opponents of {}".format(player['player_name']))

        player["previous_opponents"] = [
            (
                list(
                    filter(
                        lambda p: p["id"] == previous_match["TournamentOpponent"]["id"],
                        self.players,
                    )
                )[0]
            )
            for previous_match in player["Matches"]
            if previous_match["TournamentOpponent"] is not None
        ]

        return player

    def assignBye(self):
        """Calculate the bye, ensuring no repeats and avoiding drop/DQ"""

        if not len(self.players) % 2:
            self.bye = False

        players_reverse_ranked = self.scorer.rankPlayers(self.players)
        players_reverse_ranked.reverse()

        for player in players_reverse_ranked:
            [app.logger.debug(p["player_name"]) for p in player["previous_opponents"]]
            self.bye = player
            self.unpaired_players.remove(self.bye)
            return self.bye

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
        self.round_id, self.new_matches = QueryContext.createMatches(
            self.tournament_id, self.round, match_count
        )
        match_create_time = time() - start_time
        app.logger.debug("[*] Finished in {}sec".format(str(match_create_time)))

        self.new_match_ids = [
            match["id"]
            for match in self.new_matches["data"]["insert_Match"]["returning"]
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
