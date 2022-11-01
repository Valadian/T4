import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="btn btn-primary" onClick={() => loginWithRedirect()} title="Sign in">Login <i className="bi bi-box-arrow-in-right"></i></button>;
};

export default LoginButton;