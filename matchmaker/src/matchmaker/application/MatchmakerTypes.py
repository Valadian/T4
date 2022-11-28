from dataclasses import dataclass, asdict
from typing import Optional, List
import json


@dataclass
class RequestMixin:
    @classmethod
    def from_request(cls, request):
        values = request.get("input")
        return cls(**values)

    def to_json(self):
        return json.dumps(asdict(self))


@dataclass
class NextRoundMatchesOutput(RequestMixin):
    match_ids: List[str]


@dataclass
class UpdateScoresOutput(RequestMixin):
    tournament_players: List[str]


@dataclass
class Mutation(RequestMixin):
    NextRoundMatches: Optional[NextRoundMatchesOutput]
    UpdateScores: Optional[UpdateScoresOutput]


@dataclass
class NextRoundMatchesArgs(RequestMixin):
    tournament_id: Optional[any]
    round_num: Optional[any]
    no_delete: Optional[bool]


@dataclass
class UpdateScoresArgs(RequestMixin):
    tournament_id: Optional[any]
    live: Optional[bool]