from operator import itemgetter
from .QueryContext import createMatches, createMatchPlayer, getMatchHistory
import random

from flask import current_app as app


class Matchmaker:
    def __init__(self, tournament_id):

        self.tournament_id = tournament_id
        self.match_history = getMatchHistory(self.tournament_id)

        rounds_completed = [
            match["Round"]["round_num"] for match in self.match_history["data"]["Match"]
        ]
        self.round = int(max(rounds_completed)) + 1 if rounds_completed else 1

        try:
            self.players = self.match_history["data"]["Tournament"][0]["Ladder"]
            app.logger.debug("  Player list: ")
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

    def generatePairings(self):

        # Fail gracefully if the tournament ladder is empty
        if not self.players:
            return False

        # Rank players to find last place for the bye
        players_ranked = sorted(
            self.players,
            key=itemgetter("tournament_points", "mov", "sos"),
            reverse=True,
        )

        self.bye = players_ranked[-1] if len(players_ranked) % 2 else None
        not self.bye or self.unpaired_players.remove(self.bye)

        # Break the equal-tp players out into lists to shuffle then re-concat them
        players_by_tp = {}

        for player in self.unpaired_players:
            player = self.addPreviousOpponents(player)
            players_by_tp.setdefault(player["tournament_points"], []).append(player)

        players_by_tp = dict(sorted(players_by_tp.items(), reverse=True))
        self.players_in_pairing_order = []

        # Shuffle and concat
        for tp_tier in players_by_tp:
            random.shuffle(players_by_tp[tp_tier])
            self.players_in_pairing_order.extend(players_by_tp[tp_tier])

        # iterate through the micro-shuffled list and generate pairings
        for p_idx, player in enumerate(self.players_in_pairing_order):

            if player in self.unpaired_players:
                self.pairings.append(self.matchmakePlayer(player, p_idx))

        if self.bye:
            app.logger.debug("{} has the bye".format(self.bye["user_id"]))
        else:
            app.logger.debug("No bye.")

    def addPreviousOpponents(self, player):

        player["previous_opponents"] = []

        matches = self.match_history["data"]["Match"]

        for match in matches:
            if player["user_id"] in [
                match_player["user_id"] for match_player in match["Players"]
            ]:
                for match_player in match["Players"]:
                    match_player["user_id"] == player["user_id"] or player[
                        "previous_opponents"
                    ].append(match_player["user_id"])

        return player

    def matchmakePlayer(self, player, player_index):
        """Recurse through the pairings order until we find the first player
        this player hasn't played against before, then pair them."""

        if (len(self.players_in_pairing_order) == player_index + 1) or (
            self.players_in_pairing_order[player_index + 1]
            not in player["previous_opponents"]
        ):
            self.unpaired_players.remove(player)
            self.unpaired_players.remove(
                self.players_in_pairing_order[player_index + 1]
            )
            app.logger.debug(
                "{} playing {}".format(
                    player["user_id"], self.players_in_pairing_order[player_index + 1]
                )
            )
            return [player, self.players_in_pairing_order[player_index + 1]]
        else:
            return self.matchmakePlayer(player, player_index + 1)

    def postPairings(self):
        """Create the next round's matches, then post the players to them."""

        match_count = len(self.pairings)

        if self.bye:
            match_count += 1

        new_matches = createMatches(self.tournament_id, self.round, match_count)

        self.new_match_ids = [
            match["id"] for match in new_matches["data"]["insert_Match"]["returning"]
        ]
        self.new_match_ids.reverse()

        self.populated_match_ids = []

        for pair in self.pairings:
            match_id = self.new_match_ids.pop()
            for player in pair:
                success = createMatchPlayer(player["user_id"], match_id)
                if success:
                    self.populated_match_ids.append(match_id)
                else:
                    app.logger.info(
                        "Failed to assign player {} to match {}.".format(
                            player, match_id
                        )
                    )
                    

        if self.bye:
            bye_match_id = self.new_match_ids.pop()
            success = createMatchPlayer(self.bye["user_id"], bye_match_id)
            if success:
                self.populated_match_ids.append(bye_match_id)
            else:
                app.logger.info(
                    "Failed to assign player {} to match {}.".format(self.bye, match_id)
                )

        self.populated_match_ids = list(dict.fromkeys(self.populated_match_ids))

        return True
