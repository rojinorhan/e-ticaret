import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function ProductDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        getProduct();
    }, [id]);

 
    useEffect(() => {
        getReviews();
    }, [id]);

    const getProduct = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(`/Product/${id}`);

            setProduct(response.data);

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/");
                return;
            }

            if (error.response?.status === 404) {
                setError("Ürün bulunamadı.");
            } else {
                setError(
                    "Ürün bilgileri yüklenirken bir hata oluştu."
                );
            }

        } finally {

            setLoading(false);

        }
    };

    const getReviews = async () => {

        try {

            setReviewsLoading(true);

            const response = await api.get(
                `/Review/product/${id}`
            );

            setReviews(response.data || []);

        } catch (error) {

            console.error(
                "Yorumlar yüklenirken hata:",
                error
            );

            setReviews([]);

        } finally {

            setReviewsLoading(false);

        }
    };



    const increaseQuantity = () => {

        if (!product) return;

        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {

        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

  


    const handleAddToCart = async () => {

        if (!product || product.stock <= 0) {
            return;
        }

        try {

            await api.post("/Cart/items", {
                productId: product.id,
                quantity: quantity
            });

            Swal.fire({
                icon: "success",
                title: "Sepete Eklendi",
                text: "Ürün sepetinize eklendi.",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Ürün eklemek için giriş yapmanız gerekiyor.",
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
                    "Ürün sepete eklenirken bir hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });
        }
    };

    const handleSubmitReview = async (event) => {

        event.preventDefault();

        if (selectedRating === 0) {

            Swal.fire({
                icon: "warning",
                title: "Puan Seçin",
                text: "Lütfen ürüne 1 ile 5 arasında bir puan verin.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        if (!comment.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Yorum Yazın",
                text: "Lütfen yorumunuzu yazın.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {

            setSubmittingReview(true);

            const response = await api.post(
                "/Review",
                {
                    productId: Number(id),
                    rating: selectedRating,
                    comment: comment.trim()
                }
            );

            setReviews((previous) => [
                response.data,
                ...previous
            ]);

            setSelectedRating(0);
            setComment("");

            Swal.fire({
                icon: "success",
                title: "Yorum Gönderildi",
                text: "Değerlendirmeniz başarıyla eklendi.",
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {

            console.error(
                "Yorum gönderme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text: "Yorum yapmak için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Yorum Gönderilemedi",
                text:
                    error.response?.data?.message ||
                    error.response?.data ||
                    "Yorum gönderilirken bir hata oluştu.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        } finally {

            setSubmittingReview(false);

        }
    };


    const handleDeleteReview = async (reviewId) => {

        const result = await Swal.fire({
            icon: "warning",
            title: "Yorumu Sil",
            text: "Bu yorumu silmek istediğinizden emin misiniz?",
            showCancelButton: true,
            confirmButtonText: "Evet, Sil",
            cancelButtonText: "Vazgeç",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            await api.delete(`/Review/${reviewId}`);

            setReviews((previous) =>
                previous.filter(
                    (review) =>
                        review.id !== reviewId
                )
            );

            Swal.fire({
                icon: "success",
                title: "Yorum Silindi",
                text: "Yorumunuz silindi.",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (error) {

            console.error(
                "Yorum silme hatası:",
                error
            );

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                navigate("/");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "İşlem Başarısız",
                text:
                    error.response?.data?.message ||
                    "Yorum silinemedi.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });
        }
    };

    const renderStars = (rating, interactive = false) => {

        const numericRating = Number(rating) || 0;

        return (
            <div
                className={
                    interactive
                        ? "review-stars interactive-stars"
                        : "review-stars"
                }
            >
                {[1, 2, 3, 4, 5].map((star) => (

                    <button
                        key={star}
                        type="button"
                        className={
                            star <= numericRating
                                ? "star active"
                                : "star"
                        }
                        onClick={
                            interactive
                                ? () => setSelectedRating(star)
                                : undefined
                        }
                        disabled={!interactive}
                        aria-label={`${star} yıldız`}
                    >
                        ★
                    </button>

                ))}
            </div>
        );
    };
    
    



    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce(
                    (total, review) =>
                        total + review.rating,
                    0
                ) / reviews.length
            ).toFixed(1)
            : "0.0";



    const formatDate = (date) => {

        return new Date(date).toLocaleDateString(
            "tr-TR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };


    if (loading) {

        return (
            <div className="product-detail-page">

                <div className="detail-loading">

                    <div className="detail-spinner"></div>

                    <p>Ürün yükleniyor...</p>

                </div>

            </div>
        );
    }



    if (error || !product) {

        return (
            <div className="product-detail-page">

                <div className="detail-error">

                    <div>😕</div>

                    <h2>
                        {error || "Ürün bulunamadı."}
                    </h2>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Ürünlere Dön
                    </button>

                </div>

            </div>
        );
    }

    const totalPrice =
        product.price * quantity;

    return (
        <div className="product-detail-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav className="detail-navbar">

                <div
                    className="detail-logo"
                    onClick={() => navigate("/home")}
                >
                    <span>🛒</span>
                    <strong>E-Commerce</strong>
                </div>

                <div className="detail-nav-links">

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
                        onClick={() => navigate("/cart")}
                    >
                        🛍️ Sepet
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                    >
                        👤 Profil
                    </button>

                </div>

            </nav>

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="product-detail-content">

                <button
                    className="back-products"
                    onClick={() => navigate("/products")}
                >
                    ← Ürünlere Dön
                </button>

                {/* =================================================
                    PRODUCT CARD
                ================================================= */}

                <div className="product-detail-card">

                    {/* IMAGE */}

                    <div className="detail-image">

                        {product.imageUrl ? (

                            <img
                                src={product.imageUrl}
                                alt={product.name}
                            />

                        ) : (

                            <span>🛍️</span>

                        )}

                    </div>

                    {/* INFO */}

                    <div className="detail-info">

                        <span className="detail-category">
                            {product.categoryName}
                        </span>

                        <h1>
                            {product.name}
                        </h1>

                        <p className="detail-description">
                            {product.description}
                        </p>

                        {/* PRODUCT RATING */}
                        <div className="detail-rating-summary">

                            <div className="rating-stars-wrapper">
                                {renderStars(
                                    Math.round(Number(averageRating))
                                )}
                            </div>

                            <strong className="rating-number">
                                {averageRating} / 5
                            </strong>

                            <span className="rating-count">
        {reviews.length} değerlendirme
    </span>

                        </div>
                       
                        <div className="detail-price">

                            ₺
                            {Number(
                                product.price
                            ).toLocaleString(
                                "tr-TR",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}

                        </div>

                        <div className="detail-stock">

                            <span
                                className={
                                    product.stock > 0
                                        ? "stock-active"
                                        : "stock-empty"
                                }
                            >
                                ●
                            </span>

                            {product.stock > 0
                                ? `${product.stock} adet stokta`
                                : "Stokta yok"}

                        </div>

                        {product.stock > 0 && (

                            <>

                                {/* QUANTITY */}

                                <div className="quantity-section">

                                    <span>Adet</span>

                                    <div className="quantity-control">

                                        <button
                                            onClick={
                                                decreaseQuantity
                                            }
                                            disabled={
                                                quantity <= 1
                                            }
                                        >
                                            −
                                        </button>

                                        <strong>
                                            {quantity}
                                        </strong>

                                        <button
                                            onClick={
                                                increaseQuantity
                                            }
                                            disabled={
                                                quantity >=
                                                product.stock
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>

                                {/* TOTAL */}

                                <div className="detail-total">

                                    <span>
                                        Toplam
                                    </span>

                                    <strong>
                                        ₺
                                        {Number(
                                            totalPrice
                                        ).toLocaleString(
                                            "tr-TR",
                                            {
                                                minimumFractionDigits: 2
                                            }
                                        )}
                                    </strong>

                                </div>

                                {/* CART */}

                                <button
                                    className="add-cart-button"
                                    onClick={
                                        handleAddToCart
                                    }
                                >
                                    🛒 Sepete Ekle
                                </button>

                            </>

                        )}

                        {product.stock <= 0 && (

                            <button
                                className="disabled-cart-button"
                                disabled
                            >
                                Stokta Yok
                            </button>

                        )}

                    </div>

                </div>

               

                <section className="reviews-section">

                    {/* HEADER */}

                    <div className="reviews-header">

                        <div>

                            <span className="reviews-eyebrow">
                                MÜŞTERİ DENEYİMLERİ
                            </span>

                            <h2>
                                Ürün Değerlendirmeleri
                            </h2>

                            <p>
                                Bu ürünü satın alan müşterilerin
                                değerlendirmelerini inceleyin.
                            </p>

                        </div>

                        <div className="reviews-rating-box">

                            <strong>
                                {averageRating}
                            </strong>

                            {renderStars(
                                Math.round(
                                    Number(averageRating)
                                )
                            )}

                            <span>
                                {reviews.length} değerlendirme
                            </span>

                        </div>

                    </div>

                    {/* REVIEW FORM */}

                    <div className="review-form-card">

                        <div className="review-form-header">

                            <div>

                                <h3>
                                    Değerlendirmenizi Bırakın
                                </h3>

                                <p>
                                    Ürünü satın aldıysanız
                                    deneyiminizi paylaşabilirsiniz.
                                </p>

                            </div>

                            <span>
                                ⭐
                            </span>

                        </div>

                        <form
                            onSubmit={
                                handleSubmitReview
                            }
                        >

                            <div className="rating-input">

                                <label>
                                    Puanınız
                                </label>

                                <div className="rating-selection">

                                    <div className="selectable-stars">

                                        {[1, 2, 3, 4, 5].map((star) => (

                                            <button
                                                key={star}
                                                type="button"
                                                className={
                                                    star <= selectedRating
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setSelectedRating(star)
                                                }
                                                aria-label={`${star} yıldız ver`}
                                            >
                                                ★
                                            </button>

                                        ))}

                                    </div>

                                    <div className="selected-rating-text">

                                        {selectedRating > 0
                                            ? `${selectedRating} / 5 yıldız seçildi`
                                            : "Puanınızı seçin"}

                                    </div>

                                </div>

                            </div>

                            <div className="comment-input">

                                <label>
                                    Yorumunuz
                                </label>

                                <textarea
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ürün hakkındaki düşüncelerinizi yazın..."
                                    maxLength={1000}
                                />

                                <span>
                                    {comment.length}/1000
                                </span>

                            </div>

                            <button
                                type="submit"
                                className="submit-review-button"
                                disabled={
                                    submittingReview
                                }
                            >
                                {submittingReview
                                    ? "Gönderiliyor..."
                                    : "⭐ Yorumu Gönder"}
                            </button>

                        </form>

                    </div>

                    {/* REVIEW LIST */}

                    <div className="reviews-list">

                        <div className="reviews-list-header">

                            <h3>
                                Değerlendirmeler
                            </h3>

                            <span>
                                {reviews.length} yorum
                            </span>

                        </div>

                        {reviewsLoading ? (

                            <div className="reviews-loading">
                                <div className="review-spinner"></div>
                                <p>
                                    Yorumlar yükleniyor...
                                </p>
                            </div>

                        ) : reviews.length === 0 ? (

                            <div className="no-reviews">

                                <div>
                                    ☆
                                </div>

                                <h3>
                                    Henüz değerlendirme yok
                                </h3>

                                <p>
                                    Bu ürün için ilk
                                    değerlendirmeyi siz yapın.
                                </p>

                            </div>

                        ) : (

                            reviews.map((review) => (

                                <article
                                    className="review-card"
                                    key={review.id}
                                >

                                    <div className="review-user">

                                        <div className="review-avatar">
                                            {review.userName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </div>

                                        <div>

                                            <strong>
                                                {review.userName}
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    review.createdAt
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="review-card-right">

                                        <div className="review-rating">

                                            {renderStars(review.rating)}

                                            <strong>
                                                {review.rating} / 5
                                            </strong>

                                        </div>

                                        <p>
                                            {review.comment}
                                        </p>

                                    </div>

                                </article>

                            ))

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default ProductDetail;
