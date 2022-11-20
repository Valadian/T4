import {ptsToTp} from "./armada"
//sos == sos_tp

class TournamentRuleset {
    POINTS_NAME = "Points"
    POINTS_ACRONYM = "Pt"
    TPS_NAME = "Tournament Points"
    TPS_ACRONYM = "TP"
    CAN_DRAW = false
    TP_SCORING = (pts,o_pts,win,draw)=>0
    MOV_SCORING = (pts,o_pts,win,draw) => Math.max(0,pts - o_pts)
    WIN_SCORING = (pts,o_pts,win,draw) => null
    DRAW_SCORING = (pts,o_pts,win,draw) => null
    MOV_DATATYPE = "int"
    MAX_POINTS = 0
    MIN_TPS = 0
    MAX_TPS = 0
    BUY_POINTS = 0
    BUY_TPS = 0
    BUY_OPP_TPS = 0
    LADDER_COLS = [
        ["TP",['tournament_points']],
        ["MOV/SOS",['mov','sos']]
    ]
    CONCESSION_POINTS = 0
    LADDER_SORT = ['tournament_points', 'mov', 'sos']
    SWISS_PAIRING_ORDER = ['tournament_points'] 
}
//Todo: implement head to head sorting
let ArmadaStandardTournamentRuleset = new TournamentRuleset()
ArmadaStandardTournamentRuleset.TP_SCORING = (pts,o_pts,win) => ptsToTp(pts,o_pts,win)
ArmadaStandardTournamentRuleset.MOV_SCORING = (pts,o_pts,win,draw) => Math.min(400,Math.max(0,pts - o_pts))
ArmadaStandardTournamentRuleset.WIN_SCORING = (pts,o_pts) => pts>o_pts?true:(pts<o_pts?false:null)
ArmadaStandardTournamentRuleset.DRAW_SCORING = () => null
ArmadaStandardTournamentRuleset.MAX_POINTS = 400
ArmadaStandardTournamentRuleset.MIN_TPS = 1
ArmadaStandardTournamentRuleset.MAX_TPS = 10
ArmadaStandardTournamentRuleset.BUY_POINTS = 140
ArmadaStandardTournamentRuleset.BUY_TPS = 8
ArmadaStandardTournamentRuleset.BUY_OPP_TPS = 3
ArmadaStandardTournamentRuleset.CONCESSION_POINTS = 140

const sum = (arr) => arr.reduce((a, b) => a + b,0)
const avg = (arr) => arr.length===0?0:sum(arr)/arr.length

