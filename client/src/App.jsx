import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = location.pathname === "/login" || location.pathname === "/register";
  const showPublicLayout = !isAdmin && !isAuth;

  return (
    <>
      <AuthProvider>
        <ToastContainer />
        {showPublicLayout && <Header />}
        <AppRoutes />
        {showPublicLayout && <Footer />}
      </AuthProvider>
    </>
  );
}

export default App;
