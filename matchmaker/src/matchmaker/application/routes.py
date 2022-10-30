from .NextRoundMatchesTypes import NextRoundMatchesArgs, NextRoundMatchesOutput
from .matchmaker import Matchmaker
from flask import request, current_app as app


@app.route("/NextRoundMatches", methods=["POST"])
def NextRoundMatchesHandler():
    args = NextRoundMatchesArgs.from_request(request.get_json())
    mm = Matchmaker(args.tournament_id)
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
