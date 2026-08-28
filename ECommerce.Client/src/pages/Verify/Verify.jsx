
import "./Verify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

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

        if (!code) {
            setError("Doğrulama kodunu giriniz.");
            return;
        }

        if (code.length !== 6) {
            setError("Doğrulama kodu 6 haneli olmalıdır.");
            return;
        }

        if (!email) {
            setError("Email bilgisi bulunamadı.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/Auth/verify", {
                email,
                code
            });

            console.log(response.data);

            const token = response.data.token;

            if (!token) {
                setError("Token alınamadı.");
                return;
            }

            // JWT token'ı kaydet
            localStorage.setItem("token", token);

            // Ana sayfaya git
            navigate("/");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Doğrulama kodu geçersiz veya süresi dolmuş."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">

            <div className="verify-container">

                <div className="verify-brand">
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <div className="verify-icon">
                    ✉️
                </div>

                <h1>Email Adresini Doğrula</h1>

                <p className="verify-description">
                    Email adresinize gönderdiğimiz 6 haneli
                    doğrulama kodunu aşağıya giriniz.
                </p>

                {email && (
                    <div className="verify-email">
                        {email}
                    </div>
                )}

                <form
                    className="verify-form"
                    onSubmit={handleVerify}
                >

                    <div className="form-group">

                        <label htmlFor="code">
                            Doğrulama Kodu
                        </label>

                        <input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
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
                        className="verify-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Doğrulanıyor..."
                            : "Email'i Doğrula"}
                    </button>

                </form>

                <button
                    type="button"
                    className="back-login"
                    onClick={() => navigate("/")}
                >
                    ← Giriş sayfasına dön
                </button>

            </div>

        </div>
    );
}

export default Verify;
