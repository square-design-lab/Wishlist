/* SDL Wishlist v1.0 | square-design-lab */
(function () {
  if (window.__SDL_WISHLIST_LOADED) return;
  window.__SDL_WISHLIST_LOADED = true;

  var C = window.SDL_WISHLIST_CONFIG || {};

  var D = {
    wishlistPageSlug: "/wishlist",
    heartPosition: "top-right",
    heartSize: 22,
    heartColor: "#e74c3c",
    heartOutlineColor: "#666666",
    showOnStorePage: true,
    showOnProductPage: true,
    addToCartFromWishlist: true,
    sendWishlistLabel: "Send Wishlist",
    addToCartLabel: "Add to Cart",
    removeLabel: "Remove",
    emptyMessage: "Your wishlist is empty.",
    emptyBrowseLabel: "Continue Shopping",
    emptyBrowseLink: "/store",
    wishlistTitle: "Wishlist",
    headerIcon: true,
    headerIconPosition: "before-cart",
    fieldName: "Wishlist",
    includePrices: true,
    includeProductUrl: true,
    labelItem: "Item",
    labelTitle: "Title",
    labelPrice: "Price",
    summaryText: "Wishlist contains",
    filterByTag: false,
    enquiryTag: "wishlist",
    executionDelay: 500
  };

  function cfg(k) { return C[k] !== undefined ? C[k] : D[k]; }

  var S = {
    productListItem: ".product-list-item",
    productListImageWrapper: ".product-list-image-wrapper",
    addToCartBtn: ".sqs-add-to-cart-button",
    cartIcon: ".header-actions .header-actions-action--cart, .header-cart",
    footerLightbox: "footer .lightbox-handle",
    formLabel: ".lightbox-inner label.title"
  };

  var STORE_KEY = "sdl_wishlist";

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    updateHeaderBadge();
    if (isWishlistPage()) renderWishlistPage();
  }

  function isInWishlist(url) {
    return getWishlist().some(function (item) { return item.url === url; });
  }

  function addToWishlist(data) {
    var list = getWishlist();
    if (list.some(function (item) { return item.url === data.url; })) return;
    list.push(data);
    saveWishlist(list);
  }

  function removeFromWishlist(url) {
    var list = getWishlist().filter(function (item) { return item.url !== url; });
    saveWishlist(list);
  }

  function toggleWishlist(data) {
    if (isInWishlist(data.url)) {
      removeFromWishlist(data.url);
      return false;
    }
    addToWishlist(data);
    return true;
  }

  /* ── heart SVG ─────────────────────────────────────────────────────── */
  var HEART_OUTLINE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var HEART_FILLED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  function createHeartBtn(url, size) {
    var btn = document.createElement("button");
    btn.className = "sdl-wishlist-heart";
    btn.setAttribute("aria-label", "Toggle wishlist");
    btn.style.width = (size || cfg("heartSize")) + "px";
    btn.style.height = (size || cfg("heartSize")) + "px";
    updateHeartState(btn, url);
    return btn;
  }

  function updateHeartState(btn, url) {
    var active = isInWishlist(url);
    btn.innerHTML = active ? HEART_FILLED : HEART_OUTLINE;
    btn.classList.toggle("sdl-wishlist-heart--active", active);
    btn.style.color = active ? cfg("heartColor") : cfg("heartOutlineColor");
  }

  function updateAllHearts() {
    document.querySelectorAll(".sdl-wishlist-heart[data-url]").forEach(function (btn) {
      updateHeartState(btn, btn.getAttribute("data-url"));
    });
  }

  /* ── helpers ────────────────────────────────────────────────────────── */
  function isProductPage() {
    return /\/p\//.test(window.location.pathname) || !!document.querySelector(".ProductItem");
  }

  function isStorePage() {
    return !!document.querySelector(S.productListItem);
  }

  function isWishlistPage() {
    var slug = cfg("wishlistPageSlug");
    return window.location.pathname === slug || window.location.pathname === slug + "/";
  }

  function slugify(tag) {
    return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function shouldApplyToItem(listItem) {
    if (!cfg("filterByTag")) return true;
    return listItem.classList.contains("tag-" + slugify(cfg("enquiryTag")));
  }

  function triggerReact(el, val) {
    var desc = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
    desc.set.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* ── store page: hearts on product images ───────────────────────── */
  function setupStorePageHearts() {
    if (!cfg("showOnStorePage")) return;
    var items = document.querySelectorAll(S.productListItem);
    items.forEach(function (item) {
      if (item.querySelector(".sdl-wishlist-heart")) return;
      if (!shouldApplyToItem(item)) return;

      var link = item.querySelector("a[href*='/p/']");
      if (!link) return;
      var url = link.getAttribute("href");
      var fullUrl = url.startsWith("http") ? url : window.location.origin + url;

      var titleEl = item.querySelector(".product-list-item-title, .product-list-title, .product-title");
      var title = titleEl ? titleEl.textContent.trim() : "";

      var priceEl = item.querySelector(".product-price, .product-list-item-price, .sqs-money-native");
      var price = priceEl ? priceEl.textContent.trim() : "";

      var imgEl = item.querySelector("img");
      var image = imgEl ? imgEl.src : "";

      var imageWrapper = item.querySelector(S.productListImageWrapper);
      if (!imageWrapper) imageWrapper = item.querySelector(".grid-image-wrapper, figure");
      if (!imageWrapper) return;

      var pos = cfg("heartPosition");
      imageWrapper.style.position = "relative";

      var btn = createHeartBtn(fullUrl, cfg("heartSize"));
      btn.setAttribute("data-url", fullUrl);
      btn.classList.add("sdl-wishlist-heart--" + pos);

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist({ url: fullUrl, title: title, price: price, image: image });
        updateHeartState(btn, fullUrl);
      });

      imageWrapper.appendChild(btn);
    });
  }

  /* ── product detail page: heart button ──────────────────────────── */
  function setupProductPageHeart() {
    if (!cfg("showOnProductPage")) return;
    if (!isProductPage()) return;
    if (document.querySelector(".sdl-wishlist-heart-pdp")) return;

    var titleEl = document.querySelector(".ProductItem-details-title, .product-title, h1.pdp-product-title");
    var title = titleEl ? titleEl.innerText.trim() : "";

    var priceEl = document.querySelector(".product-price, .sqs-money-native");
    var price = priceEl ? priceEl.innerText.trim() : "";

    var imgEl = document.querySelector(".ProductItem-gallery img, .pdp-gallery img, .product-image img");
    var image = imgEl ? imgEl.src : "";

    var url = window.location.origin + window.location.pathname;

    var controlsRow = document.querySelector(".product-purchase-controls-wrapper");
    if (!controlsRow) controlsRow = document.querySelector(".product-add-to-cart-layout-wrapper");
    var insertTarget = controlsRow ? controlsRow.parentElement : null;
    if (!insertTarget) {
      var addBtn = document.querySelector(S.addToCartBtn);
      insertTarget = addBtn ? addBtn.parentElement : null;
    }
    if (!insertTarget) return;

    var wrapper = document.createElement("div");
    wrapper.className = "sdl-wishlist-heart-pdp";

    var btn = createHeartBtn(url, 24);
    btn.setAttribute("data-url", url);

    var label = document.createElement("span");
    label.className = "sdl-wishlist-pdp-label";
    label.textContent = isInWishlist(url) ? "Remove from Wishlist" : "Add to Wishlist";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var added = toggleWishlist({ url: url, title: title, price: price, image: image });
      updateHeartState(btn, url);
      label.textContent = added ? "Remove from Wishlist" : "Add to Wishlist";
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(label);

    if (controlsRow && controlsRow.parentElement) {
      controlsRow.parentElement.insertBefore(wrapper, controlsRow.nextSibling);
    } else {
      insertTarget.appendChild(wrapper);
    }
  }

  /* ── header icon with badge ─────────────────────────────────────── */
  function setupHeaderIcon() {
    if (!cfg("headerIcon")) return;
    if (document.querySelector(".sdl-wishlist-header-icon")) return;

    var container = document.createElement("a");
    container.className = "sdl-wishlist-header-icon";
    container.href = cfg("wishlistPageSlug");
    container.setAttribute("aria-label", "Wishlist");

    container.innerHTML = HEART_OUTLINE;
    var svg = container.querySelector("svg");
    svg.style.width = "20px";
    svg.style.height = "20px";

    var badge = document.createElement("span");
    badge.className = "sdl-wishlist-badge";
    badge.textContent = "0";
    container.appendChild(badge);

    var cartLink = document.querySelector(S.cartIcon);
    if (!cartLink) {
      cartLink = document.querySelector("a[href='/cart'], .header-actions-action--cart");
    }

    if (cartLink) {
      var parent = cartLink.parentElement;
      if (cfg("headerIconPosition") === "before-cart") {
        parent.insertBefore(container, cartLink);
      } else {
        parent.insertBefore(container, cartLink.nextSibling);
      }
    } else {
      var header = document.querySelector(".header-actions, .Header-nav--right, header nav");
      if (header) header.appendChild(container);
    }

    updateHeaderBadge();
  }

  function updateHeaderBadge() {
    var badge = document.querySelector(".sdl-wishlist-badge");
    if (!badge) return;
    var count = getWishlist().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  /* ── wishlist page rendering ────────────────────────────────────── */
  function renderWishlistPage() {
    if (!isWishlistPage()) return;

    var container = document.querySelector(".sdl-wishlist-container");
    if (!container) {
      var codeBlock = document.querySelector(".sqs-block-code .sqs-block-content .sqs-code-container");
      if (!codeBlock) {
        codeBlock = document.querySelector(".sqs-block-code .sqs-block-content");
      }
      if (!codeBlock) return;

      container = document.createElement("div");
      container.className = "sdl-wishlist-container";
      codeBlock.appendChild(container);
    }

    var list = getWishlist();

    if (list.length === 0) {
      container.innerHTML =
        '<div class="sdl-wishlist-empty">' +
          '<div class="sdl-wishlist-empty-heart">' + HEART_OUTLINE + '</div>' +
          '<p class="sdl-wishlist-empty-msg">' + cfg("emptyMessage") + '</p>' +
          '<a class="sdl-wishlist-empty-browse" href="' + cfg("emptyBrowseLink") + '">' + cfg("emptyBrowseLabel") + '</a>' +
        '</div>';
      return;
    }

    var html = '<div class="sdl-wishlist-header">' +
      '<h2 class="sdl-wishlist-title">' + cfg("wishlistTitle") + '</h2>' +
      '<span class="sdl-wishlist-count">' + list.length + ' item' + (list.length !== 1 ? 's' : '') + '</span>' +
    '</div>' +
    '<div class="sdl-wishlist-grid">';

    list.forEach(function (item) {
      html += '<div class="sdl-wishlist-item" data-url="' + item.url + '">' +
        '<div class="sdl-wishlist-item-image">' +
          '<a href="' + item.url + '">' +
            (item.image ? '<img src="' + item.image + '" alt="' + (item.title || '') + '" loading="lazy" />' : '<div class="sdl-wishlist-item-placeholder"></div>') +
          '</a>' +
          '<button class="sdl-wishlist-heart sdl-wishlist-heart--active sdl-wishlist-heart--overlay" data-url="' + item.url + '" aria-label="Remove from wishlist" style="color:' + cfg("heartColor") + '">' + HEART_FILLED + '</button>' +
        '</div>' +
        '<div class="sdl-wishlist-item-info">' +
          '<a href="' + item.url + '" class="sdl-wishlist-item-title">' + (item.title || 'Product') + '</a>' +
          (item.price ? '<div class="sdl-wishlist-item-price">' + item.price + '</div>' : '') +
        '</div>' +
        '<div class="sdl-wishlist-item-actions">' +
          (cfg("addToCartFromWishlist") ? '<a href="' + item.url + '" class="sdl-wishlist-add-cart-btn">' + cfg("addToCartLabel") + '</a>' : '') +
          '<button class="sdl-wishlist-remove-btn" data-url="' + item.url + '">' + cfg("removeLabel") + '</button>' +
        '</div>' +
      '</div>';
    });

    html += '</div>';

    html += '<div class="sdl-wishlist-footer">' +
      '<button class="sdl-wishlist-send-btn">' + cfg("sendWishlistLabel") + '</button>' +
    '</div>';

    container.innerHTML = html;

    container.querySelectorAll(".sdl-wishlist-heart--overlay").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeFromWishlist(btn.getAttribute("data-url"));
        updateAllHearts();
      });
    });

    container.querySelectorAll(".sdl-wishlist-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        removeFromWishlist(btn.getAttribute("data-url"));
        updateAllHearts();
      });
    });

    var sendBtn = container.querySelector(".sdl-wishlist-send-btn");
    if (sendBtn) {
      sendBtn.addEventListener("click", function (e) {
        e.preventDefault();
        sendWishlist();
      });
    }
  }

  /* ── send wishlist via popup form ───────────────────────────────── */
  function sendWishlist() {
    var list = getWishlist();
    if (list.length === 0) return;

    var lines = [];
    lines.push(cfg("summaryText") + " " + list.length + " item" + (list.length !== 1 ? "s" : "") + ":");
    lines.push("─".repeat(40));

    list.forEach(function (item, idx) {
      lines.push("");
      lines.push(cfg("labelItem") + " " + (idx + 1) + ":");
      lines.push("  " + cfg("labelTitle") + ": " + (item.title || "N/A"));
      if (cfg("includePrices") && item.price) {
        lines.push("  " + cfg("labelPrice") + ": " + item.price);
      }
      if (cfg("includeProductUrl") && item.url) {
        lines.push("  URL: " + item.url);
      }
    });

    var summary = lines.join("\n");

    var lightbox = document.querySelector(S.footerLightbox);
    if (!lightbox) return;

    lightbox.click();

    setTimeout(function () {
      var fieldLabel = cfg("fieldName");
      var labels = document.querySelectorAll(S.formLabel);
      var targetLabel = null;

      labels.forEach(function (l) {
        if (l.textContent.trim().toLowerCase() === fieldLabel.toLowerCase()) {
          targetLabel = l;
        }
      });

      if (targetLabel) {
        var field = targetLabel.parentElement;
        var textarea = field ? field.querySelector("textarea") : null;
        if (textarea) {
          triggerReact(textarea, summary);
        }
      }
    }, 600);
  }

  /* ── init ───────────────────────────────────────────────────────── */
  function init() {
    setupHeaderIcon();

    if (isWishlistPage()) {
      renderWishlistPage();
      return;
    }

    if (isStorePage()) {
      setupStorePageHearts();
    }

    if (isProductPage()) {
      setupProductPageHeart();
    }
  }

  function boot() {
    setTimeout(init, cfg("executionDelay"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("mercury:load", function () {
    setTimeout(init, cfg("executionDelay"));
  });
})();
