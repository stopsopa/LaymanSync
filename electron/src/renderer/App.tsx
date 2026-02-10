import "./App.css";
import Footer from "./components/Footer";
import NewComponent from "./components/NewComponent";

function App() {
  return (
    <div className="app-container">
      {/* Main Viewport */}
      <div className="tab-viewport">
        <NewComponent />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
