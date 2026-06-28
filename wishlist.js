/* SDL Wishlist v1.1 | square-design-lab */
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
    wishlistTitle: "WISHLIST",
    headerIcon: true,
    headerIconPosition: "before-cart",
    headerIconType: "icon",
    headerIconText: "Wishlist",
    fieldName: "Wishlist",
    includePrices: true,
    includeProductUrl: true,
    labelItem: "Item",
    labelTitle: "Title",
    labelPrice: "Price",
    summaryText: "Wishlist contains",
    filterByTag: false,
    enquiryTag: "wishlist",
    executionDelay: 500,
    shareWishlist: true,
    shareWishlistLabel: "Share Wishlist"
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
  var SHARE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
  var EMAIL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;vertical-align:middle;margin-left:8px"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
  var COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;vertical-align:middle;margin-left:8px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

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

  function escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  /* ── get selected variants on PDP ──────────────────────────────────── */
  function getSelectedVariants() {
    var variants = [];
    var selects = document.querySelectorAll(".product-variants select, .variant-option select, .ProductItem-details select");
    selects.forEach(function (sel) {
      var label = "";
      var prev = sel.previousElementSibling;
      if (prev && (prev.tagName === "LABEL" || prev.classList.contains("variant-option-title"))) {
        label = prev.textContent.trim().replace(/:$/, "");
      }
      if (!label) {
        var wrap = sel.closest(".variant-option, .product-variants-option");
        if (wrap) {
          var lbl = wrap.querySelector("label, .variant-option-title");
          if (lbl) label = lbl.textContent.trim().replace(/:$/, "");
        }
      }
      if (sel.value && sel.selectedIndex > 0) {
        variants.push({ label: label || "Option", value: sel.options[sel.selectedIndex].text.trim() });
      }
    });
    var qtyInput = document.querySelector("input.product-quantity-input, input[name='quantity'], .quantity-input input");
    var qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
    return { variants: variants, quantity: qty || 1 };
  }

  /* ── document-level event interceptor for hearts ────────────────── */
  function setupHeartInterceptor() {
    if (window.__sdlWishlistInterceptor) return;
    window.__sdlWishlistInterceptor = true;

    function handleHeartEvent(e) {
      var heart = e.target.closest(".sdl-wishlist-heart[data-product]");
      if (!heart) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (e.type === "click") {
        var data = JSON.parse(heart.getAttribute("data-product"));
        toggleWishlist(data);
        updateHeartState(heart, data.url);
        setTimeout(updateAllHearts, 50);
        setTimeout(updateAllHearts, 300);
      }
    }

    ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(function (evt) {
      document.addEventListener(evt, handleHeartEvent, true);
    });
  }

  /* ── store page: hearts on product images ───────────────────────── */
  function setupStorePageHearts() {
    if (!cfg("showOnStorePage")) return;
    setupHeartInterceptor();

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
      btn.setAttribute("data-product", JSON.stringify({ url: fullUrl, title: title, price: price, image: image }));
      btn.classList.add("sdl-wishlist-heart--" + pos);

      imageWrapper.appendChild(btn);
    });
  }

  /* ── product detail page: wishlist button ────────────────────────── */
  function setupProductPageHeart() {
    if (!cfg("showOnProductPage")) return;
    if (!isProductPage()) return;
    if (document.querySelector(".sdl-wishlist-pdp-btn")) return;

    var titleEl = document.querySelector(".ProductItem-details-title, .product-title, h1.pdp-product-title");
    var title = titleEl ? titleEl.innerText.trim() : "";

    var priceEl = document.querySelector(".product-price, .sqs-money-native");
    var price = priceEl ? priceEl.innerText.trim() : "";

    var imgEl = document.querySelector(".ProductItem-gallery img, .pdp-gallery img, .product-image img");
    var image = imgEl ? imgEl.src : "";

    var url = window.location.origin + window.location.pathname;

    var layoutWrapper = document.querySelector(".product-add-to-cart-layout-wrapper");
    if (!layoutWrapper) {
      var controlsRow = document.querySelector(".product-purchase-controls-wrapper");
      layoutWrapper = controlsRow || null;
    }
    if (!layoutWrapper) {
      var addBtn = document.querySelector(S.addToCartBtn);
      layoutWrapper = addBtn ? addBtn.closest(".product-add-to-cart-layout-wrapper, .product-purchase-controls-wrapper") || addBtn.parentElement : null;
    }
    if (!layoutWrapper) return;

    var inWishlist = isInWishlist(url);
    var pdpBtn = document.createElement("button");
    pdpBtn.className = "sdl-wishlist-pdp-btn sqs-button-element--secondary";
    pdpBtn.type = "button";

    function updatePdpBtn(active) {
      var icon = active ? HEART_FILLED : HEART_OUTLINE;
      var text = active ? "In Wishlist" : "Add to Wishlist";
      pdpBtn.innerHTML = '<span class="sdl-wishlist-pdp-icon" style="color:' + (active ? cfg("heartColor") : "currentColor") + '">' + icon + '</span> ' + text;
    }

    updatePdpBtn(inWishlist);

    pdpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var sel = getSelectedVariants();
      var data = { url: url, title: title, price: price, image: image };
      if (sel.variants.length > 0) data.variants = sel.variants;
      if (sel.quantity > 1) data.quantity = sel.quantity;
      var added = toggleWishlist(data);
      updatePdpBtn(added);
    });

    layoutWrapper.parentElement.insertBefore(pdpBtn, layoutWrapper.nextSibling);
  }

  /* ── header icon / text link ─────────────────────────────────────── */
  function createHeaderIconEl() {
    var container = document.createElement("a");
    container.className = "sdl-wishlist-header-icon";
    container.href = cfg("wishlistPageSlug");
    container.setAttribute("aria-label", "Wishlist");

    var count = getWishlist().length;

    if (cfg("headerIconType") === "icon") {
      container.innerHTML = HEART_OUTLINE;
      var svg = container.querySelector("svg");
      svg.style.width = "20px";
      svg.style.height = "20px";
      var badge = document.createElement("span");
      badge.className = "sdl-wishlist-badge";
      badge.textContent = count;
      container.appendChild(badge);
    } else {
      container.classList.add("sdl-wishlist-header-text");
      var textSpan = document.createElement("span");
      textSpan.className = "sdl-wishlist-header-label";
      textSpan.textContent = cfg("headerIconText") + " (" + count + ")";
      container.appendChild(textSpan);
    }

    return container;
  }

  function insertIconIntoWrap(wrap) {
    if (!wrap) return;
    var cart = wrap.querySelector(".header-actions-action--cart");
    if (!cart) return;
    if (wrap.querySelector(".sdl-wishlist-header-icon")) return;
    var icon = createHeaderIconEl();
    if (cfg("headerIconPosition") === "before-cart") {
      cart.parentElement.insertBefore(icon, cart);
    } else {
      cart.parentElement.insertBefore(icon, cart.nextSibling);
    }
  }

  function setupHeaderIcon() {
    if (!cfg("headerIcon")) return;

    var desktopDisplay = document.querySelector(".header-display-desktop");
    var mobileDisplay = document.querySelector(".header-display-mobile");

    if (desktopDisplay) {
      var desktopActions = desktopDisplay.querySelector(".header-actions--right");
      if (desktopActions) {
        var desktopWrap = desktopActions.querySelector(".showOnDesktop");
        insertIconIntoWrap(desktopWrap);
      }
    }

    if (mobileDisplay) {
      var mobileActions = mobileDisplay.querySelector(".header-actions--right");
      if (mobileActions) {
        var mobileWrap = mobileActions.querySelector(".showOnMobile");
        insertIconIntoWrap(mobileWrap);
      }
    }

    if (!document.querySelector(".sdl-wishlist-header-icon")) {
      var cartAction = null;
      var candidates = document.querySelectorAll(".header-actions-action--cart");
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].offsetParent !== null) { cartAction = candidates[i]; break; }
      }
      if (!cartAction) cartAction = document.querySelector(S.cartIcon);
      if (!cartAction) cartAction = document.querySelector("a[href='/cart']");

      if (cartAction && !cartAction.closest(".showOnDesktop, .showOnMobile")) {
        var icon = createHeaderIconEl();
        var parent = cartAction.parentElement;
        if (cfg("headerIconPosition") === "before-cart") {
          parent.insertBefore(icon, cartAction);
        } else {
          parent.insertBefore(icon, cartAction.nextSibling);
        }
      }
    }

    updateHeaderBadge();
  }

  function updateHeaderBadge() {
    var count = getWishlist().length;

    document.querySelectorAll(".sdl-wishlist-badge").forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    });

    document.querySelectorAll(".sdl-wishlist-header-label").forEach(function (label) {
      label.textContent = cfg("headerIconText") + " (" + count + ")";
    });
  }

  /* ── share wishlist popup ──────────────────────────────────────────── */
  function buildShareBody() {
    var list = getWishlist();
    var lines = [];
    lines.push("My Wishlist (" + list.length + " item" + (list.length !== 1 ? "s" : "") + ")");
    lines.push("");
    list.forEach(function (item, idx) {
      var line = (idx + 1) + ". " + (item.title || "Product");
      if (item.variants && item.variants.length) {
        line += " (" + item.variants.map(function (v) { return v.label + ": " + v.value; }).join(", ") + ")";
      }
      if (item.price) line += " — " + item.price;
      lines.push(line);
      if (item.url) lines.push("   " + item.url);
    });
    return lines.join("\n");
  }

  function openSharePopup() {
    if (document.querySelector(".sdl-share-overlay")) return;
    var overlay = document.createElement("div");
    overlay.className = "sdl-share-overlay";

    var popup = document.createElement("div");
    popup.className = "sdl-share-popup";

    var close = document.createElement("button");
    close.className = "sdl-share-close";
    close.innerHTML = "&times;";
    close.addEventListener("click", function () { overlay.remove(); });

    var title = document.createElement("h3");
    title.className = "sdl-share-title";
    title.textContent = "SHARE MY WISHLIST";

    var desc = document.createElement("p");
    desc.className = "sdl-share-desc";
    desc.textContent = "Share your favorited items with friends! Use share option that works best for you!";

    var emailBtn = document.createElement("button");
    emailBtn.className = "sdl-share-btn";
    emailBtn.innerHTML = "EMAIL" + EMAIL_ICON;
    emailBtn.addEventListener("click", function () {
      var body = encodeURIComponent(buildShareBody());
      var subject = encodeURIComponent("My Wishlist");
      window.location.href = "mailto:?subject=" + subject + "&body=" + body;
    });

    var copyBtn = document.createElement("button");
    copyBtn.className = "sdl-share-btn";
    copyBtn.innerHTML = "COPY LINK" + COPY_ICON;
    copyBtn.addEventListener("click", function () {
      var text = buildShareBody();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.innerHTML = "COPIED!" + COPY_ICON;
          setTimeout(function () { copyBtn.innerHTML = "COPY LINK" + COPY_ICON; }, 2000);
        });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        copyBtn.innerHTML = "COPIED!" + COPY_ICON;
        setTimeout(function () { copyBtn.innerHTML = "COPY LINK" + COPY_ICON; }, 2000);
      }
    });

    popup.appendChild(close);
    popup.appendChild(title);
    popup.appendChild(desc);
    popup.appendChild(emailBtn);
    popup.appendChild(copyBtn);
    overlay.appendChild(popup);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  /* ── wishlist page rendering ────────────────────────────────────── */
  function renderWishlistPage() {
    if (!isWishlistPage()) return;

    var container = document.querySelector(".sdl-wishlist-container");
    if (!container) {
      var mountPoint = document.querySelector(".sdl-wishlist");
      if (!mountPoint) {
        mountPoint = document.querySelector(".sqs-block-code .sqs-block-content");
      }
      if (!mountPoint) return;

      container = document.createElement("div");
      container.className = "sdl-wishlist-container";
      mountPoint.appendChild(container);
    }

    var list = getWishlist();

    if (list.length === 0) {
      container.innerHTML =
        '<div class="sdl-wishlist-empty">' +
          '<div class="sdl-wishlist-empty-heart">' + HEART_OUTLINE + '</div>' +
          '<p class="sdl-wishlist-empty-msg">' + escHtml(cfg("emptyMessage")) + '</p>' +
          '<a class="sdl-wishlist-empty-browse sqs-button-element--primary" href="' + escHtml(cfg("emptyBrowseLink")) + '">' + escHtml(cfg("emptyBrowseLabel")) + '</a>' +
        '</div>';
      return;
    }

    var shareLink = "";
    if (cfg("shareWishlist")) {
      shareLink = '<a href="#" class="sdl-wishlist-share-link">' + SHARE_ICON + escHtml(cfg("shareWishlistLabel")) + '</a>';
    }

    var html = '<div class="sdl-wishlist-header">' +
      '<h2 class="sdl-wishlist-title">' + escHtml(cfg("wishlistTitle")) + '</h2>' +
      shareLink +
    '</div>';

    html += '<div class="sdl-wishlist-list">';

    list.forEach(function (item) {
      var variantHtml = "";
      if (item.variants && item.variants.length) {
        item.variants.forEach(function (v) {
          variantHtml += '<div class="sdl-wishlist-item-variant">' + escHtml(v.label) + ': ' + escHtml(v.value) + '</div>';
        });
      }
      if (item.quantity && item.quantity > 1) {
        variantHtml += '<div class="sdl-wishlist-item-variant">Qty: ' + item.quantity + '</div>';
      }

      html += '<div class="sdl-wishlist-item" data-url="' + escHtml(item.url) + '">' +
        '<div class="sdl-wishlist-item-left">' +
          '<div class="sdl-wishlist-item-image">' +
            '<a href="' + escHtml(item.url) + '">' +
              (item.image ? '<img src="' + escHtml(item.image) + '" alt="' + escHtml(item.title || '') + '" loading="lazy" />' : '<div class="sdl-wishlist-item-placeholder"></div>') +
            '</a>' +
            '<button class="sdl-wishlist-heart sdl-wishlist-heart--active sdl-wishlist-heart--overlay" data-url="' + escHtml(item.url) + '" aria-label="Remove from wishlist" style="color:' + cfg("heartColor") + '">' + HEART_FILLED + '</button>' +
          '</div>' +
          '<div class="sdl-wishlist-item-info">' +
            '<a href="' + escHtml(item.url) + '" class="sdl-wishlist-item-title">' + escHtml(item.title || 'Product') + '</a>' +
            variantHtml +
          '</div>' +
        '</div>' +
        '<div class="sdl-wishlist-item-right">' +
          (item.price ? '<div class="sdl-wishlist-item-price">' + escHtml(displayPrice(item.price)) + '</div>' : '') +
          '<button class="sdl-wishlist-remove-btn" data-url="' + escHtml(item.url) + '" aria-label="Remove">&times;</button>' +
        '</div>' +
      '</div>';
    });

    html += '</div>';

    html += '<div class="sdl-wishlist-footer">' +
      '<div class="sdl-wishlist-subtotal">' +
        '<span>Subtotal</span>' +
        '<span class="sdl-wishlist-subtotal-price">' + calcSubtotal(list) + '</span>' +
      '</div>' +
      '<button class="sdl-wishlist-send-btn sqs-button-element--primary">' + escHtml(cfg("sendWishlistLabel")) + '</button>' +
    '</div>';

    container.innerHTML = html;

    var shareBtn = container.querySelector(".sdl-wishlist-share-link");
    if (shareBtn) {
      shareBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openSharePopup();
      });
    }

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

  function displayPrice(str) {
    if (!str) return "";
    var m = str.match(/([\$\€\£\¥])\s*([\d,.]+)/);
    return m ? m[1] + m[2] : str;
  }

  function calcSubtotal(list) {
    var total = 0;
    var currency = "$";
    list.forEach(function (item) {
      if (!item.price) return;
      var symMatch = item.price.match(/[\$\€\£\¥]/);
      if (symMatch) currency = symMatch[0];
      var nums = item.price.match(/[\d,.]+/g);
      if (nums) {
        var num = parseFloat(nums[0].replace(/,/g, ""));
        if (!isNaN(num)) {
          total += num * (item.quantity || 1);
        }
      }
    });
    return currency + total.toFixed(2);
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
      if (item.variants && item.variants.length) {
        item.variants.forEach(function (v) {
          lines.push("  " + v.label + ": " + v.value);
        });
      }
      if (item.quantity && item.quantity > 1) {
        lines.push("  Qty: " + item.quantity);
      }
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
