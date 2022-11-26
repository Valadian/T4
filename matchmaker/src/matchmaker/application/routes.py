from .NextRoundMatchesTypes import NextRoundMatchesArgs, NextRoundMatchesOutput
from .matchmaker import Matchmaker
from application.QueryContext import getTournamentData
from flask import request, current_app as app


@app.route("/NextRoundMatches", methods=["POST"])
def NextRoundMatchesHandler():
    args = NextRoundMatchesArgs.from_request(request.get_json())
    app.logger.debug(args)
    game = str(
        getTournamentData(args.tournament_id)["data"]["Tournament"][0]["game"]
    ).upper()
    app.logger.debug(game)
    match game:
        case "STAR_WARS_ARMADA":
            mm = Matchmaker(args.tournament_id, args.round_num, args.no_delete)
        case "XWING_MINIA":
            print(4)
        case "LEGION":
            print(5)

    mm = Matchmaker(args.tournament_id, args.round_num, args.no_delete)
    mm.generatePairings()
    if not mm.pairings:
        return NextRoundMatchesOutput(0).to_json()
    mm.postPairings()
    return NextRoundMatchesOutput(mm.populated_match_ids).to_json()


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
