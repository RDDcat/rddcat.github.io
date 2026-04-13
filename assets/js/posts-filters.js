(function () {
  "use strict";

  function parseInitialTags() {
    const params = new URLSearchParams(window.location.search);
    const raw = [];

    params.getAll("tags").forEach((value) => {
      value
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .forEach((tag) => raw.push(tag));
    });

    return new Set(raw);
  }

  function sortItems(items, mode) {
    const sorted = [...items].sort((a, b) => {
      const da = Number(a.dataset.date || 0);
      const db = Number(b.dataset.date || 0);
      return mode === "oldest" ? da - db : db - da;
    });

    const parent = items[0]?.parentElement;
    if (!parent) return;
    sorted.forEach((item) => parent.appendChild(item));
  }

  function renderActiveTags(container, selectedTags, onRemoveTag, onClear) {
    if (selectedTags.size === 0) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }

    container.hidden = false;
    const chips = [...selectedTags]
      .map(
        (tag) =>
          `<button type="button" class="posts-active-tags__chip" data-tag="${tag}">${tag} ×</button>`
      )
      .join("");

    container.innerHTML = `${chips}<button type="button" class="posts-active-tags__clear">초기화</button>`;

    container.querySelectorAll(".posts-active-tags__chip").forEach((btn) => {
      btn.addEventListener("click", () => onRemoveTag(btn.dataset.tag || ""));
    });

    const clearBtn = container.querySelector(".posts-active-tags__clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", onClear);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("posts-list");
    const sortButtons = Array.from(document.querySelectorAll(".posts-sort-btn"));
    const toggleBtn = document.getElementById("posts-tag-toggle");
    const tagPanel = document.getElementById("posts-tag-panel");
    const activeTags = document.getElementById("posts-active-tags");

    if (!list || sortButtons.length === 0 || !toggleBtn || !tagPanel || !activeTags) return;

    const items = Array.from(list.querySelectorAll(".posts-list__item"));
    const checkboxes = Array.from(
      tagPanel.querySelectorAll('input[type="checkbox"]')
    );
    const selectedTags = parseInitialTags();
    let sortMode = "latest";

    function applyFilters() {
      sortItems(items, sortMode);

      items.forEach((item) => {
        const tags = (item.dataset.tags || "")
          .split("|")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        if (selectedTags.size === 0) {
          item.hidden = false;
          return;
        }

        const hasMatch = [...selectedTags].some((tag) => tags.includes(tag));
        item.hidden = !hasMatch;
      });

      const count = selectedTags.size;
      toggleBtn.textContent = count > 0 ? `태그 선택 (${count})` : "태그 선택";

      renderActiveTags(
        activeTags,
        selectedTags,
        (tag) => {
          selectedTags.delete((tag || "").toLowerCase());
          syncCheckboxes();
          applyFilters();
        },
        () => {
          selectedTags.clear();
          syncCheckboxes();
          applyFilters();
        }
      );
    }

    function syncCheckboxes() {
      checkboxes.forEach((checkbox) => {
        const value = (checkbox.value || "").trim().toLowerCase();
        checkbox.checked = selectedTags.has(value);
      });
    }

    function setSortMode(nextMode) {
      sortMode = nextMode === "oldest" ? "oldest" : "latest";
      sortButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.sort === sortMode);
      });
      applyFilters();
    }

    sortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setSortMode(button.dataset.sort || "latest");
      });
    });

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const value = (checkbox.value || "").trim().toLowerCase();
        if (!value) return;
        if (checkbox.checked) selectedTags.add(value);
        else selectedTags.delete(value);
        applyFilters();
      });
    });

    toggleBtn.addEventListener("click", () => {
      tagPanel.hidden = !tagPanel.hidden;
    });

    document.addEventListener("click", (event) => {
      if (
        !tagPanel.hidden &&
        !tagPanel.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        tagPanel.hidden = true;
      }
    });

    syncCheckboxes();
    setSortMode("latest");
  });
})();
