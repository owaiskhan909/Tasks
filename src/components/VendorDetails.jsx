import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "react-modal";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { db } from "../lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";

Modal.setAppElement("#root");

function VendorDetails() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [productIdList, setProductIdList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 2;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    images: [""],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return;
      const vendorRef = doc(db, "users", id);
      const docSnap = await getDoc(vendorRef);
      if (docSnap.exists() && docSnap.data().type === "business") {
        setVendor(docSnap.data());
      } else {
        setVendor(null);
      }
    };
    fetchVendor();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchProducts = async () => {
      const q = query(collection(db, "products"), where("vendorId", "==", id));
      const querySnapshot = await getDocs(q);
      const productsData = [];
      const ids = [];
      querySnapshot.forEach((doc) => {
        productsData.push(doc.data());
        ids.push(doc.id);
      });
      setProducts(productsData);
      setProductIdList(ids);
    };
    fetchProducts();
  }, [id]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      description: "",
      images: [""],
    });
    setErrors({});
    setEditIndex(null);
  };

  const validate = (formData = form) => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Required";
    if (!formData.price.trim() || isNaN(formData.price))
      errs.price = "Valid price required";
    if (!formData.category.trim()) errs.category = "Required";
    if (!formData.description.trim()) errs.description = "Required";
    if (!formData.images.filter((i) => i.trim()).length)
      errs.images = "At least one image link required";
    return errs;
  };

  const validateField = (name, value) => {
    let error = "";
    if (["name", "category", "description"].includes(name)) {
      if (!value.trim()) error = "Required";
    } else if (name === "price") {
      if (!value.trim() || isNaN(value)) error = "Valid price required";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleImageChange = (i, val) => {
    const updatedImages = [...form.images];
    updatedImages[i] = val;
    const updatedForm = { ...form, images: updatedImages };
    setForm(updatedForm);

    const hasValidImage = updatedImages.some((img) => img.trim() !== "");
    setErrors((prev) => ({
      ...prev,
      images: hasValidImage ? "" : "At least one image link required",
    }));
  };

  const addImage = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const removeImage = (i) => {
    const imgs = [...form.images];
    imgs.splice(i, 1);
    const updatedForm = { ...form, images: imgs };
    setForm(updatedForm);

    const hasValidImage = imgs.some((img) => img.trim() !== "");
    setErrors((prev) => ({
      ...prev,
      images: hasValidImage ? "" : "At least one image link required",
    }));
  };

  const handleSave = async () => {
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const payload = {
      ...form,
      images: form.images.filter((i) => i.trim()),
      vendorId: id,
    };

    if (editIndex !== null) {
      const docRef = doc(db, "products", productIdList[editIndex]);
      await updateDoc(docRef, payload);
    } else {
      await addDoc(collection(db, "products"), payload);
    }

    setShowModal(false);
    resetForm();

    const q = query(collection(db, "products"), where("vendorId", "==", id));
    const snapshot = await getDocs(q);
    const data = [],
      ids = [];
    snapshot.forEach((doc) => {
      data.push(doc.data());
      ids.push(doc.id);
    });
    setProducts(data);
    setProductIdList(ids);
    setCurrentPage(1);
  };

  const handleEdit = (i) => {
    setEditIndex(i);
    setForm(products[i]);
    setShowModal(true);
  };

  const handleDelete = async (i) => {
    const docId = productIdList[i];
    await deleteDoc(doc(db, "products", docId));
    const filtered = [...products];
    filtered.splice(i, 1);
    const idFiltered = [...productIdList];
    idFiltered.splice(i, 1);
    setProducts(filtered);
    setProductIdList(idFiltered);
  };

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (!vendor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Vendor not found...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <Link
        to="/vendors"
        className="text-blue-600 cursor-pointer hover:underline"
      >
        ← Back to Vendors
      </Link>

      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            Vendor Information
          </h2>
          <div className="space-y-3 text-gray-700">
            {[
              ["Business Name", "businessName"],
              ["Owner Name", "ownerName"],
              ["Contact Email", "contactEmail"],
              ["Contact Phone", "contactPhone"],
              ["Address", "address"],
              ["GST Number", "gstNumber"],
            ].map(([label, key]) => (
              <div key={key} className="flex gap-2">
                <span className="font-semibold w-40">{label}:</span>
                <span className="flex-1">{vendor[key] || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Products</h3>
            <button
              className="flex items-center gap-1 cursor-pointer bg-green-600 text-white px-3 py-2 rounded"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FaPlus /> Add Product
            </button>
          </div>

          {paginatedProducts.length === 0 ? (
            <p className="text-gray-500">No products added.</p>
          ) : (
            paginatedProducts.map((p, i) => {
              const actualIndex = (currentPage - 1) * productsPerPage + i;
              return (
                <div
                  key={actualIndex}
                  className="flex items-center justify-between bg-gray-50 border rounded p-3 mb-2"
                >
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 ml-4">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm">
                      {p.category} | Rs.{p.price}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <FaEdit
                      onClick={() => handleEdit(actualIndex)}
                      className="text-yellow-600 cursor-pointer"
                    />
                    <FaTrash
                      onClick={() => handleDelete(actualIndex)}
                      className="text-red-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300"
                    : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300"
                    : "bg-blue-500 cursor-pointer text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className="relative w-[90%] max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
      >
        <h2 className="text-xl font-bold text-center px-6 pt-6">
          {editIndex !== null ? "Edit Product" : "Add Product"}
        </h2>

        <div className="overflow-y-auto px-6 py-4 flex-1">
          {["name", "price", "category", "description"].map((field) => (
            <div key={field} className="mb-4">
              <label className="block mb-1 capitalize">{field}</label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                type={field === "price" ? "number" : "text"}
                placeholder={`Enter ${field}`}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]}</p>
              )}
            </div>
          ))}

          <div className="mb-2">
            <label className="block mb-1">Image Links</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={img}
                  required
                  onChange={(e) => handleImageChange(i, e.target.value)}
                  placeholder={`Image URL #${i + 1}`}
                  className="flex-1 border px-3 py-2 rounded"
                />
                {i > 0 && (
                  <FaTrash
                    onClick={() => removeImage(i)}
                    className="text-red-600 cursor-pointer"
                  />
                )}
              </div>
            ))}
            {errors.images && (
              <p className="text-red-500 text-sm">{errors.images}</p>
            )}
            <button
              type="button"
              className="flex items-center cursor-pointer gap-1 text-green-600 mt-1"
              onClick={addImage}
            >
              <FaPlus /> Add Another Image
            </button>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-white sticky bottom-0 rounded-b-2xl">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-200 cursor-pointer rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-green-600 cursor-pointer text-white rounded hover:bg-green-700"
          >
            {editIndex !== null ? "Update" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default VendorDetails;
