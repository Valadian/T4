import setPreferredColorScheme from "../../util/theme"

function DarkModeButton(props) {
    return <button className="btn btn-dark" onClick={() => {localStorage.setItem('theme', 'dark');setPreferredColorScheme("dark")}} title="Dark Mode"><i className="bi bi-moon-stars-fill"></i> {props?.title}</button>
}
function LightModeButton(props) {
    return <button className="btn btn-light" onClick={() => {localStorage.setItem('theme', 'light');setPreferredColorScheme("light")}} title="Light Mode"><i className="bi bi-brightness-high-fill"></i> {props?.title}</button>
}

function DarkLightToggle() {
    return (<>
        <DarkModeButton />
        <LightModeButton />
    </>)
}
export {DarkModeButton, LightModeButton, DarkLightToggle}