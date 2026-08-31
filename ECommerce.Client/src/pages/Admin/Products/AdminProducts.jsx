import "./AdminProducts.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import Swal from "sweetalert2";

function AdminProducts() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");


    // =========================
    // ÜRÜNLERİ GETİR
    // =========================

    const getProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get("/Product");

            setProducts(response.data);

        } catch (error) {

            console.error(error);

            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                window.location.href = "/";

                return;
            }

            if (error.response?.status === 403) {

                Swal.fire({
                    icon: "error",
                    title: "Yetkisiz İşlem",
                    text: "Bu işlem için admin yetkisi gereklidir."
                });

                return;
            }

            Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    error.response?.data?.message ||
                    "Ürünler yüklenemedi."
            });

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // KATEGORİLERİ GETİR
    // =========================

    const getCategories = async () => {

        try {

            const response = await api.get("/Category");

            setCategories(response.data);

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    error.response?.data?.message ||
                    "Kategoriler yüklenemedi."
            });

        }
    };


    // =========================
    // SAYFA AÇILINCA
    // =========================

    useEffect(() => {

        getProducts();
        getCategories();

    }, []);


    // =========================
    // FORM TEMİZLE
    // =========================

    const resetForm = () => {

        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setCategoryId("");

        setEditingId(null);
        setShowForm(false);

    };


    // =========================
    // ÜRÜN EKLE / GÜNCELLE
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!name.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Eksik Bilgi",
                text: "Ürün adı zorunludur."
            });

            return;
        }


        if (!price || Number(price) < 0) {

            Swal.fire({
                icon: "warning",
                title: "Geçersiz Fiyat",
                text: "Geçerli bir fiyat giriniz."
            });

            return;
        }


        if (stock === "" || Number(stock) < 0) {

            Swal.fire({
                icon: "warning",
                title: "Geçersiz Stok",
                text: "Geçerli bir stok miktarı giriniz."
            });

            return;
        }


        if (!categoryId) {

            Swal.fire({
                icon: "warning",
                title: "Kategori Seçilmedi",
                text: "Lütfen bir kategori seçiniz."
            });

            return;
        }


        const productData = {

            name: name.trim(),

            description: description.trim(),

            price: Number(price),

            stock: Number(stock),

            categoryId: Number(categoryId)

        };


        try {

            if (editingId) {

                await api.put(
                    `/Product/${editingId}`,
                    productData
                );


                Swal.fire({
                    icon: "success",
                    title: "Ürün Güncellendi",
                    text: "Ürün başarıyla güncellendi.",
                    timer: 1800,
                    showConfirmButton: false
                });

            } else {

                await api.post(
                    "/Product",
                    productData
                );


                Swal.fire({
                    icon: "success",
                    title: "Ürün Oluşturuldu",
                    text: "Ürün başarıyla oluşturuldu.",
                    timer: 1800,
                    showConfirmButton: false
                });

            }


            resetForm();

            await getProducts();

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "İşlem Başarısız",
                text:
                    error.response?.data?.message ||
                    "Ürün kaydedilemedi."
            });

        }
    };


    // =========================
    // ÜRÜN DÜZENLE
    // =========================

    const handleEdit = (product) => {

        setEditingId(product.id);

        setName(product.name || "");

        setDescription(product.description || "");

        setPrice(product.price ?? "");

        setStock(product.stock ?? "");

        setCategoryId(product.categoryId ?? "");

        setShowForm(true);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // =========================
    // ÜRÜN SİL
    // =========================

    const handleDelete = async (id) => {

        const result = await Swal.fire({

            title: "Ürünü silmek istediğinize emin misiniz?",

            text: "Bu işlem geri alınamaz.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Evet, Sil",

            cancelButtonText: "Vazgeç",

            reverseButtons: true

        });


        if (!result.isConfirmed) {

            return;
        }


        try {

            await api.delete(
                `/Product/${id}`
            );


            await getProducts();


            Swal.fire({

                icon: "success",

                title: "Silindi!",

                text: "Ürün başarıyla silindi.",

                timer: 1800,

                showConfirmButton: false

            });

        } catch (error) {

            console.error(error);

            Swal.fire({

                icon: "error",

                title: "Silinemedi",

                text:
                    error.response?.data?.message ||
                    "Ürün silinemedi."

            });

        }

    };


    // =========================
    // KATEGORİ ADI
    // =========================

    const getCategoryName = (categoryId) => {

        const category = categories.find(
            (category) =>
                category.id === categoryId
        );

        return category?.name || "-";
    };


    // =========================
    // UI
    // =========================

    return (

        <div className="admin-page">


            {/* HEADER */}

            <div className="admin-page-header">

                <div>

                    <span>
                        ÜRÜN YÖNETİMİ
                    </span>

                    <h2>
                        Ürünler
                    </h2>

                    <p>
                        Ürünlerinizi buradan yönetebilirsiniz.
                    </p>

                </div>


                <button
                    className="admin-primary-button"
                    onClick={() => {

                        if (showForm) {

                            resetForm();

                        } else {

                            setShowForm(true);

                        }

                    }}
                >

                    {showForm
                        ? "Vazgeç"
                        : "+ Ürün Ekle"}

                </button>

            </div>


            {/* FORM */}

            {showForm && (

                <div className="admin-card">

                    <h3>

                        {editingId
                            ? "Ürün Düzenle"
                            : "Yeni Ürün"}

                    </h3>


                    <form
                        className="admin-form"
                        onSubmit={handleSubmit}
                    >


                        {/* ÜRÜN ADI */}

                        <div className="admin-form-group">

                            <label>
                                Ürün Adı
                            </label>

                            <input
                                type="text"
                                value={name}
                                placeholder="Ürün adı"
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />

                        </div>


                        {/* AÇIKLAMA */}

                        <div className="admin-form-group">

                            <label>
                                Açıklama
                            </label>

                            <textarea
                                value={description}
                                placeholder="Ürün açıklaması"
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            />

                        </div>


                        {/* FİYAT */}

                        <div className="admin-form-group">

                            <label>
                                Fiyat
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                placeholder="0.00"
                                onChange={(e) =>
                                    setPrice(e.target.value)
                                }
                            />

                        </div>


                        {/* STOK */}

                        <div className="admin-form-group">

                            <label>
                                Stok
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={stock}
                                placeholder="0"
                                onChange={(e) =>
                                    setStock(e.target.value)
                                }
                            />

                        </div>


                        {/* KATEGORİ */}

                        <div className="admin-form-group">

                            <label>
                                Kategori
                            </label>

                            <select
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(e.target.value)
                                }
                            >

                                <option value="">
                                    Kategori seçiniz
                                </option>

                                {categories.map((category) => (

                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>

                                ))}

                            </select>

                        </div>


                        <button
                            type="submit"
                            className="admin-primary-button"
                        >

                            {editingId
                                ? "Ürünü Güncelle"
                                : "Ürün Oluştur"}

                        </button>

                    </form>

                </div>

            )}


            {/* PRODUCT LIST */}

            <div className="admin-card">

                <h3>
                    Ürün Listesi
                </h3>


                {loading ? (

                    <div className="admin-empty">

                        Ürünler yükleniyor...

                    </div>

                ) : products.length === 0 ? (

                    <div className="admin-empty">

                        <span>
                            📦
                        </span>

                        <strong>
                            Henüz ürün bulunmuyor.
                        </strong>

                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                            <tr>

                                <th>ID</th>

                                <th>Ürün</th>

                                <th>Kategori</th>

                                <th>Fiyat</th>

                                <th>Stok</th>

                                <th>Oluşturulma</th>

                                <th>İşlemler</th>

                            </tr>

                            </thead>


                            <tbody>

                            {products.map((product) => (

                                <tr
                                    key={product.id}
                                >

                                    <td>
                                        #{product.id}
                                    </td>


                                    <td>

                                        <strong>
                                            {product.name}
                                        </strong>

                                    </td>


                                    <td>

                                        {product.categoryName ||
                                            getCategoryName(
                                                product.categoryId
                                            )}

                                    </td>


                                    <td>

                                        {Number(
                                            product.price || 0
                                        ).toFixed(2)}

                                        {" "}₺

                                    </td>


                                    <td>
                                        {product.stock}
                                    </td>


                                    <td>

                                        {product.createdAt
                                            ? new Date(
                                                product.createdAt
                                            ).toLocaleDateString(
                                                "tr-TR"
                                            )
                                            : "-"}

                                    </td>


                                    <td>

                                        <div className="admin-actions">

                                            <button
                                                className="admin-edit-button"
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                            >
                                                Düzenle
                                            </button>


                                            <button
                                                className="admin-delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        product.id
                                                    )
                                                }
                                            >
                                                Sil
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
}

export default AdminProducts;