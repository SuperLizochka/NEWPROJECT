import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";

axios.defaults.headers.common["Content-Type"] = "application/json";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
