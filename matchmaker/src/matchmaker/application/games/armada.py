from operator import itemgetter
from application import QueryContext
from application.matchmaker import Matchmaker
from flask import current_app as app
import random


class Armada(Matchmaker):
    """Matchmaking class for Armada."""

    def __init__(self, tournament_id, round_num=False, no_delete=False):

        super().__init__(tournament_id, round_num, no_delete)