//battle_points = % of total points
let match_battle_points = (mp) => mp.points + mp.opp_points === 0 ? 0.5 : mp.points / (mp.points+mp.opp_points)
// let battle_points = (tp) => sum(tp.Matches.filter(m=>m.win!=null).map((m,i)=> m.points+tp.OpponentMatches[i]?.points===0?0.5:(m.points / (m.points+tp.OpponentMatches[i]?.points))))
// let battle_points = (tp,match_filter=()=>true) => sum(tp.Matches.filter(match_filter).filter(m=>m.win!=null).map((m)=> m.mov))
let mov = (tp,match_filter=()=>true) => avg(tp.Matches.filter(match_filter).filter(mp=>mp.win!=null).map(mp=>mp.mov))
let sos_mov = (tp,match_filter=()=>true) => avg(tp.Matches.filter(match_filter).filter(mp=>mp.win!=null).map(mp => avg(mp.TournamentOpponent.Matches.filter(match_filter).filter(mp=>mp.win!=null).map(mp => mp['mov']))))
let sos_sos = (tp,match_filter=()=>true) => avg(tp.Matches.filter(match_filter).filter(mp=>mp.win!=null).map(mp=>mp.TournamentOpponent.sos))
let LegionBattlePoints = new TournamentRuleset();
LegionBattlePoints.POINTS_NAME =  "Victory Points"
LegionBattlePoints.POINTS_ACRONYM = "VP"
LegionBattlePoints.TPS_NAME = "Tournament Points"
LegionBattlePoints.TPS_ACRONYM = "TP"
LegionBattlePoints.TP_SCORING = (pts,o_pts,win) => win?1:0 // ,Conceded:2,Tabled:3
LegionBattlePoints.MOV_SCORING = (pts,o_pts,win,draw) => (+pts+ +o_pts)>0?(+pts / (+pts + +o_pts)):0.5
LegionBattlePoints.WIN_SCORING = (pts,o_pts) => pts>o_pts?true:(pts<o_pts?false:null)
LegionBattlePoints.DRAW_SCORING = () => null
LegionBattlePoints.MOV_DATATYPE = "numeric"
LegionBattlePoints.MAX_POINTS = 10
LegionBattlePoints.MIN_TPS = 0
LegionBattlePoints.MAX_TPS = 1
LegionBattlePoints.BUY_POINTS = 1
LegionBattlePoints.BUY_TPS = 1
LegionBattlePoints.BUY_OPP_TPS = 0
LegionBattlePoints.CONCESSION_POINTS = 1
LegionBattlePoints.CUSTOM_MATCH_METRICS = {"mov":match_battle_points} //Override default concept of mov
LegionBattlePoints.CUSTOM_TOURNAMENT_METRICS = {"mov":mov, "emov":sos_mov, 'esos':sos_sos} //"mov":battle_points,
LegionBattlePoints.LADDER_SORT = ['tournament_points','mov','emov','sos','esos']
// LegionBattlePoints.LADDER_SORT = ['wins','mov'/*==battle_points*/,'sos_mov','sos','esos']
LegionBattlePoints.SWISS_PAIRING_ORDER = ['tournament_points'] 
LegionBattlePoints.LADDER_COLS = [
    ['MOV/eMOV',['mov','emov']],
    ['SOS/eSOS',['sos','esos']]
]

let XWingHotshot = new TournamentRuleset()
XWingHotshot.POINTS_NAME = "Mission Points"
XWingHotshot.POINTS_ACRONYM = "MP"
XWingHotshot.TPS_NAME = "Event Points"
XWingHotshot.TPS_ACRONYM = "EP"
XWingHotshot.CAN_DRAW = true
XWingHotshot.TP_SCORING = (pts,o_pts,win,draw) => win?3:(draw?1:0)
XWingHotshot.WIN_SCORING = (pts,o_pts) => pts>o_pts?true:(pts<o_pts?false:false)
XWingHotshot.DRAW_SCORING = (pts,o_pts) => pts===o_pts?true:false
XWingHotshot.MAX_POINTS = 20
XWingHotshot.MIN_TPS = 0
XWingHotshot.MAX_TPS = 3
XWingHotshot.BUY_POINTS = 18
XWingHotshot.BUY_TPS = 3
XWingHotshot.BUY_OPP_TPS = 0
XWingHotshot.CONCESSION_POINTS = 20
XWingHotshot.LADDER_SORT = ['tournament_points','sos','points']
XWingHotshot.SWISS_PAIRING_ORDER = ['tournament_points']

const getScoringConfig = (game, scoringRulesetName) =>{
    if(game==="STAR_WARS_ARMADA" && scoringRulesetName==="400pt Standard"){
        return ArmadaStandardTournamentRuleset
    }
    if(game==="STAR_WARS_ARMADA" && scoringRulesetName==="Star Wars Armada - 400pt Standard"){
        return ArmadaStandardTournamentRuleset
    }
    if(game==="STAR_WARS_LEGION" && scoringRulesetName==="800pt Battle Points"){
        return LegionBattlePoints
    }
    if(game==="STAR_WARS_XWING" && scoringRulesetName==="20pt Hotshot"){
        return XWingHotshot
    }
    return new TournamentRuleset()
}
export default getScoringConfig