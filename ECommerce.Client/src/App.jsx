
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Verify from "./pages/Verify/Verify";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Giriş */}
                <Route path="/" element={<Login />} />

                {/* Kayıt */}
                <Route path="/register" element={<Register />} />

                {/* Email doğrulama */}
                <Route path="/verify" element={<Verify />} />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
