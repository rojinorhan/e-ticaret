import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Profile() {
const navigate = useNavigate();

const [profile, setProfile] = useState(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [changingPassword, setChangingPassword] = useState(false);

const [showPasswordForm, setShowPasswordForm] = useState(false);

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");




const getProfile = async () => {

    try {

        setLoading(true);

        const response = await api.get("/Profile");

        setProfile(response.data);

        setFirstName(response.data.firstName || "");
        setLastName(response.data.lastName || "");

    } catch (error) {

        console.error("Profil yükleme hatası:", error);

        if (error.response?.status === 401) {

            localStorage.removeItem("token");

            await Swal.fire({
                icon: "warning",
                title: "Oturum Gerekli",
                text: "Profilinizi görmek için giriş yapmanız gerekiyor.",
                confirmButtonText: "Giriş Yap",
                confirmButtonColor: "#4f46e5"
            });

            navigate("/");
            return;
        }

        Swal.fire({
            icon: "error",
            title: "Profil Yüklenemedi",
            text:
                error.response?.data?.message ||
                "Profil bilgileri alınırken bir hata oluştu.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

    } finally {

        setLoading(false);

    }
};


useEffect(() => {

    getProfile();

}, []);




const handleUpdateProfile = async (e) => {

    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {

        Swal.fire({
            icon: "warning",
            title: "Eksik Bilgi",
            text: "Ad ve soyad alanları boş bırakılamaz.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

        return;
    }


    try {

        setSaving(true);

        const response = await api.put(
            "/Profile",
            {
                firstName: firstName.trim(),
                lastName: lastName.trim()
            }
        );

        setProfile(response.data);

        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);

        await Swal.fire({
            icon: "success",
            title: "Bilgiler Güncellendi",
            text: "Profil bilgileriniz başarıyla güncellendi.",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {

        console.error(
            "Profil güncelleme hatası:",
            error
        );

        if (error.response?.status === 401) {

            localStorage.removeItem("token");

            await Swal.fire({
                icon: "warning",
                title: "Oturum Gerekli",
                text: "Bu işlemi yapmak için giriş yapmanız gerekiyor.",
                confirmButtonText: "Giriş Yap",
                confirmButtonColor: "#4f46e5"
            });

            navigate("/");
            return;
        }

        Swal.fire({
            icon: "error",
            title: "Güncelleme Başarısız",
            text:
                error.response?.data?.message ||
                "Profil bilgileriniz güncellenemedi.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

    } finally {

        setSaving(false);

    }
};

const handleChangePassword = async (e) => {

    e.preventDefault();


    if (!currentPassword || !newPassword || !confirmPassword) {

        Swal.fire({
            icon: "warning",
            title: "Eksik Bilgi",
            text: "Tüm şifre alanlarını doldurmalısınız.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

        return;
    }


    if (newPassword.length < 6) {

        Swal.fire({
            icon: "warning",
            title: "Geçersiz Şifre",
            text: "Yeni şifre en az 6 karakter olmalıdır.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

        return;
    }


    if (newPassword !== confirmPassword) {

        Swal.fire({
            icon: "warning",
            title: "Şifreler Eşleşmiyor",
            text: "Yeni şifre ve şifre tekrarı aynı olmalıdır.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

        return;
    }


    try {

        setChangingPassword(true);

        await api.put(
            "/Profile/password",
            {
                currentPassword,
                newPassword,
                confirmPassword
            }
        );


        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowPasswordForm(false);


        await Swal.fire({
            icon: "success",
            title: "Şifre Değiştirildi",
            text: "Şifreniz başarıyla değiştirildi.",
            timer: 1800,
            showConfirmButton: false
        });

    } catch (error) {

        console.error(
            "Şifre değiştirme hatası:",
            error
        );


        if (error.response?.status === 401) {

            Swal.fire({
                icon: "error",
                title: "Mevcut Şifre Hatalı",
                text:
                    error.response?.data?.message ||
                    "Mevcut şifrenizi doğru girdiğinizden emin olun.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }


        Swal.fire({
            icon: "error",
            title: "Şifre Değiştirilemedi",
            text:
                error.response?.data?.message ||
                "Şifreniz değiştirilirken bir hata oluştu.",
            confirmButtonText: "Tamam",
            confirmButtonColor: "#4f46e5"
        });

    } finally {

        setChangingPassword(false);

    }
};



const handleLogout = async () => {

    const result = await Swal.fire({
        icon: "question",
        title: "Çıkış yapmak istiyor musunuz?",
        text: "Oturumunuz sonlandırılacak.",
        showCancelButton: true,
        confirmButtonText: "Evet, Çıkış Yap",
        cancelButtonText: "Vazgeç",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b"
    });


    if (!result.isConfirmed) {
        return;
    }


    localStorage.removeItem("token");

    navigate("/");
};


if (loading) {

    return (
        <div className="profile-page">

            <div className="profile-loading">

                <div className="profile-spinner"></div>

                <p>
                    Profiliniz yükleniyor...
                </p>

            </div>

        </div>
    );

}


if (!profile) {
    return null;
}



return (

    <div className="profile-page">


        {/* HEADER */}

        <header className="profile-header">

            <div
                className="profile-logo"
                onClick={() => navigate("/home")}
            >

                <span>🛒</span>

                <strong>
                    E-Commerce
                </strong>

            </div>


            <nav className="profile-nav">

                <button
                    onClick={() => navigate("/home")}
                >
                    Ana Sayfa
                </button>

                <button
                    onClick={() => navigate("/products")}
                >
                    Ürünler
                </button>

                <button
                    onClick={() => navigate("/orders")}
                >
                    Siparişlerim
                </button>

                <button
                    onClick={() => navigate("/cart")}
                >
                    🛒 Sepet
                </button>

                <button className="active">
                    👤 Profilim
                </button>

            </nav>

        </header>


        {/* CONTENT */}

        <main className="profile-container">


            {/* PROFILE TITLE */}

            <div className="profile-title">

                <span>
                    HESABIM
                </span>

                <h1>
                    Profilim
                </h1>

                <p>
                    Kişisel bilgilerinizi ve hesap güvenliğinizi buradan yönetebilirsiniz.
                </p>

            </div>


            {/* PROFILE CARD */}

            <section className="profile-card">


                {/* USER HEADER */}

                <div className="profile-user">

                    <div className="profile-avatar">

                        {profile.firstName?.charAt(0)}
                        {profile.lastName?.charAt(0)}

                    </div>


                    <div>

                        <h2>
                            {profile.firstName} {profile.lastName}
                        </h2>

                        <p>
                            {profile.email}
                        </p>

                    </div>

                </div>


                <div className="profile-divider"></div>


                {/* PERSONAL INFORMATION */}

                <div className="profile-section">

                    <div className="profile-section-title">

                        <div className="section-icon">
                            👤
                        </div>

                        <div>

                            <h3>
                                Kişisel Bilgiler
                            </h3>

                            <p>
                                Hesabınızdaki kişisel bilgileri güncelleyin.
                            </p>

                        </div>

                    </div>


                    <form
                        className="profile-form"
                        onSubmit={handleUpdateProfile}
                    >

                        <div className="profile-form-row">

                            <div className="profile-form-group">

                                <label>
                                    Ad
                                </label>

                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    placeholder="Adınız"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Soyad
                                </label>

                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    placeholder="Soyadınız"
                                />

                            </div>

                        </div>


                        <div className="profile-form-group">

                            <label>
                                E-posta
                            </label>

                            <input
                                type="email"
                                value={profile.email}
                                disabled
                            />

                            <small>
                                E-posta adresi güvenlik nedeniyle değiştirilemez.
                            </small>

                        </div>


                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Güncelleniyor..."
                                : "✓ Bilgileri Güncelle"
                            }

                        </button>

                    </form>

                </div>


                <div className="profile-divider"></div>


                {/* PASSWORD */}

                <div className="profile-section">

                    <div className="profile-section-title">

                        <div className="section-icon">
                            🔐
                        </div>

                        <div>

                            <h3>
                                Hesap Güvenliği
                            </h3>

                            <p>
                                Hesabınızın güvenliği için şifrenizi güncel tutun.
                            </p>

                        </div>

                    </div>


                    {!showPasswordForm ? (

                        <button
                            className="password-toggle-button"
                            onClick={() =>
                                setShowPasswordForm(true)
                            }
                        >
                            🔑 Şifre Değiştir
                        </button>

                    ) : (

                        <form
                            className="password-form"
                            onSubmit={handleChangePassword}
                        >

                            <div className="profile-form-group">

                                <label>
                                    Mevcut Şifre
                                </label>

                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Mevcut şifreniz"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Yeni Şifre
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="En az 6 karakter"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Yeni Şifre Tekrar
                                </label>

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Yeni şifrenizi tekrar girin"
                                />

                            </div>


                            <div className="password-actions">

                                <button
                                    type="button"
                                    className="password-cancel-button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}
                                >
                                    Vazgeç
                                </button>


                                <button
                                    type="submit"
                                    className="password-save-button"
                                    disabled={changingPassword}
                                >
                                    {changingPassword
                                        ? "Değiştiriliyor..."
                                        : "Şifreyi Güncelle"
                                    }
                                </button>

                            </div>

                        </form>

                    )}

                </div>


                <div className="profile-divider"></div>


                {/* ACCOUNT INFO */}

                <div className="profile-account-info">

                    <div>

                        <span>
                            Hesap Rolü
                        </span>

                        <strong>
                            {profile.role}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Üyelik Tarihi
                        </span>

                        <strong>
                            {new Date(
                                profile.createdAt
                            ).toLocaleDateString("tr-TR")}
                        </strong>

                    </div>

                </div>


                {/* LOGOUT */}

                <button
                    className="profile-logout-button"
                    onClick={handleLogout}
                >
                    🚪 Çıkış Yap
                </button>


            </section>

        </main>

    </div>

);

}

export default Profile;
