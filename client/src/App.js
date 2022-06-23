import './App.css';

function App() {

  function callApi() {
    console.log('asdf');
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
