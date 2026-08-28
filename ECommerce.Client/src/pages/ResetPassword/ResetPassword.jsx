
import "./ResetPassword.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email] = useState(location.state?.email || "");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError("Email adresi bulunamadı.");
            return;
        }

        if (!code) {
            setError("Doğrulama kodunu giriniz.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/Auth/reset-password",
                {
                    email,
                    code,
                    newPassword
                }
            );

            console.log(response.data);

            alert("Şifreniz başarıyla değiştirildi.");

            navigate("/");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Şifre sıfırlama sırasında bir hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-page">

            <div className="reset-container">

                <div className="reset-brand">
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <div className="reset-icon">
                    🔑
                </div>

                <h1>Yeni Şifre Oluştur</h1>

                <p className="reset-description">
                    Email adresinize gönderilen doğrulama kodunu
                    ve yeni şifrenizi girin.
                </p>

                {email && (
                    <div className="reset-email">
                        {email}
                    </div>
                )}

                <form
                    className="reset-form"
                    onSubmit={handleResetPassword}
                >

                    <div className="form-group">

                        <label htmlFor="code">
                            Doğrulama Kodu
                        </label>

                        <input
                            id="code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) =>
                                setCode(e.target.value)
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="newPassword">
                            Yeni Şifre
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Yeni Şifre Tekrar
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />

                    </div>

                    {error && (
                        <div className="reset-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="reset-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Şifre değiştiriliyor..."
                            : "Şifreyi Değiştir"}
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

export default ResetPassword;
