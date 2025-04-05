import React from "react";
// import Stream from "./components/ScreenStreamer";
// import Stream from "./components/LiveStream";
// import Stream from "./components/WebRtc";
// import Stream from "./components/SinglePeerREST";
// import Stream from "./components/NodeRelay";
// import Stream from "./components/MediaSoup";
import Stream from "./components/StreamChunkWS";

function App() {
  return (
      <div className="App">
        <Stream />
      </div>
  );
}

export default App;