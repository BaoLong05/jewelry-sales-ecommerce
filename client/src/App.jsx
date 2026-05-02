import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/common/Header";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AuthProvider>
        <ToastContainer />
        <Header /> 
        <AppRoutes />
      </AuthProvider>
    </>
  );
}

export default App;
