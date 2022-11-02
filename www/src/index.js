import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-dark-5/dist/css/bootstrap-dark.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "./auth/Auth0Provider";

const root = ReactDOM.createRoot(document.getElementById('root'));
const injectGA = () => {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-SFHLRBRV9T');
}
root.render(
  <>
  {/* Google tag (gtag.js) */}
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SFHLRBRV9T"></script>
  <script>{injectGA()}</script>

  <Router>
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  </Router>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
