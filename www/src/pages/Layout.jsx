import React from "react";
import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
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