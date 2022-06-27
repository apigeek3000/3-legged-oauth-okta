import './App.css';
import Axios from "axios";
import {Buffer} from 'buffer';

function App() {

  // Function to initiate the OAuth2 flow and call the API
  async function callApi() {
    try {
    console.log('callAPI()');

    // Define important variables
    const scopes = "openid email profile"
    const domain = "34.149.67.152.nip.io";
    const oauthProxyPath = "v1/oauth20";
    const targetProxyPath = "pschello";

    // Define these vars based on if we are live
    let clientId = "";
    let clientSecret = "";
    let redirectUrl = "";
    
    // If local env
    // Else we are live
    if (process.env.NODE_ENV === "development") {
      // Get from app_secrets
      const clientVars = require("./app_secrets/clientVars.json");
      clientId = clientVars.clientId;
      clientSecret = clientVars.clientSecret;
      redirectUrl = clientVars.redirectUrl;
    } else {
      // Get client data from a secure storage location. Perhaps Secrets Manager
      // Set live oauth_redirect url
      // TODO
    }

    // Construct b64 version of clientId:clientSecret
    const clientB64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Intiate flow and redirect to Okta IDP
    const authUrl = `https://${domain}/${oauthProxyPath}/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUrl}`;
    console.log(`authUrl: ${authUrl}`);

    // Open new window with authUrl
    const authWindow = window.open(authUrl, "_blank")// to open new page
    
    // Every second check if we have the code
    let authCode;
    const windowInterval = setInterval(async function () {
      // Get window url and see if we have redirected yet
      const authWindowUrl = authWindow.document.URL;
      if (authWindowUrl.startsWith(redirectUrl)) {
        // Redirect complete, get URL, close window
        const code = authWindowUrl.match(/\?code\=(.*)\&state=/).pop();

        if (code) {
          // If redirect is complete and successful set code
          authCode = code;
        } else {
          throw("Error getting auth code");
        }
      }

      if (authCode) {
        console.log(`authCode: ${authCode}`);
        authWindow.close();
        clearInterval(windowInterval);
      }
    }, 1000);
    } catch (err) {
      console.log(err);
      alert('Error authenticating');
    }
  }

  async function getAuthCode() {
    try {

    } catch(e) {

    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p> Edit <code>src/App.js</code> and save to reload.</p>
        <p> Click the button below to call an initate the OAuth2 flow and call your Apigee API </p>
        <button type="button" onClick={(e) => {callApi()}}>Engage</button>
      </header>
    </div>
  );
}

export default App;
