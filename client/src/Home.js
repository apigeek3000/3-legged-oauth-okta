import './App.css';
import Axios from "axios";
import {Buffer} from 'buffer';

function App() {

  /**
   * Function to initiate the OAuth2 flow and call the API
   */
  async function initiateFlow() {
    try {
      console.log('initiateFlow()');

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

      // Get auth code
      const authCode = await getAuthCode(authUrl, redirectUrl);
      console.log(`authCode: ${authCode}`);

      // Use auth code, among other vars, to get the token now
      const tokenUrl = `https://${domain}/${oauthProxyPath}/token?client_id=${clientId}`;
      const tokenBody = new URLSearchParams({
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
        code: authCode
      });
      const tokenHeaders = {
        'Content-Type': "application/x-www-form-urlencoded",
        'Authorization': `Basic ${clientB64}`
      }
      const tokenResp = await Axios.post(tokenUrl, tokenBody, {headers: tokenHeaders});
      console.log(`tokenResp: ${JSON.stringify(tokenResp)}`);
      const tokenCode = tokenResp.data.access_token;
      console.log(`tokenCode: ${tokenCode}`);

      // Use token to call protected API
      const protectedUrl =  `https://${domain}/${oauthProxyPath}/protected`;
      const protectedHeaders = {
        'Authorization': `Bearer ${tokenCode}`
      }
      const protectedResp = await Axios.get(protectedUrl, {headers: protectedHeaders});
      console.log(`protectedResp: ${JSON.stringify(protectedResp)}`);
      const protectedMessage = protectedResp.data.response.message;
      console.log(`protectedMessage: ${protectedMessage}`);
      const protectedEmail = protectedResp.data.response.user.email;
      console.log(`protectedEmail: ${protectedEmail}`);
    } catch (err) {
      console.log(err);
      alert('Error authenticating');
    }
  }

  /**
   * Gets the authCode from an authUrl
   * @param {string} authUrl The auth url that we are opening a new tab with
   * @param {string} redirectUrl The redirect url where we should end up landing
   */
  async function getAuthCode(authUrl, redirectUrl) {
    // Open new window with authUrl
    const authWindow = window.open(authUrl, "_blank")// to open new page
    
    // Every second check if we have the code
    let authCode = await new Promise((resolve, reject) => {
      let loopCount = 0;
      const windowInterval = setInterval(async function () {
        // Get window url and see if we have redirected yet
        const authWindowUrl = authWindow.document.URL;
        if (authWindowUrl.startsWith(redirectUrl)) {
          // Redirect complete, get URL, close 
          // Regex = get between ?code= and &state=
          const code = authWindowUrl.match(/\?code=(.*)&state=/).pop();

          if (code) {
            // If redirect is complete and successful set code
            console.log(`code: ${code}`);
            authWindow.close();
            resolve(code);
            clearInterval(windowInterval);
          } else {
            reject("Error getting auth code. Code is missing or invalid");
          }
        }

        // If we have timed out
        if (loopCount > 29){
          authWindow.close();
          reject("Error getting auth code. Timed out without getting code");
        }
        loopCount += 1;
      }, 1000);
    });

    return authCode;
  }

  return (
    <div className="App">
      <header className="App-header">
        <p> Edit <code>src/App.js</code> and save to reload.</p>
        <p> Click the button below to call an initate the OAuth2 flow and call your Apigee API </p>
        <button type="button" onClick={(e) => {initiateFlow()}}>Engage</button>
      </header>
    </div>
  );
}

export default App;
