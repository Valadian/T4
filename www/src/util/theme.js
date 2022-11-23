
export default function setPreferredColorScheme(mode = "dark") {
    if(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches && mode === "light"){
        return
    }
    if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && mode === "dark"){
        return
    }
    console.log("changing")
    for (let stylesheet of document.styleSheets){
        // for (var i = document.styleSheets[i_stylesheet].rules.length - 1; i >= 0; i--) {
            
        for (let rule of stylesheet.rules) {
            let media = rule.media;
            if (media && media.mediaText.includes("prefers-color-scheme")) {
                console.log("includes color scheme")
                switch (mode) {
                    case "light":
                        console.log("light")
                        // media.appendMedium("original-prefers-color-scheme");
                        // if (media.mediaText.includes("light")) media.deleteMedium("(prefers-color-scheme: light)");
                        // if (media.mediaText.includes("dark")) media.deleteMedium("(prefers-color-scheme: dark)");                        
                        if (media.mediaText.includes("(prefers-color-scheme: dark)") && !media.mediaText.includes("original-prefers")) {
                            media.deleteMedium("(prefers-color-scheme: dark)");
                            media.appendMedium("(prefers-color-scheme: light)");
                            media.appendMedium("original-prefers-dark-color-scheme");
                        }
                        if (media.mediaText.includes("(prefers-color-scheme: light)") && !media.mediaText.includes("original-prefers")) {
                            media.deleteMedium("(prefers-color-scheme: light)");
                            media.appendMedium("(prefers-color-scheme: dark)");
                            media.appendMedium("original-prefers-light-color-scheme");
                        }
                        break;
                    case "dark":
                        console.log("dark")
                        // media.appendMedium("(prefers-color-scheme: light)");
                        // media.appendMedium("(prefers-color-scheme: dark)");
                        // if (media.mediaText.includes("original")) media.deleteMedium("original-prefers-color-scheme");
                        if (media.mediaText.includes("(prefers-color-scheme: light)") && !media.mediaText.includes("original-prefers")) {
                            media.deleteMedium("(prefers-color-scheme: light)");
                            media.appendMedium("(prefers-color-scheme: dark)");
                            media.appendMedium("original-prefers-light-color-scheme");
                        }
                        if (media.mediaText.includes("(prefers-color-scheme: dark)") && !media.mediaText.includes("original-prefers")) {
                            media.deleteMedium("(prefers-color-scheme: dark)");
                            media.appendMedium("(prefers-color-scheme: light)");
                            media.appendMedium("original-prefers-dark-color-scheme");
                        }
                        break;
                    default:
                        // console.log("default")
                        // media.appendMedium("(prefers-color-scheme: dark)");
                        // if (media.mediaText.includes("light")) media.deleteMedium("(prefers-color-scheme: light)");
                        // if (media.mediaText.includes("original")) media.deleteMedium("original-prefers-color-scheme");
                        if (media.mediaText.includes("original-prefers-dark-color-scheme")) {
                            media.deleteMedium("(prefers-color-scheme: light)");
                            media.appendMedium("(prefers-color-scheme: dark)");
                            media.deleteMedium("original-prefers-dark-color-scheme");
                        }
                        if (media.mediaText.includes("original-prefers-light-color-scheme")) {
                            media.deleteMedium("(prefers-color-scheme: dark)");
                            media.appendMedium("(prefers-color-scheme: light)");
                            media.deleteMedium("original-prefers-dark-color-scheme");
                        }
                }
                // break;
            }
        }
    }
  }