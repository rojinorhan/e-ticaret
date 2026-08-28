
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError("Email adresinizi giriniz.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/Auth/forgot-password", {
                email
            });

            console.log(response.data);

            // Şifre sıfırlama kodu email'e gönderildi.
            // Email bilgisini ResetPassword sayfasına aktarıyoruz.
            navigate("/reset-password", {
                state: { email }
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "İşlem sırasında bir hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-container">

                <div className="forgot-brand">
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <div className="forgot-icon">
                    🔐
                </div>

                <h1>Şifreni mi Unuttun?</h1>

                <p className="forgot-description">
                    Hesabınıza kayıtlı email adresinizi girin.
                    Size şifre sıfırlama kodu göndereceğiz.
                </p>

                <form
                    className="forgot-form"
                    onSubmit={handleForgotPassword}
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            E-posta
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    {error && (
                        <div className="forgot-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="forgot-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Gönderiliyor..."
                            : "Sıfırlama Kodu Gönder"}
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

export default ForgotPassword;
