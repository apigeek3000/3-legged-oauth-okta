import './App.css';
import Axios from "axios";
import {Buffer} from 'buffer';

function App() {

  // Function to initiate the OAuth2 flow and call the API
  async function callApi() {
    try {
    console.log('callAPI()');

    // Define important variables
    const clientId = "xkey-1655495353";
    const scopes = "openid email profile"
    const redirectUrl = "https://ps-northam-apigeex-demo-vccdevportal.apigee.io/oauth_redirect"; // What's in Apigee App Redirect
    const domain = "34.149.67.152.nip.io";
    const oauthProxyPath = "v1/oauth20";
    const targetProxyPath = "pschello";

    // Get client secret
    let clientSecret = "";
    // If local env
    // Else we are live
    if (process.env.NODE_ENV === "development") {
      // Get from app_secrets
      const clientVars = require("./app_secrets/clientVars.json");
      clientSecret = clientVars.clientSecret;
    } else {
      // Get from a secure storage location. Perhaps Secrets Manager
      // TODO
    }

    // Construct b64 version of clientId:clientSecret
    const clientB64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Intiate flow and redirect to Okta IDP
    const authUrl = `https://${domain}/${oauthProxyPath}/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUrl}`;
    alert(`authUrl: ${authUrl}`);

    // Open new window with authUrl

    // It will eventually redirect to redirectUrl
    } catch (err) {
      console.log(err);
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
