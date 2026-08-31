import "./Products.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

function Products() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [error, setError] = useState("");

    // Filtreler
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("");

    // Favoriler
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [favoriteLoading, setFavoriteLoading] = useState(null);




    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await api.get("/Category");

                setCategories(response.data || []);
            } catch (error) {
                console.error(
                    "Kategori yükleme hatası:",
                    error
                );
            }
        };

        getCategories();
    }, []);




    const getFavorites = async () => {
        try {
            const response = await api.get("/Favorite");

            const favorites = response.data || [];

            const ids = new Set(
                favorites.map(
                    (favorite) => favorite.productId
                )
            );

            setFavoriteIds(ids);

        } catch (error) {
            console.error(
                "Favoriler yükleme hatası:",
                error
            );

            if (error.response?.status === 401) {
                setFavoriteIds(new Set());
            }
        }
    };


    useEffect(() => {
        getFavorites();
    }, []);

    const getProducts = async () => {
        try {
            setFilterLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (categoryId) {
                params.categoryId = Number(categoryId);
            }

            if (minPrice !== "") {
                params.minPrice = Number(minPrice);
            }

            if (maxPrice !== "") {
                params.maxPrice = Number(maxPrice);
            }

            if (sort) {
                params.sort = sort;
            }

            const response = await api.get(
                "/Product/filter",
                {
                    params
                }
            );

            setProducts(response.data || []);

        } catch (error) {
            console.error(
                "Ürün filtreleme hatası:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text:
                        "Ürünleri görüntülemek için giriş yapmanız gerekiyor.",
                    confirmButtonText: "Giriş Yap",
                    confirmButtonColor: "#4f46e5"
                });

                navigate("/");
                return;
            }

            const errorMessage =
                error.response?.data?.message ||
                "Ürünler yüklenirken bir hata oluştu.";

            setError(errorMessage);

            Swal.fire({
                icon: "error",
                title: "Ürünler Yüklenemedi",
                text: errorMessage,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    };


    useEffect(() => {
        getProducts();
    }, []);



    const handleFilter = async (event) => {
        event?.preventDefault();

        await getProducts();
    };



    const clearFilters = async () => {
        setSearch("");
        setCategoryId("");
        setMinPrice("");
        setMaxPrice("");
        setSort("");

        try {
            setFilterLoading(true);
            setError("");

            const response = await api.get(
                "/Product/filter"
            );

            setProducts(response.data || []);

        } catch (error) {
            console.error(
                "Filtre temizleme hatası:",
                error
            );

            setError(
                "Ürünler yüklenirken bir hata oluştu."
            );

        } finally {
            setFilterLoading(false);
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



    const handleFavorite = async (productId) => {
        if (favoriteLoading === productId) {
            return;
        }

        const isFavorite =
            favoriteIds.has(productId);

        try {
            setFavoriteLoading(productId);

            
            if (isFavorite) {
                await api.delete(
                    `/Favorite/${productId}`
                );

                setFavoriteIds((previous) => {
                    const updated = new Set(previous);

                    updated.delete(productId);

                    return updated;
                });

                Swal.fire({
                    icon: "success",
                    title: "Favorilerden Çıkarıldı",
                    text:
                        "Ürün favorilerinizden çıkarıldı.",
                    timer: 1200,
                    showConfirmButton: false
                });

                return;
            }


            

            await api.post(
                "/Favorite",
                {
                    productId: productId
                }
            );

            setFavoriteIds((previous) => {
                const updated = new Set(previous);

                updated.add(productId);

                return updated;
            });

            Swal.fire({
                icon: "success",
                title: "Favorilere Eklendi ❤️",
                text:
                    "Ürün favorilerinize eklendi.",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (error) {
            console.error(
                "Favori işlemi hatası:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                await Swal.fire({
                    icon: "warning",
                    title: "Oturum Gerekli",
                    text:
                        "Favorilere ürün eklemek için giriş yapmanız gerekiyor.",
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
                    "Favori işlemi gerçekleştirilemedi.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

        } finally {
            setFavoriteLoading(null);
        }
    };


    const handleAddToCart = async (productId) => {
        const product = products.find(
            (item) => item.id === productId
        );

        if (!product) {
            return;
        }

        if (product.stock <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Stokta Yok",
                text:
                    "Bu ürün şu anda stokta bulunmuyor.",
                confirmButtonText: "Tamam",
                confirmButtonColor: "#4f46e5"
            });

            return;
        }

        try {
            await api.post(
                "/Cart/items",
                {
                    productId: productId,
                    quantity: 1
                }
            );

            const result = await Swal.fire({
                icon: "success",
                title: "Sepete Eklendi",
                html: `
                    <div class="swal-product-message">
                        <strong>${product.name}</strong>
                        <br />
                        Ürün sepetinize eklendi.
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Sepete Git",
                cancelButtonText:
                    "Alışverişe Devam Et",
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
                    text:
                        "Ürünü sepete eklemek için giriş yapmanız gerekiyor.",
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


    

    if (loading) {
        return (
            <div className="products-page">
                <div className="products-loading">
                    <div className="products-spinner"></div>

                    <p>
                        Ürünler yükleniyor...
                    </p>
                </div>
            </div>
        );
    }



    return (
        <div className="products-page">

            {/* HEADER */}

            <header className="products-header">

                <div
                    className="products-logo"
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


                <nav className="products-nav">

                    <button
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        Ana Sayfa
                    </button>

                    <button className="active">
                        Ürünler
                    </button>

                    <button
                        onClick={() =>
                            navigate("/orders")
                        }
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


            {/* MAIN */}

            <main className="products-container">

                {/* HERO */}

                <section className="products-hero">

                    <div className="hero-content">

                        <span className="products-eyebrow">
                            E-COMMERCE MAĞAZASI
                        </span>

                        <h1>
                            Ürünleri Keşfet
                        </h1>

                        <p>
                            İhtiyacınız olan ürünleri bulun,
                            filtreleyin ve alışverişe başlayın.
                        </p>

                    </div>

                    <div className="products-count-box">

                        <span>
                            Toplam
                        </span>

                        <strong>
                            {products.length}
                        </strong>

                        <span>
                            ürün
                        </span>

                    </div>

                </section>


                {/* FILTER */}

                <section className="products-filter">

                    <div className="filter-header">

                        <div>

                            <span className="filter-icon">
                                ⚙️
                            </span>

                            <div>

                                <h2>
                                    Ürünleri Filtrele
                                </h2>

                                <p>
                                    Aradığınız ürünü daha kolay bulun.
                                </p>

                            </div>

                        </div>

                    </div>


                    <form
                        className="filter-form"
                        onSubmit={handleFilter}
                    >

                        <div className="filter-field search-field">

                            <label>
                                Ürün Ara
                            </label>

                            <div className="input-wrapper">

                                <span>
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Laptop, telefon, kulaklık..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        <div className="filter-field">

                            <label>
                                Kategori
                            </label>

                            <select
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Tüm Kategoriler
                                </option>

                                {categories.map(
                                    (category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="filter-field">

                            <label>
                                Min. Fiyat
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="₺ 0"
                                value={minPrice}
                                onChange={(e) =>
                                    setMinPrice(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="filter-field">

                            <label>
                                Max. Fiyat
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="₺ 100.000"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="filter-field">

                            <label>
                                Sıralama
                            </label>

                            <select
                                value={sort}
                                onChange={(e) =>
                                    setSort(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Varsayılan
                                </option>

                                <option value="priceAsc">
                                    Fiyat: Düşük → Yüksek
                                </option>

                                <option value="priceDesc">
                                    Fiyat: Yüksek → Düşük
                                </option>

                                <option value="nameAsc">
                                    İsim: A → Z
                                </option>

                                <option value="nameDesc">
                                    İsim: Z → A
                                </option>

                            </select>

                        </div>


                        <div className="filter-actions">

                            <button
                                type="submit"
                                className="filter-button"
                                disabled={filterLoading}
                            >
                                {filterLoading
                                    ? "Filtreleniyor..."
                                    : "Filtrele"}
                            </button>

                            <button
                                type="button"
                                className="clear-filter-button"
                                onClick={clearFilters}
                                disabled={filterLoading}
                            >
                                Temizle
                            </button>

                        </div>

                    </form>

                </section>


                {/* ERROR */}

                {error && (
                    <div className="products-error">

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


                {/* RESULT BAR */}

                {!error && (
                    <div className="products-result-bar">

                        <span>
                            <strong>
                                {products.length}
                            </strong>{" "}
                            ürün listeleniyor
                        </span>

                        {categoryId && (
                            <span className="active-filter">
                                Kategori filtresi aktif
                            </span>
                        )}

                    </div>
                )}


                {/* EMPTY */}

                {!error &&
                    products.length === 0 && (

                        <div className="empty-products">

                            <div className="empty-products-icon">
                                🔎
                            </div>

                            <h2>
                                Ürün bulunamadı
                            </h2>

                            <p>
                                Seçtiğiniz filtrelere uygun
                                bir ürün bulunamadı.
                            </p>

                            <button
                                onClick={clearFilters}
                            >
                                Filtreleri Temizle
                            </button>

                        </div>
                    )
                }


                {/* PRODUCTS */}

                {products.length > 0 && (

                    <section className="products-grid">

                        {products.map((product) => {

                            const isFavorite =
                                favoriteIds.has(
                                    product.id
                                );

                            const isFavoriteLoading =
                                favoriteLoading ===
                                product.id;

                            return (
                                <article
                                    className="product-card"
                                    key={product.id}
                                >

                                    {/* PRODUCT IMAGE */}

                                    <div
                                        className="product-image"
                                        onClick={() =>
                                            navigate(
                                                `/products/${product.id}`
                                            )
                                        }
                                    >

                                        <div className="product-image-circle">
                                            🛍️
                                        </div>


                                        {product.stock <= 0 && (
                                            <span className="out-of-stock">
                                                STOKTA YOK
                                            </span>
                                        )}


                                        {/* FAVORİ */}

                                        <button
                                            type="button"
                                            className={`favorite-button ${
                                                isFavorite
                                                    ? "favorite-active"
                                                    : ""
                                            }`}
                                            disabled={
                                                isFavoriteLoading
                                            }
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                handleFavorite(
                                                    product.id
                                                );
                                            }}
                                            aria-label={
                                                isFavorite
                                                    ? "Favorilerden çıkar"
                                                    : "Favorilere ekle"
                                            }
                                        >

                                            {isFavoriteLoading
                                                ? "..."
                                                : isFavorite
                                                    ? "❤️"
                                                    : "♡"}

                                        </button>

                                    </div>


                                    {/* PRODUCT CONTENT */}

                                    <div className="product-card-content">

                                        <div className="product-category">
                                            {product.categoryName ||
                                                "Kategori"}
                                        </div>


                                        <h2>
                                            {product.name}
                                        </h2>


                                        <p className="product-description">
                                            {product.description ||
                                                "Ürün açıklaması bulunmuyor."}
                                        </p>


                                        <div className="product-stock-row">

                                            <span
                                                className={
                                                    product.stock > 0
                                                        ? "stock-available"
                                                        : "stock-empty"
                                                }
                                            >

                                                <span className="stock-dot"></span>

                                                {product.stock > 0
                                                    ? `${product.stock} adet stokta`
                                                    : "Stokta yok"}

                                            </span>

                                        </div>


                                        <div className="product-card-bottom">

                                            <div className="price-area">

                                                <span>
                                                    Fiyat
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </strong>

                                            </div>


                                            <button
                                                className="add-cart-button"
                                                disabled={
                                                    product.stock <= 0
                                                }
                                                onClick={() =>
                                                    handleAddToCart(
                                                        product.id
                                                    )
                                                }
                                            >

                                                {product.stock > 0
                                                    ? "Sepete Ekle"
                                                    : "Stok Yok"}

                                                {product.stock > 0 && (
                                                    <span>
                                                        +
                                                    </span>
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </section>
                )}

            </main>

        </div>
    );
}

export default Products;