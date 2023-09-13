import logo from './logo.png';
import './App.css';
import DownloadButton from './DownloadButton';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Download Your DYOR extension build folder</h1>
        <DownloadButton />

      </header>
    </div>
  );
}

export default App;
