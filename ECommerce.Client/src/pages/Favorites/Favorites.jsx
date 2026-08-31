import "./Favorites.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Favorites() {

    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState("");


  

    const getFavorites = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/Favorite");

            setFavorites(response.data || []);

        } catch (error) {

            console.error(
                "Favoriler yükleme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Favorilerinizi görmek için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const message =
                error.response?.data?.message ||
                "Favoriler yüklenirken bir hata oluştu.";

            setError(message);

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        getFavorites();
    }, []);


    const handleRemoveFavorite = async (productId) => {

        if (removingId === productId) {
            return;
        }

        try {

            setRemovingId(productId);

            await api.delete(
                `/Favorite/${productId}`
            );

            // Ürünü ekrandan anında kaldır
            setFavorites((previous) =>
                previous.filter(
                    (favorite) =>
                        favorite.productId !== productId
                )
            );

            Swal.fire({
                icon: "success",
                title: "Favorilerden Çıkarıldı",
                text: "Ürün favorilerinizden çıkarıldı.",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (error) {

            console.error(
                "Favoriden çıkarma hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Bu işlem için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "İşlem Başarısız",
                text:
                    error.response?.data?.message ||
                    "Ürün favorilerden çıkarılamadı.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        } finally {

            setRemovingId(null);
        }
    };


  
    const handleAddToCart = async (favorite) => {

        if (favorite.stock <= 0) {

            Swal.fire({
                icon: "warning",
                title: "Stokta Yok",
                text: "Bu ürün şu anda stokta bulunmuyor.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {

            await api.post(
                "/Cart/items",
                {
                    productId: favorite.productId,
                    quantity: 1
                }
            );

            const result = await Swal.fire({
                icon: "success",
                title: "Sepete Eklendi",
                html: `
<div class="swal-product-message">
    <strong>${favorite.productName}</strong>
<br />
Ürün sepetinize eklendi.
</div>
`,
                showCancelButton: true,
                confirmButtonText: "Sepete Git",
                cancelButtonText: "Alışverişe Devam Et",
                confirmButtonColor: "#4f46e5",
                cancelButtonColor: "#64748b"
            });

            if (result.isConfirmed) {
                navigate("/cart");
            }

        } catch (error) {

            console.error(
                "Sepete ekleme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Ürünü sepete eklemek için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Sepete Eklenemedi",
                text:
                    error.response?.data?.message ||
                    "Ürün sepete eklenirken bir hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });
        }
    };


  

    const formatPrice = (price) => {

        return Number(price || 0).toLocaleString(
            "tr-TR",
            {
                style: "currency",
                currency: "TRY"
            }
        );
    };



    if (loading) {

        return (
            <div className="favorites-page">

                <div className="favorites-loading">

                    <div className="favorites-spinner"></div>

                    <p>
                        Favorileriniz yükleniyor...
                    </p>

                </div>

            </div>
        );
    }



    return (
        <div className="favorites-page">

         

            <header className="favorites-header">

                <div
                    className="favorites-logo"
                    onClick={() =>
                        navigate("/home")
                    }
                >

                    <div className="logo-icon">
                        🛒
                    </div>

                    <div className="logo-text">

                        <strong>
                            E-Commerce
                        </strong>

                        <span>
                            Online Mağaza
                        </span>

                    </div>

                </div>


                <nav className="favorites-nav">

                    <button
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        Ana Sayfa
                    </button>

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        Ürünler
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/favorites")
                        }
                    >
                        ❤️ Favoriler
                    </button>

                    <button
                        onClick={() =>
                            navigate("/orders")
                        }
                    >
                        Siparişlerim
                    </button>

                    <button
                        className="cart-nav-button"
                        onClick={() =>
                            navigate("/cart")
                        }
                    >
                        🛒
                        <span>
                            Sepet
                        </span>
                    </button>

                </nav>

            </header>


          

            <main className="favorites-container">

                {/* HERO */}

                <section className="favorites-hero">

                    <div>

                        <span className="favorites-eyebrow">
                            E-COMMERCE MAĞAZASI
                        </span>

                        <h1>
                            Favorilerim
                        </h1>

                        <p>
                            Beğendiğiniz ürünleri burada
                            bulabilir ve kolayca alışverişe
                            devam edebilirsiniz.
                        </p>

                    </div>


                    <div className="favorites-count-box">

                        <span>
                            Toplam
                        </span>

                        <strong>
                            {favorites.length}
                        </strong>

                        <span>
                            favori
                        </span>

                    </div>

                </section>


                {/* ERROR */}

                {error && (

                    <div className="favorites-error">

                        <span>
                            ⚠️
                        </span>

                        <div>

                            <strong>
                                Bir hata oluştu
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* EMPTY */}

                {!error &&
                    favorites.length === 0 && (

                        <div className="empty-favorites">

                            <div className="empty-favorites-icon">
                                ♡
                            </div>

                            <h2>
                                Henüz favoriniz yok
                            </h2>

                            <p>
                                Beğendiğiniz ürünleri
                                favorilerinize ekleyerek
                                daha sonra kolayca
                                ulaşabilirsiniz.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                Ürünleri Keşfet
                            </button>

                        </div>
                    )
                }


                {/* FAVORITES */}

                {favorites.length > 0 && (

                    <section className="favorites-grid">

                        {favorites.map(
                            (favorite) => (

                                <article
                                    className="favorite-card"
                                    key={favorite.id}
                                >

                                    {/* IMAGE */}

                                    <div
                                        className="favorite-image"
                                        onClick={() =>
                                            navigate(`/products/${favorite.productId}`)
                                        }
                                    >
                                        <div className="favorite-image-circle">
                                            🛍️
                                        </div>

                                        <button
                                            type="button"
                                            className="favorite-heart"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();

                                                handleRemoveFavorite(favorite.productId);
                                            }}
                                            disabled={removingId === favorite.productId}
                                            aria-label="Favorilerden çıkar"
                                            title="Favorilerden çıkar"
                                        >
                                            {removingId === favorite.productId
                                                ? "..."
                                                : "❤️"}
                                        </button>
                                    </div>


                                    {/* CONTENT */}

                                    <div className="favorite-card-content">

                                        <span className="favorite-category">
                                            {favorite.categoryName ||
                                                "Kategori"}
                                        </span>


                                        <h2>
                                            {favorite.productName}
                                        </h2>


                                        <p className="favorite-description">
                                            {favorite.description ||
                                                "Ürün açıklaması bulunmuyor."}
                                        </p>


                                        {/* STOCK */}

                                        <div className="favorite-stock">

                                            <span
                                                className={
                                                    favorite.stock > 0
                                                        ? "stock-available"
                                                        : "stock-empty"
                                                }
                                            >

                                                <span className="stock-dot"></span>

                                                {favorite.stock > 0
                                                    ? `${favorite.stock} adet stokta`
                                                    : "Stokta yok"}

                                            </span>

                                        </div>


                                        {/* BOTTOM */}

                                        <div className="favorite-bottom">

                                            <div className="favorite-price">

                                                <span>
                                                    Fiyat
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        favorite.price
                                                    )}
                                                </strong>

                                            </div>


                                            <div className="favorite-actions">

                                                {/* FAVORİDEN ÇIKAR */}
                                                <button
                                                    type="button"
                                                    className="remove-favorite-button"
                                                    disabled={removingId === favorite.productId}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();

                                                        handleRemoveFavorite(favorite.productId);
                                                    }}
                                                    aria-label="Favorilerden çıkar"
                                                    title="Favorilerden çıkar"
                                                >
                                                    {removingId === favorite.productId
                                                        ? "..."
                                                        : "❤️"}
                                                </button>
                                                           
                                                


                                                {/* SEPETE EKLE */}

                                                <button
                                                    type="button"
                                                    className="favorite-cart-button"
                                                    disabled={
                                                        favorite.stock <= 0
                                                    }
                                                    onClick={(event) => {

                                                        event.stopPropagation();

                                                        handleAddToCart(
                                                            favorite
                                                        );
                                                    }}
                                                >

                                                    {favorite.stock > 0
                                                        ? "Sepete Ekle"
                                                        : "Stok Yok"}

                                                    {favorite.stock > 0 && (
                                                        <span>
                                                            +
                                                        </span>
                                                    )}

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </article>
                            )
                        )}

                    </section>
                )}

            </main>

        </div>
    );
}

export default Favorites;
