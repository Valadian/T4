
function resetSchemes(){
    for (let stylesheet of document.styleSheets){
        for (let rule of stylesheet.rules) {
            let media = rule.media;
            if (media && media.mediaText.includes("prefers-color-scheme")) {
                if (media.mediaText.includes("original-prefers-dark-color-scheme")) {
                    media.deleteMedium("(prefers-color-scheme: light)");
                    media.appendMedium("(prefers-color-scheme: dark)");
                    media.deleteMedium("original-prefers-dark-color-scheme");
                }
                if (media.mediaText.includes("original-prefers-light-color-scheme")) {
                    media.deleteMedium("(prefers-color-scheme: dark)");
                    media.appendMedium("(prefers-color-scheme: light)");
                    media.deleteMedium("original-prefers-light-color-scheme");
                }
            }
        }
    }
}
function reverseSchemes(){
    for (let stylesheet of document.styleSheets){
        for (let rule of stylesheet.rules) {
            let media = rule.media;
            if (media && media.mediaText.includes("prefers-color-scheme") && !media.mediaText.includes("original-prefers")) {
                if (media.mediaText.includes("(prefers-color-scheme: dark)")) {
                    media.deleteMedium("(prefers-color-scheme: dark)");
                    media.appendMedium("(prefers-color-scheme: light)");
                    media.appendMedium("original-prefers-dark-color-scheme");
                } else if (media.mediaText.includes("(prefers-color-scheme: light)")) {
                    media.deleteMedium("(prefers-color-scheme: light)");
                    media.appendMedium("(prefers-color-scheme: dark)");
                    media.appendMedium("original-prefers-light-color-scheme");
                }
            }
        }
    }
}
export default function setPreferredColorScheme(mode = "dark") {
    console.log("setPreferredColorScheme: "+mode)
    let resetToLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches && mode === "light"
    let resetToDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && mode === "dark"
    if(mode === null || resetToLight || resetToDark){
        localStorage.setItem('theme',null)
        resetSchemes()
    } else {
        localStorage.setItem('theme',mode)
        // console.log("changing")
        reverseSchemes()
    }
}