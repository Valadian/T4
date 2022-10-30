from dataclasses import dataclass, asdict
from typing import Optional
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
    match_ids: list[str]


@dataclass
class Mutation(RequestMixin):
    NextRoundMatches: Optional[NextRoundMatchesOutput]


@dataclass
class NextRoundMatchesArgs(RequestMixin):
    tournament_id: Optional[any]
