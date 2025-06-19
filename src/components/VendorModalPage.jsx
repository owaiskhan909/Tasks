import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { db } from "../lib/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

Modal.setAppElement("#root");

function VendorModalPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    gstNumber: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    type: "business",
  });
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [vendorIds, setVendorIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editIndex, setEditIndex] = useState(null);

  const vendorsPerPage = 5;

  const fetchVendors = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = [],
      ids = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.data().type === "business") {
        data.push({ id: docSnap.id, ...docSnap.data() });
        ids.push(docSnap.id);
      }
    });
    setVendors(data);
    setVendorIds(ids);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (showModal && editIndex === null) {
      setForm({
        businessName: "",
        ownerName: "",
        gstNumber: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        type: "business",
      });
      setErrors({});
    }
  }, [showModal, editIndex]);

  useEffect(() => {
    const totalPages = Math.ceil(vendors.length / vendorsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [vendors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    let error = "";
    if (name === "businessName" && !value.trim())
      error = "Business name is required";
    if (name === "ownerName" && !value.trim()) error = "Owner name is required";
    if (name === "gstNumber" && (!value.trim() || !/^\d{11,15}$/.test(value)))
      error = "Valid GST number required";
    if (
      name === "contactEmail" &&
      (!value.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
    )
      error = "Valid email required";
    if (
      name === "contactPhone" &&
      (!value.trim() || !/^\d{10,15}$/.test(value))
    )
      error = "Valid phone required";
    if (name === "address" && !value.trim()) error = "Address required";

    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner name required";
    if (!/^\d{11,15}$/.test(form.gstNumber))
      newErrors.gstNumber = "Valid GST required";
    if (
      !form.contactEmail.trim() ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.contactEmail)
    )
      newErrors.contactEmail = "Valid email required";
    if (!/^\d{10,15}$/.test(form.contactPhone))
      newErrors.contactPhone = "Valid phone required";
    if (!form.address.trim()) newErrors.address = "Address required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editIndex !== null) {
      const docRef = doc(db, "users", vendorIds[editIndex]);
      await updateDoc(docRef, form);
    } else {
      await addDoc(collection(db, "users"), {
        ...form,
        customId: Date.now().toString(),
      });
    }

    setShowModal(false);
    setEditIndex(null);
    setErrors({});
    setForm({
      businessName: "",
      ownerName: "",
      gstNumber: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      type: "business",
    });

    await fetchVendors();
    const newTotal = vendors.length + 1;
    setCurrentPage(Math.ceil(newTotal / vendorsPerPage));
  };

  const handleDelete = async (indexToDelete) => {
    const vendorId = vendorIds[indexToDelete];
    await deleteDoc(doc(db, "users", vendorId));

    const productSnap = await getDocs(
      query(collection(db, "products"), where("vendorId", "==", vendorId))
    );
    productSnap.forEach(async (productDoc) => {
      await deleteDoc(doc(db, "products", productDoc.id));
    });

    const updated = [...vendors];
    updated.splice(indexToDelete, 1);
    const idUpdated = [...vendorIds];
    idUpdated.splice(indexToDelete, 1);
    setVendors(updated);
    setVendorIds(idUpdated);

    const newTotalPages = Math.ceil(updated.length / vendorsPerPage);
    setCurrentPage((prev) => Math.min(prev, newTotalPages || 1));
  };

  const totalPages = Math.ceil(vendors.length / vendorsPerPage);
  const startIndex = (currentPage - 1) * vendorsPerPage;
  const currentVendors = vendors.slice(startIndex, startIndex + vendorsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
        <button
          onClick={() => {
            setForm({
              businessName: "",
              ownerName: "",
              gstNumber: "",
              contactEmail: "",
              contactPhone: "",
              address: "",
              type: "business",
            });
            setEditIndex(null);
            setShowModal(true);
            setErrors({});
          }}
          className="bg-green-600 text-white px-6 py-2 cursor-pointer rounded hover:bg-green-700 transition"
        >
          + Add Vendor
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        {vendors.length === 0 ? (
          <p className="text-gray-500">No vendors added yet.</p>
        ) : (
          <>
            <ul className="space-y-5">
              {currentVendors.map((vendor, index) => {
                const vendorIndex = startIndex + index;
                return (
                  <li
                    key={vendorIndex}
                    className="relative border p-5 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="absolute right-4 top-4 flex flex-col gap-2">
                      <Link
                        to={`/vendors/${vendor.id}`}
                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                        title="View"
                      >
                        <FaEye size={18} />
                      </Link>
                      <button
                        onClick={() => {
                          setForm(vendor);
                          setEditIndex(vendorIndex);
                          setShowModal(true);
                          setErrors({});
                        }}
                        className="text-yellow-600 cursor-pointer hover:text-yellow-800"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendorIndex)}
                        className="text-red-600 cursor-pointer hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                    <p>
                      <strong>Business:</strong> {vendor.businessName}
                    </p>
                    <p>
                      <strong>Owner:</strong> {vendor.ownerName}
                    </p>
                    <p>
                      <strong>GST:</strong> {vendor.gstNumber}
                    </p>
                    <p>
                      <strong>Email:</strong> {vendor.contactEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {vendor.contactPhone}
                    </p>
                    <p>
                      <strong>Address:</strong> {vendor.address}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Vendor Form"
        className="relative w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl p-8"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {editIndex !== null ? "Edit Vendor" : "Add Vendor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "businessName", placeholder: "Business Name" },
            { name: "ownerName", placeholder: "Owner Name" },
            { name: "gstNumber", placeholder: "GST Number" },
            {
              name: "contactEmail",
              placeholder: "Contact Email",
              type: "email",
            },
            { name: "contactPhone", placeholder: "Contact Phone" },
            { name: "address", placeholder: "Business Address" },
          ].map(({ name, placeholder, type = "text" }) => (
            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors[name] && (
                <p className="text-red-500 text-sm">{errors[name]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 cursor-pointer text-white rounded hover:bg-green-700"
            >
              {editIndex !== null ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VendorModalPage;
