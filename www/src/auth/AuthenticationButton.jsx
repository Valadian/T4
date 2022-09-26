import React from "react";

import { Link } from "react-router-dom";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

import { useAuth0 } from "@auth0/auth0-react";

const AuthenticationButton = () => {
  const { user  } = useAuth0();

  return user ? <>
    <Link to="/profile" title="profile">
    <img
        src={user.picture}
        alt="Profile"
        className="profile-pic rounded-circle img-fluid profile-picture mb-3 mb-md-0"
        width="50px"
        height="50px"
        />
    </Link>
    </> : <LoginButton />;
};

export default AuthenticationButton;