import application.UpdateScores as UpdateScores
import application.Matchmaker as Matchmaker
from time import time

from .MatchmakerTypes import (
    NextRoundMatchesArgs,
    NextRoundMatchesOutput,
    UpdateScoresArgs,
    UpdateScoresOutput,
)

from application.QueryContext import getTournamentData
from flask import request, current_app as app


@app.route("/NextRoundMatches", methods=["POST"])
def NextRoundMatchesHandler():
    start = time()
    args = NextRoundMatchesArgs.from_request(request.get_json())
    app.logger.debug(args)
    game = str(
        getTournamentData(args.tournament_id)["data"]["Tournament"][0]["game"]
    ).upper()
    app.logger.debug(game)
    match game:
        case "STAR_WARS_ARMADA":
            mm = Matchmaker.Armada(args.tournament_id, args.round_num, args.no_delete)
        case "STAR_WARS_XWING":
            mm = Matchmaker.XWing(args.tournament_id, args.round_num, args.no_delete)
        case "STAR_WARS_LEGION":
            mm = Matchmaker.Legion(args.tournament_id, args.round_num, args.no_delete)

    # mm = Matchmaker(args.tournament_id, args.round_num, args.no_delete)
    mm.generatePairings()
    if not mm.pairings:
        return NextRoundMatchesOutput("Posted no pairings",[]).to_json()
    mm.postPairings()
    app.logger.debug("Generated round in {}".format(str(time() - start)))
    return NextRoundMatchesOutput(mm.round_id, mm.populated_match_ids).to_json()


@app.route("/UpdateScores", methods=["POST"])
def UpdateScoresHandler():
    start = time()
    args = UpdateScoresArgs.from_request(request.get_json())
    game = str(
        getTournamentData(args.tournament_id)["data"]["Tournament"][0]["game"]
    ).upper()
    app.logger.debug(game)
    match game:
        case "STAR_WARS_ARMADA":
            updater = UpdateScores.ArmadaScoreUpdater(args.tournament_id, args.live)
        case "STAR_WARS_XWING":
            updater = UpdateScores.XWingScoreUpdater(args.tournament_id, args.live)
        case "STAR_WARS_LEGION":
            updater = UpdateScores.LegionScoreUpdater(args.tournament_id, args.live)
    out = updater.scoreAndRankPlayers()
    app.logger.debug("Updated scores in {}".format(str(time() - start)))
    return UpdateScoresOutput(out).to_json()



@app.route("/")
def default():
    return """
        <html>
            <head>
                <title>Matchmaker</title>
            </head>
            <body>
                <h2>Matchmaker Interface</h2>
                <p>Documentation--such as it is--
                    <a href='https://github.com/sprintska/t4_matchmaker'>here</a>
                    .
                </p>
            </body>
        </html>"""
