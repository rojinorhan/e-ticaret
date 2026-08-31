import "./AdminCategories.css";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";

function AdminCategories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);

    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [saving, setSaving] = useState(false);


    const getCategories = async () => {
        try {
            setLoading(true);

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

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getCategories();
    }, []);


    // Kategori ekleme
    const handleAddCategory = async (e) => {

        e.preventDefault();

        if (!categoryName.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Eksik Bilgi",
                text: "Kategori adı boş bırakılamaz."
            });

            return;
        }

        try {

            setSaving(true);

            await api.post("/Category", {
                name: categoryName.trim(),
                description: categoryDescription.trim()
            });

            await Swal.fire({
                icon: "success",
                title: "Başarılı",
                text: "Kategori başarıyla eklendi.",
                timer: 1500,
                showConfirmButton: false
            });

            // Formu temizle
            setCategoryName("");
            setCategoryDescription("");

            // Modalı kapat
            setShowAddModal(false);

            // Listeyi yeniden getir
            await getCategories();

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    error.response?.data?.message ||
                    "Kategori eklenemedi."
            });

        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (id) => {

        const result = await Swal.fire({
            icon: "warning",
            title: "Kategoriyi silmek istiyor musunuz?",
            text: "Bu işlem geri alınamaz.",
            showCancelButton: true,
            confirmButtonText: "Evet, Sil",
            cancelButtonText: "Vazgeç",
            confirmButtonColor: "#dc2626"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            await api.delete(`/Category/${id}`);

            await Swal.fire({
                icon: "success",
                title: "Silindi",
                text: "Kategori başarıyla silindi.",
                timer: 1500,
                showConfirmButton: false
            });

            getCategories();

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Hata",
                text:
                    error.response?.data?.message ||
                    "Kategori silinemedi."
            });
        }
    };


    return (
        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <span>KATEGORİ YÖNETİMİ</span>

                    <h2>Kategoriler</h2>

                    <p>
                        Kategorilerinizi buradan yönetebilirsiniz.
                    </p>
                </div>

                <button
                    className="admin-primary-button"
                    onClick={() => setShowAddModal(true)}
                >
                    + Kategori Ekle
                </button>

            </div>


            <div className="admin-card">

                <div className="admin-card-header">

                    <div>
                        <h3>Kategori Listesi</h3>

                        <span className="admin-card-count">
                            {categories.length} kategori
                        </span>
                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Kategoriler yükleniyor...
                    </div>

                ) : categories.length === 0 ? (

                    <div className="admin-empty">

                        <div className="admin-empty-icon">
                            🏷️
                        </div>

                        <strong>
                            Henüz kategori bulunmuyor.
                        </strong>

                        <span>
                            Yeni bir kategori ekleyerek başlayabilirsiniz.
                        </span>

                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kategori</th>
                                <th>Açıklama</th>
                                <th>Oluşturulma</th>
                                <th>İşlemler</th>
                            </tr>
                            </thead>

                            <tbody>

                            {categories.map((category) => (

                                <tr key={category.id}>

                                    <td>
                                        #{category.id}
                                    </td>

                                    <td>
                                        <strong>
                                            {category.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {category.description || "-"}
                                    </td>

                                    <td>
                                        {category.createdAt
                                            ? new Date(
                                                category.createdAt
                                            ).toLocaleDateString("tr-TR")
                                            : "-"
                                        }
                                    </td>

                                    <td>

                                        <div className="admin-actions">

                                            <button
                                                className="admin-edit-button"
                                            >
                                                Düzenle
                                            </button>

                                            <button
                                                className="admin-delete-button"
                                                onClick={() =>
                                                    handleDelete(category.id)
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


            {/* KATEGORİ EKLEME MODALI */}

            {showAddModal && (

                <div
                    className="category-modal-overlay"
                    onClick={() => setShowAddModal(false)}
                >

                    <div
                        className="category-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="category-modal-header">

                            <div>
                                <span>KATEGORİ YÖNETİMİ</span>
                                <h3>Yeni Kategori Ekle</h3>
                            </div>

                            <button
                                className="category-modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleAddCategory}>

                            <div className="category-form-group">

                                <label>
                                    Kategori Adı
                                </label>

                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    placeholder="Örn. Elektronik"
                                    autoFocus
                                />

                            </div>


                            <div className="category-form-group">

                                <label>
                                    Açıklama
                                </label>

                                <textarea
                                    value={categoryDescription}
                                    onChange={(e) =>
                                        setCategoryDescription(e.target.value)
                                    }
                                    placeholder="Kategori açıklaması..."
                                    rows="4"
                                />

                            </div>


                            <div className="category-modal-actions">

                                <button
                                    type="button"
                                    className="category-cancel-button"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Vazgeç
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Kaydediliyor..."
                                        : "Kategori Ekle"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminCategories;