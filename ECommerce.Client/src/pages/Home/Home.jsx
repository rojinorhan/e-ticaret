import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Home() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await api.get("/Category");

                setCategories(response.data);
            } catch (error) {
                console.error(
                    "Kategoriler yüklenirken hata oluştu:",
                    error
                );
            } finally {
                setLoadingCategories(false);
            }
        };
        
        getCategories();
    }, []);
    

    const categoryIcons = ["💻", "💻", "💻", "💻", "💻", "💻", "💻", "💻"];
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };
    return (
        <div className="home-page">

            {/* NAVBAR */}
            <nav className="home-navbar">

                <div
                    className="home-logo"
                    onClick={() => navigate("/home")}
                >
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <div className="home-menu">

                    <button
                        className="active"
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
                        onClick={() =>
                            navigate("/favorites")
                        }
                    >
                        ❤️
                        <span>
            Favoriler
        </span>
                    </button>

                </div>

                <div className="home-actions">

                    <button
                        className="cart-button"
                        onClick={() => navigate("/cart")}
                    >
                        🛍️
                        <span>Sepet</span>
                    </button>
                   

                    <button
                        className="profile-button"
                        onClick={() => navigate("/profile")}
                    >
                        👤
                    </button>
                    <button
                        className="admin-bottom-item logout"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        <span>Çıkış Yap</span>
                    </button>


                </div>

            </nav>

            {/* HERO */}
            <section className="home-hero">

                <div className="hero-content">

                    <span className="hero-tag">
                        YENİ SEZON
                    </span>

                    <h1>
                        Alışverişin
                        <br />
                        <span>yeni adresi.</span>
                    </h1>

                    <p>
                        Aradığınız ürünleri keşfedin,
                        favorilerinizi oluşturun ve
                        güvenli alışverişin keyfini çıkarın.
                    </p>

                    <button
                        className="hero-button"
                        onClick={() => navigate("/products")}
                    >
                        Ürünleri Keşfet
                        <span>→</span>
                    </button>

                </div>

                <div className="hero-visual">

                    <div className="hero-circle circle-one"></div>
                    <div className="hero-circle circle-two"></div>

                    <div className="hero-card">
                        <span>🛍️</span>
                        <strong>SHOP</strong>
                    </div>

                </div>

            </section>

            {/* CATEGORIES */}
            <section className="categories-section">

                <div className="section-heading">

                    <div>
                        <span>KATEGORİLER</span>

                        <h2>
                            Ne arıyorsunuz?
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Tümünü Gör →
                    </button>

                </div>

                {loadingCategories ? (

                    <div className="category-loading">
                        Kategoriler yükleniyor...
                    </div>

                ) : categories.length === 0 ? (

                    <div className="category-empty">
                        Henüz kategori bulunmuyor.
                    </div>

                ) : (

                    <div className="category-cards">

                        {categories.slice(0, 4).map(
                            (category, index) => (

                                <div
                                    className="category-card"
                                    key={category.id}
                                    onClick={() =>
                                        navigate(
                                            `/products?categoryId=${category.id}`
                                        )
                                    }
                                >

                                    <div className="category-icon">
                                        {
                                            categoryIcons[
                                            index %
                                            categoryIcons.length
                                                ]
                                        }
                                    </div>

                                    <h3>
                                        {category.name}
                                    </h3>

                                    <p>
                                        {category.description ||
                                            "Ürünleri keşfedin"}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>

            {/* FEATURE */}
            <section className="home-feature">

                <div className="feature-box">

                    <div>

                        <span>
                            GÜVENLİ ALIŞVERİŞ
                        </span>

                        <h2>
                            Aradığınız her şey,
                            <br />
                            tek yerde.
                        </h2>

                        <p>
                            Geniş ürün seçenekleri,
                            güvenli ödeme ve kolay
                            sipariş takibi.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                        >
                            Alışverişe Başla →
                        </button>

                    </div>

                    <div className="feature-icon">
                        ✨
                    </div>

                </div>

            </section>

            {/* FOOTER */}
            <footer className="home-footer">

                <div>

                    <strong>
                        🛒 E-Commerce
                    </strong>

                    <p>
                        Alışverişin yeni adresi.
                    </p>

                </div>

                <div>

                    <p>
                        © 2026 E-Commerce
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default Home;