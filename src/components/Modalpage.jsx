import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root");

function ModalPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    type: "user",
  });
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editIndex, setEditIndex] = useState(null);

  const usersPerPage = 10;

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    if (showModal && editIndex === null) {
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        age: "",
        type: "user",
      });
      setErrors({});
    }
  }, [showModal, editIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    let error = "";
    if (name === "name" && !value.trim()) error = "Name is required";
    if (
      name === "email" &&
      (!value.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
    ) {
      error = "Valid email is required";
    }
    if (name === "phone" && (!value.trim() || !/^\d{10,15}$/.test(value))) {
      error = "Phone must be 10-15 digits";
    }
    if (name === "address" && !value.trim()) error = "Address is required";
    if (
      name === "age" &&
      (!value.trim() || isNaN(value) || Number(value) <= 0)
    ) {
      error = "Valid age is required";
    }

    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (
      !form.email.trim() ||
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)
    ) {
      newErrors.email = "Valid email is required";
    }
    if (!form.phone.trim() || !/^\d{10,15}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10-15 digits";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.age.trim() || isNaN(form.age) || Number(form.age) <= 0) {
      newErrors.age = "Valid age is required";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let updatedUsers;
    if (editIndex !== null) {
      updatedUsers = [...users];
      updatedUsers[editIndex] = form;
    } else {
      updatedUsers = [...users, form];
    }

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowModal(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      age: "",
      type: "user",
    });
    setEditIndex(null);
    setErrors({});
    const totalPages = Math.ceil(updatedUsers.length / usersPerPage);
    setCurrentPage(totalPages);
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDelete = (indexToDelete) => {
    const updatedUsers = users.filter((_, idx) => idx !== indexToDelete);
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    const lastPage = Math.max(1, Math.ceil(updatedUsers.length / usersPerPage));
    setCurrentPage((prev) => Math.min(prev, lastPage));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between gap-6">
        <div>
          <button
            onClick={() => {
              setForm({
                name: "",
                email: "",
                phone: "",
                address: "",
                age: "",
                type: "user",
              });
              setEditIndex(null);
              setShowModal(true);
              setErrors({});
            }}
            className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            + Add User
          </button>
        </div>

        <div className="bg-white shadow-md rounded p-6 flex-1">
          <h2 className="text-xl font-semibold mb-4">Saved Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users yet.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {currentUsers.map((user, index) => {
                  const userIndex = startIndex + index;
                  return (
                    <li
                      key={userIndex}
                      className="border p-4 rounded bg-gray-50 shadow-sm relative"
                    >
                      <div className="absolute right-4 top-4 flex flex-col items-center gap-2">
                        <Link
                          to={`/users/${userIndex}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setForm(user);
                            setEditIndex(userIndex);
                            setShowModal(true);
                            setErrors({});
                          }}
                          className="text-yellow-600 cursor-pointer hover:text-yellow-800"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(userIndex)}
                          className="text-red-600 cursor-pointer hover:text-red-800"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                      <p>
                        <strong>Name:</strong> {user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {user.phone}
                      </p>
                      <p>
                        <strong>Address:</strong> {user.address}
                      </p>
                      <p>
                        <strong>Age:</strong> {user.age}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 cursor-pointer py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 cursor-pointer py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="User Form Modal"
        className="relative w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl p-8 transition-all duration-300 outline-none"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {editIndex !== null ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-md"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-md"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-md"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-md"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-md"
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

          <input type="hidden" name="type" value={form.type} />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md"
            >
              {editIndex !== null ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ModalPage;
