export default function TournamentColoredText(props){
    let min = props.min ?? 0
    let max = props.max ?? 10
    let scalar = Math.min(1,Math.max(0,(props.value-min)/(max-min)))
    // let r = Math.floor(Math.min(1,2*(1-scalar))*255)
    // let g = Math.floor(Math.min(1,2*scalar)*255)
    let brightness = 0.6
    if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem("theme")==="dark") {
        // dark mode
        brightness = 1.0
    }
    let r = Math.floor(Math.min(brightness,2*(1-scalar))*255)
    let g = Math.floor(Math.min(brightness,2*scalar)*255)
    return <span style={{color: "rgb("+r+","+g+",0)"}}><b>{props.value}</b></span>
}