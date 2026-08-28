import "./Register.css";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useState } from "react";
function Register() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/Auth/register", {
                firstName,
                lastName,
                email,
                password
            });

            console.log(response.data);

            navigate("/verify", {
                state: { email }
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Kayıt sırasında bir hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">

                <div className="register-left">

                    <div className="register-brand">
                        <span>🛒</span>
                        <strong>E-Commerce</strong>
                    </div>

                    <div className="register-content">
                        <h1>Hesap Oluştur</h1>

                        <p className="register-description">
                            E-Commerce ailesine katılın ve alışverişin
                            keyfini çıkarmaya başlayın.
                        </p>

                        <form className="register-form" 
                              onSubmit={handleRegister}>

                            <div className="name-row">

                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        Ad
                                    </label>

                                    <input
                                        id="firstName"
                                        type="text"
                                        placeholder="Adınız"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">
                                        Soyad
                                    </label>

                                    <input
                                        id="lastName"
                                        type="text"
                                        placeholder="Soyadınız"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>

                            </div>

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
                                <label htmlFor="password">
                                    Şifre
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    Şifre Tekrar
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div className="register-error">
                                    {error}
                                </div>
                            )}
                          
                            <button
                                type="submit"
                                className="register-button"
                                disabled={loading}
                            >
                                {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                            </button>

                        </form>

                        <div className="login-link">
                            Zaten hesabınız var mı?

                            <button
                                type="button"
                                onClick={() => navigate("/")}
                            >
                                Giriş Yap
                            </button>
                        </div>

                    </div>
                </div>

                <div className="register-right">

                    <div className="register-decoration">

                        <div className="decoration-circle circle-top"></div>
                        <div className="decoration-circle circle-bottom"></div>

                        <div className="register-icon">
                            ✨
                        </div>

                        <h2>
                            Alışverişe
                            <br />
                            hemen başla.
                        </h2>

                        <p>
                            Kendi hesabınızı oluşturun,
                            favori ürünlerinizi keşfedin ve
                            alışveriş deneyiminizi kişiselleştirin.
                        </p>

                        <div className="benefits">

                            <div className="benefit">
                                <span>✓</span>
                                Güvenli alışveriş
                            </div>

                            <div className="benefit">
                                <span>✓</span>
                                Kişisel hesabınız
                            </div>

                            <div className="benefit">
                                <span>✓</span>
                                Sipariş takibi
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Register;