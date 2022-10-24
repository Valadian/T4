const ptsToTp = (points, oppPts, win) => {
    var mov = points-oppPts
    var delta = Math.abs(points-oppPts)
    if (delta < 60) {
        return (mov>0||win)?6:5
    } else if (delta<140) {
        return (mov>0||win)?7:4
    } else if (delta<220) {
        return (mov>0||win)?8:3
    } else if (delta<300) {
        return (mov>0||win)?9:2
    } else {
        return (mov>0||win)?10:1
    }
}
export default ptsToTp