
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Email ve şifre alanları zorunludur.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/Auth/login", {
                email,
                password
            });

            console.log(response.data);

            // Login başarılı.
            // Backend email adresine doğrulama kodu gönderiyor.
            navigate("/verify", {
                state: { email }
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Giriş sırasında bir hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <div className="login-left">

                    <div className="brand">
                        <span className="brand-icon">🛒</span>
                        <span>E-Commerce</span>
                    </div>

                    <div className="login-welcome">
                        <h1>Hoş Geldiniz</h1>

                        <p>
                            Hesabınıza giriş yaparak alışverişe devam edin.
                        </p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
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
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Şifre
                                </label>

                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Şifremi Unuttum?
                                </button>

                            </div>

                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Giriş yapılıyor..."
                                : "Giriş Yap"}
                        </button>

                    </form>

                    <div className="register-link">
                        Hesabınız yok mu?

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                </div>

                <div className="login-right">

                    <div className="login-decoration">

                        <div className="circle circle-one"></div>
                        <div className="circle circle-two"></div>

                        <div className="shopping-card">
                            <span>🛍️</span>
                        </div>

                        <h2>
                            Alışverişin
                            <br />
                            yeni adresi.
                        </h2>

                        <p>
                            Aradığınız ürünleri keşfedin,
                            sepetinizi oluşturun ve kolayca
                            sipariş verin.
                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Login;
