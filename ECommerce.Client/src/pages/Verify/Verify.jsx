
import "./Verify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

function Verify() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError("Email bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
            return;
        }

        if (code.length !== 6) {
            setError("Doğrulama kodu 6 haneli olmalıdır.");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post("/Auth/verify", {
                email,
                code
            });

            const token = response.data.token;

            if (!token) {
                setError("Giriş tokenı alınamadı.");
                return;
            }

            // JWT token'ı kaydet
            localStorage.setItem("token", token);

            // JWT içindeki bilgileri oku
            const decodedToken = jwtDecode(token);

            console.log("JWT:", decodedToken);

            // ASP.NET Core Role claim'i
            const role =
                decodedToken[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];

            console.log("Kullanıcı rolü:", role);

            // Admin ise admin paneline gönder
            if (role === "Admin") {
                navigate("/admin");
                return;
            }

            // Normal kullanıcı
            navigate("/home");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Doğrulama kodu geçersiz."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="verify-page">

            <div className="verify-container">

                <div className="verify-icon">
                    ✉️
                </div>

                <h1>Email Doğrulama</h1>

                <p>
                    <strong>{email}</strong>
                    <br />
                    adresine gönderilen 6 haneli kodu giriniz.
                </p>

                <form onSubmit={handleVerify}>

                    <div className="form-group">

                        <label htmlFor="code">
                            Doğrulama Kodu
                        </label>

                        <input
                            id="code"
                            type="text"
                            maxLength="6"
                            placeholder="123456"
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value.replace(/\D/g, "")
                                )
                            }
                        />

                    </div>

                    {error && (
                        <div className="verify-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Doğrulanıyor..."
                            : "Doğrula ve Devam Et"}
                    </button>

                </form>

                <button
                    className="back-button"
                    type="button"
                    onClick={() => navigate("/")}
                >
                    Giriş sayfasına dön
                </button>

            </div>

        </div>
    );
}

export default Verify;
