import { auth, provider, db } from "./firebase/init.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");

  const newModal = document.getElementById("newSnippetModal");
  const snippetTitle = document.getElementById("snippetTitle");
  const snippetDescription = document.getElementById("snippetDescription");
  const snippetLanguage = document.getElementById("snippetLanguage");
  const snippetCode = document.getElementById("snippetCode");
  const snippetTags = document.getElementById("snippetTags");
  const snippetPrivate = document.getElementById("snippetPrivate");

  const saveBtn = document.getElementById("saveSnippetBtn");

  function updateUserUI() {
    const userInfo = document.querySelector(".sidebar .text-sm");
    const userName = document.querySelector(".sidebar .text-gray-800");

    if (userName && userInfo && settingsBtn) {
      if (currentUser) {
        userName.textContent = currentUser.displayName || "User";
        userInfo.textContent = currentUser.email;
        settingsBtn.textContent = "Logout";
      } else {
        userName.textContent = "Guest";
        userInfo.textContent = "Not logged in";
        settingsBtn.textContent = "Login";
      }
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        settingsModal?.classList.add("hidden");
        updateUserUI();
        loadSnippets();
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      if (currentUser) {
        signOut(auth).then(() => {
          currentUser = null;
          updateUserUI();
          clearSnippets();
        });
      } else {
        settingsModal?.classList.remove("hidden");
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUserUI();
    if (user) loadSnippets();
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      if (!currentUser) return alert("You must be logged in");

      const title = snippetTitle.value;
      const desc = snippetDescription.value;
      const code = snippetCode.value;
      const language = snippetLanguage.value;
      const tags = snippetTags.value.split(",").map(t => t.trim()).filter(Boolean);
      const isPrivate = snippetPrivate.checked;

      if (!title || !code) return alert("Title and code are required");

      const snippet = {
        title,
        description: desc,
        code,
        language,
        tags,
        is_private: isPrivate,
        created_by: currentUser.uid,
        created_at: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "snippets"), snippet);
        newModal?.classList.add("hidden");
        loadSnippets();
      } catch (err) {
        alert("Failed to save snippet: " + err.message);
      }
    });
  }

  async function loadSnippets() {
    const grid = document.querySelector(".snippet-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const q = query(collection(db, "snippets"), orderBy("created_at", "desc"));
    const snap = await getDocs(q);

    snap.forEach(doc => {
      const data = doc.data();
      if (!data.is_private || data.created_by === currentUser?.uid) {
        const card = document.createElement("div");
        card.className = "snippet-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition duration-200";
        card.innerHTML = `
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="font-medium text-gray-800 dark:text-white">${data.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${data.description || ""}</p>
          </div>
          <div class="p-4"><pre class="syntax-highlight text-sm p-3 rounded overflow-x-auto"><code>${data.code}</code></pre></div>
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
            <div class="flex flex-wrap gap-1">${(data.tags || []).map(tag =>
              `<span class="tag bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">${tag}</span>`).join("")}</div>
          </div>`;
        grid.appendChild(card);
      }
    });
  }

  function clearSnippets() {
    const grid = document.querySelector(".snippet-grid");
    if (grid) grid.innerHTML = "";
  }
});
