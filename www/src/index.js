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
import {Helmet} from "react-helmet";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
  <Helmet>
    {/* Global site tag (gtag.js) - Google Analytics  */}
    <script async src='https://www.googletagmanager.com/gtag/js?id=G-SFHLRBRV9T'></script>
    <script>
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SFHLRBRV9T');
      `}
    </script>
    <meta property="og:title" content="TableTop Tournament Tools (T4)" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://t4.tools" />
    <meta property="og:image" content="https://t4.tools/favicon.ico" />
    <meta property="og:description" content="Toolset for managing Tabletop Tournament Games" />
    <meta name="twitter:title" content="TableTop Tournament Tools (T4) " />
    <meta name="twitter:description" content="Toolset for managing Tabletop Tournament Games" />
    <meta name="twitter:image" content="https://t4.tools/favicon.ico" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#222222" />
  </Helmet>

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
