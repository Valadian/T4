import React, {useEffect} from "react";
import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import setPreferredColorScheme from "../util/theme"

const Layout = () => {
  //Detect and apply color scheme
  useEffect(() => {
    if(window.matchMedia && localStorage.getItem("theme")){
      if(localStorage.getItem("theme") === "dark" && window.matchMedia("(prefers-color-scheme: light)").matches){
        console.log("Overriding to Dark theme")
        setPreferredColorScheme("dark")
      }
      if(localStorage.getItem("theme") === "light" && window.matchMedia("(prefers-color-scheme: dark)").matches){
        console.log("Overriding to Light theme")
        setPreferredColorScheme("light")
      }
    }
  },[])
  
  return (
    <> 
      <Navbar />
      <div className="container">
        <br />
        <Outlet />
      </div>
      <footer className="footer">
        {/* <div className="footer-divider"></div> */}
        <hr />
        <div className="p-3 text-muted d-flex gap-3">
          <p className="me-auto">© 2022</p>
          <a href="mailto:admin@jesseberger.me" title="Email any questions you have"><h3><i className="bi bi-envelope"></i></h3></a>
          <a href="https://github.com/Valadian/T4/issues" title="Submit issues on Github"><h3><i className="bi bi-github"></i></h3></a>
          <a href="https://discord.gg/wKthGc4sgs" title="Join Armada TTS Discord"><h3><i className="bi bi-discord"></i></h3></a>
        </div>
      </footer>
    </>
  );
};

export default Layout;