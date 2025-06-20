import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "react-modal";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaLink,
  FaList,
} from "react-icons/fa";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

Modal.setAppElement("#root");

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editingType, setEditingType] = useState("");
  const [linkError, setLinkError] = useState("");

  const itemsPerPage = 5;
  const [linkPage, setLinkPage] = useState(1);
  const [descPage, setDescPage] = useState(1);

  // 🔁 REPLACED LOCAL STORAGE with Firebase Fetch
  const fetchUserData = async () => {
    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();

      const linksSnap = await getDocs(collection(db, `users/${id}/links`));
      const listsSnap = await getDocs(collection(db, `users/${id}/lists`));

      userData.links = linksSnap.docs.map((doc) => doc.data().value);
      userData.descriptions = listsSnap.docs.map((doc) => doc.data().value);

      setUser(userData);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [id]);

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddLink = async () => {
    if (!newLink.trim()) return setLinkError("Link cannot be empty");
    if (!validateUrl(newLink.trim())) return setLinkError("Invalid URL");

    const linksRef = collection(db, `users/${id}/links`);

    if (editingType === "link" && editIndex !== null) {
      const linkDocs = await getDocs(linksRef);
      const docId = linkDocs.docs[editIndex]?.id;
      if (docId)
        await updateDoc(doc(db, `users/${id}/links/${docId}`), {
          value: newLink.trim(),
        });
    } else {
      await setDoc(doc(linksRef), { value: newLink.trim() });
    }

    setNewLink("");
    setEditIndex(null);
    setEditingType("");
    setShowLinkModal(false);
    setLinkError("");
    fetchUserData();
  };

  const handleAddDesc = async () => {
    if (!newDesc.trim()) return;

    const listsRef = collection(db, `users/${id}/lists`);

    if (editingType === "desc" && editIndex !== null) {
      const descDocs = await getDocs(listsRef);
      const docId = descDocs.docs[editIndex]?.id;
      if (docId)
        await updateDoc(doc(db, `users/${id}/lists/${docId}`), {
          value: newDesc.trim(),
        });
    } else {
      await setDoc(doc(listsRef), { value: newDesc.trim() });
    }

    setNewDesc("");
    setEditIndex(null);
    setEditingType("");
    setShowListModal(false);
    fetchUserData();
  };

  const handleDelete = async (type, index) => {
    const refPath =
      type === "links" ? `users/${id}/links` : `users/${id}/lists`;
    const snap = await getDocs(collection(db, refPath));
    const docId = snap.docs[index]?.id;
    if (docId) await deleteDoc(doc(db, `${refPath}/${docId}`));
    fetchUserData();
  };

  const handleEdit = async (type, index) => {
    setEditIndex(index);
    setEditingType(type);
    if (type === "link") {
      setNewLink(user.links[index]);
      setShowLinkModal(true);
    } else {
      setNewDesc(user.descriptions[index]);
      setShowListModal(true);
    }
  };

  const paginate = (data = [], page) =>
    data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading user...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-block text-blue-600 hover:underline text-sm mb-4"
        >
          ← Back to Users
        </Link>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            User Info
          </h2>
          <div className="space-y-2 text-gray-700 text-sm">
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
            <p>
              <strong>Type:</strong> {user.type}
            </p>
          </div>
        </div>

        {/* 🔗 Links Section */}
        <div className="bg-white rounded-xl shadow p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-700">Links</h3>
            <button
              onClick={() => {
                setNewLink("");
                setLinkError("");
                setEditIndex(null);
                setEditingType("link");
                setShowLinkModal(true);
              }}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:cursor-pointer"
            >
              <FaLink /> Add Link
            </button>
          </div>
          {user.links?.length > 0 ? (
            <>
              <ul className="text-sm space-y-2">
                {paginate(user.links, linkPage).map((link, i) => {
                  const fullIndex = (linkPage - 1) * itemsPerPage + i;
                  return (
                    <li
                      key={i}
                      className="flex justify-between items-center border-b pb-1"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline truncate max-w-[220px]"
                      >
                        {link}
                      </a>
                      <div className="flex gap-2 text-lg">
                        <FaEdit
                          onClick={() => handleEdit("link", fullIndex)}
                          className="cursor-pointer text-blue-500"
                        />
                        <FaTrash
                          onClick={() => handleDelete("links", fullIndex)}
                          className="cursor-pointer text-red-500"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-600">
                <button
                  onClick={() => setLinkPage((p) => Math.max(p - 1, 1))}
                  disabled={linkPage === 1}
                  className="text-blue-500"
                >
                  <FaArrowLeft />
                </button>
                <span>{linkPage}</span>
                <button
                  onClick={() =>
                    setLinkPage((p) =>
                      p * itemsPerPage < user.links.length ? p + 1 : p
                    )
                  }
                  disabled={linkPage * itemsPerPage >= user.links.length}
                  className="text-blue-500"
                >
                  <FaArrowRight />
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No links added.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-indigo-700">List</h3>
            <button
              onClick={() => {
                setNewDesc("");
                setEditIndex(null);
                setEditingType("desc");
                setShowListModal(true);
              }}
              className="bg-indigo-600 cursor-pointer text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
            >
              <FaList /> Add List
            </button>
          </div>
          {user.descriptions?.length > 0 ? (
            <>
              <ul className="text-sm space-y-2">
                {paginate(user.descriptions, descPage).map((desc, i) => {
                  const fullIndex = (descPage - 1) * itemsPerPage + i;
                  return (
                    <li
                      key={i}
                      className="flex justify-between items-center border-b pb-1"
                    >
                      <p className="break-words whitespace-pre-wrap flex-1">
                        {desc}
                      </p>
                      <div className="flex gap-2 text-lg">
                        <FaEdit
                          onClick={() => handleEdit("desc", fullIndex)}
                          className="cursor-pointer text-blue-500"
                        />
                        <FaTrash
                          onClick={() =>
                            handleDelete("descriptions", fullIndex)
                          }
                          className="cursor-pointer text-red-500"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-600">
                <button
                  onClick={() => setDescPage((p) => Math.max(p - 1, 1))}
                  disabled={descPage === 1}
                  className="text-blue-500"
                >
                  <FaArrowLeft />
                </button>
                <span>{descPage}</span>
                <button
                  onClick={() =>
                    setDescPage((p) =>
                      p * itemsPerPage < user.descriptions.length ? p + 1 : p
                    )
                  }
                  disabled={descPage * itemsPerPage >= user.descriptions.length}
                  className="text-blue-500"
                >
                  <FaArrowRight />
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No descriptions added.</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={showLinkModal}
        onRequestClose={() => setShowLinkModal(false)}
        className="w-[90%] max-w-md bg-white rounded-xl p-6 mx-auto"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center"
      >
        <h3 className="text-xl font-semibold mb-4">
          {editIndex !== null ? "Edit" : "Add"} Link
        </h3>
        <input
          type="text"
          placeholder="Enter URL"
          value={newLink}
          onChange={(e) => {
            const value = e.target.value;
            setNewLink(value);
            if (!value.trim()) setLinkError("Link cannot be empty");
            else if (!validateUrl(value)) setLinkError("Invalid URL");
            else setLinkError("");
          }}
          className="w-full border px-4 py-2 rounded mb-1"
          autoFocus
        />
        {linkError && <p className="text-red-500 text-sm mb-2">{linkError}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setShowLinkModal(false)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddLink}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* 🧩 List Modal */}
      <Modal
        isOpen={showListModal}
        onRequestClose={() => setShowListModal(false)}
        className="w-[90%] max-w-md bg-white rounded-xl p-6 mx-auto"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center"
      >
        <h3 className="text-xl font-semibold mb-4">
          {editIndex !== null ? "Edit" : "Add"} Description
        </h3>
        <textarea
          placeholder="Write description..."
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full border px-4 py-2 rounded h-28 mb-4 resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowListModal(false)}
            className="bg-gray-200 cursor-pointer px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddDesc}
            className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default UserDetails;
