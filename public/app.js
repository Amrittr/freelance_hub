const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const categoryMeta = {
  design: { icon: "pen-tool", label: "Graphics & Design", theme: "theme-design" },
  tech: { icon: "code-2", label: "Programming & Tech", theme: "theme-tech" },
  marketing: { icon: "megaphone", label: "Digital Marketing", theme: "theme-marketing" },
  video: { icon: "clapperboard", label: "Video & Animation", theme: "theme-video" },
  writing: { icon: "file-pen-line", label: "Writing & Translation", theme: "theme-writing" },
  business: { icon: "briefcase-business", label: "Business", theme: "theme-business" },
  ai: { icon: "bot", label: "AI Services", theme: "theme-ai" },
};

const demoServices = [
  serviceStub("brand-kit", "design", "I will design a crisp logo and mini brand kit for your launch", "Maya S.", 95, 2, 4.98, 312),
  serviceStub("shopify-fix", "tech", "I will fix Shopify layout bugs and speed issues in 24 hours", "Jon B.", 80, 1, 4.91, 188),
  serviceStub("seo-plan", "marketing", "I will create a practical SEO action plan for your website", "Rhea M.", 120, 3, 4.96, 244),
  serviceStub("caption-repair", "video", "I will clean captions and deliver polished SRT files", "Lena P.", 55, 1, 4.89, 157),
  serviceStub("landing-copy", "writing", "I will write conversion-focused landing page copy", "Omar R.", 140, 2, 4.97, 391),
  serviceStub("ai-agent", "ai", "I will prototype AI agents for your help center", "Theo N.", 220, 5, 4.94, 126),
];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Unregistered rogue service worker from sem 5');
    }
  });
}
const state = {
  user: null,
  authMode: "signup",
  category: "all",
  query: "",
  sort: "recommended",
  saved: new Set(),
  selectedService: null,
  dashboard: null,
  wallet: null,
  appPage: "overview",
  apiAvailable: true,
  financeChartType: "line",
  notifications: [
    {
      id: "welcome",
      icon: "info",
      type: "info",
      text: "Welcome to FreelanceHub! Explore handpicked escrow-backed services.",
      time: new Date(),
      read: false
    }
  ],
  notificationTimer: null,
  upiTimer: null,
};

const selectors = {
  body: document.body,
  menuButton: document.querySelector("#menuButton"),
  navButtons: document.querySelectorAll("[data-scroll-target]"),
  searchForm: document.querySelector("#heroSearch"),
  searchInput: document.querySelector("#searchInput"),
  trendButtons: document.querySelectorAll("[data-query]"),
  categoryButtons: document.querySelectorAll("[data-category]"),
  categoryRail: document.querySelector("#categoryRail"),
  categoryPrev: document.querySelector("#categoryPrev"),
  categoryNext: document.querySelector("#categoryNext"),
  sortButtons: document.querySelectorAll("[data-sort]"),
  serviceGrid: document.querySelector("#serviceGrid"),
  joinButton: document.querySelector("#joinButton"),
  signinButton: document.querySelector("#signinButton"),
  dashboardButton: document.querySelector("#dashboardButton"),
  logoutButton: document.querySelector("#logoutButton"),
  workspaceNav: document.querySelector("#workspaceNav"),
  appNavButtons: document.querySelectorAll("[data-app-page-nav]"),
  appPages: document.querySelectorAll("[data-app-page]"),
  userMenuWrap: document.querySelector("#userMenuWrap"),
  userMenuButton: document.querySelector("#userMenuButton"),
  userMenu: document.querySelector("#userMenu"),
  userInitials: document.querySelector("#userInitials"),
  userMenuName: document.querySelector("#userMenuName"),
  userMenuEmail: document.querySelector("#userMenuEmail"),
  menuLogoutButton: document.querySelector("#menuLogoutButton"),
  joinDialog: document.querySelector("#joinDialog"),
  authForm: document.querySelector("#authForm"),
  googleAuthButton: document.querySelector("#googleAuthButton"),
  authTabs: document.querySelectorAll("[data-auth-mode]"),
  authEyebrow: document.querySelector("#authEyebrow"),
  authTitle: document.querySelector("#authTitle"),
  authSubmit: document.querySelector("#authSubmit"),
  signupOnlyFields: document.querySelectorAll("[data-signup-only]"),
  roleDialog: document.querySelector("#roleDialog"),
  roleChoices: document.querySelectorAll("[data-role-choice]"),
  onboardingDialog: document.querySelector("#onboardingDialog"),
  onboardingForm: document.querySelector("#onboardingForm"),
  onboardingEyebrow: document.querySelector("#onboardingEyebrow"),
  onboardingTitle: document.querySelector("#onboardingTitle"),
  onboardingStepper: document.querySelector("#onboardingStepper"),
  onboardingBody: document.querySelector("#onboardingBody"),
  onboardingActions: document.querySelector("#onboardingActions"),
  orderDialog: document.querySelector("#orderDialog"),
  orderForm: document.querySelector("#orderForm"),
  orderTitle: document.querySelector("#orderTitle"),
  orderPrice: document.querySelector("#orderPrice"),
  sellerButton: document.querySelector("#sellerButton"),
  proButton: document.querySelector("#proButton"),
  dashboardSection: document.querySelector("#dashboard"),
  dashboardRoleButtons: document.querySelectorAll("[data-dashboard-role]"),
  dashboardRoleLabel: document.querySelector("#dashboardRoleLabel"),
  dashboardGreeting: document.querySelector("#dashboardGreeting"),
  dashboardSubcopy: document.querySelector("#dashboardSubcopy"),
  dashboardProgress: document.querySelector("#dashboardProgress"),
  dashboardProgressBar: document.querySelector("#dashboardProgressBar"),
  dashboardWidgets: document.querySelector("#dashboardWidgets"),
  dashboardNextSteps: document.querySelector("#dashboardNextSteps"),
  dashboardFunds: document.querySelector("#dashboardFunds"),
  dashboardActive: document.querySelector("#dashboardActive"),
  dashboardReview: document.querySelector("#dashboardReview"),
  dashboardMessages: document.querySelector("#dashboardMessages"),
  orderList: document.querySelector("#orderList"),
  sellerTools: document.querySelector("#sellerTools"),
  serviceForm: document.querySelector("#serviceForm"),
  connectPayoutsButton: document.querySelector("#connectPayoutsButton"),
  refreshDashboard: document.querySelector("#refreshDashboard"),
  walletPage: document.querySelector("#walletPage"),
  walletBalance: document.querySelector("#walletBalance"),
  walletBalanceCopy: document.querySelector("#walletBalanceCopy"),
  walletProviderLabel: document.querySelector("#walletProviderLabel"),
  walletCredits: document.querySelector("#walletCredits"),
  walletTransactions: document.querySelector("#walletTransactions"),
  walletAmount: document.querySelector("#walletAmount"),
  walletPhone: document.querySelector("#walletPhone"),
  walletPhoneField: document.querySelector("#walletPhoneField"),
  walletTopupButton: document.querySelector("#walletTopupButton"),
  walletPresetButtons: document.querySelectorAll("[data-wallet-amount]"),
  walletDemoNote: document.querySelector("#walletDemoNote"),
  financeIncoming: document.querySelector("#financeIncoming"),
  financeIncomingCopy: document.querySelector("#financeIncomingCopy"),
  financeOutgoing: document.querySelector("#financeOutgoing"),
  financeProtected: document.querySelector("#financeProtected"),
  financeCompleted: document.querySelector("#financeCompleted"),
  financeChart: document.querySelector("#financeChart"),
  financeRing: document.querySelector("#financeRing"),
  financeRingValue: document.querySelector("#financeRingValue"),
  financeSummaryCopy: document.querySelector("#financeSummaryCopy"),
  financeWalletBalance: document.querySelector("#financeWalletBalance"),
  financeVolume: document.querySelector("#financeVolume"),
  chartLineBtn: document.querySelector("#chartLineBtn"),
  chartPieBtn: document.querySelector("#chartPieBtn"),
  toast: document.querySelector("#toast"),
  
  themeToggle: document.querySelector("#themeToggle"),
  googleAuthButton: document.querySelector("#googleAuthButton"),
  
  paymentDialog: document.querySelector("#paymentDialog"),
  paymentForm: document.querySelector("#paymentForm"),
  paymentTitle: document.querySelector("#paymentTitle"),
  paymentGatewayAmount: document.querySelector("#paymentGatewayAmount"),
  paymentLoader: document.querySelector("#paymentLoader"),
  paymentMethods: document.querySelector("#paymentMethods"),
  paymentCardForm: document.querySelector("#paymentCardForm"),
  confirmPaymentBtn: document.querySelector("#confirmPaymentBtn"),
  
  floatingWallet: document.querySelector("#floatingWallet"),
  floatingWalletToggle: document.querySelector("#floatingWalletToggle"),
  floatingWalletBalance: document.querySelector("#floatingWalletBalance"),
  
  dashboardActivityPanel: document.querySelector("#dashboardActivityPanel"),
  activityTimeline: document.querySelector("#activityTimeline"),
  dashboardEmailPanel: document.querySelector("#dashboardEmailPanel"),
  emailLogList: document.querySelector("#emailLogList"),
  
  // Notification system selectors
  notificationWrap: document.querySelector("#notificationWrap"),
  notificationButton: document.querySelector("#notificationButton"),
  notificationBadge: document.querySelector("#notificationBadge"),
  notificationPanel: document.querySelector("#notificationPanel"),
  notificationList: document.querySelector("#notificationList"),
  clearNotificationsButton: document.querySelector("#clearNotificationsButton"),

  // Dedicated Payment Gateway Page selectors
  gatewayPage: document.querySelector("#gatewayPage"),
  cancelGatewayButton: document.querySelector("#cancelGatewayButton"),
  gatewayItemTitle: document.querySelector("#gatewayItemTitle"),
  gatewayItemPrice: document.querySelector("#gatewayItemPrice"),
  gatewayTotalAmount: document.querySelector("#gatewayTotalAmount"),
  gatewayPayCardButton: document.querySelector("#gatewayPayCardButton"),
  gatewayPayUpiButton: document.querySelector("#gatewayPayUpiButton"),
  gatewayCardNo: document.querySelector("#gatewayCardNo"),
  gatewayCardName: document.querySelector("#gatewayCardName"),
  gatewayCardExpiry: document.querySelector("#gatewayCardExpiry"),
  gatewayCardCvv: document.querySelector("#gatewayCardCvv"),
  gatewayUpiVpa: document.querySelector("#gatewayUpiVpa"),
  gatewayCardPanel: document.querySelector("#gatewayCardPanel"),
  gatewayUpiPanel: document.querySelector("#gatewayUpiPanel"),
  gatewayProcessing: document.querySelector("#gatewayProcessing"),
  gatewayProcessingText: document.querySelector("#gatewayProcessingText"),
  gatewayProgressBarInner: document.querySelector("#gatewayProgressBarInner"),
  gatewayReceiptPanel: document.querySelector("#gatewayReceiptPanel"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptTxId: document.querySelector("#receiptTxId"),
  receiptUser: document.querySelector("#receiptUser"),
  receiptAmount: document.querySelector("#receiptAmount"),
  receiptPrintButton: document.querySelector("#receiptPrintButton"),
  receiptCloseButton: document.querySelector("#receiptCloseButton"),
  upiTimerMinutes: document.querySelector("#upiTimerMinutes"),
  upiQrCodeContainer: document.querySelector("#upiQrCodeContainer"),
  upiQrSpinner: document.querySelector("#upiQrSpinner"),
  
  // Interactive credit card preview selectors
  cardFlipInner: document.querySelector("#cardFlipInner"),
  previewNumber: document.querySelector("#previewNumber"),
  previewHolder: document.querySelector("#previewHolder"),
  previewExpiry: document.querySelector("#previewExpiry"),
  previewCvv: document.querySelector("#previewCvv"),
};

async function init() {
  initTheme();
  initInteractiveCard();
  bindEvents();
  initGoogleAuth();
  setAuthMode("signup");
  
  initLogoNav();
  initNotificationToggle();
  renderNotifications();
  
  await Promise.allSettled([loadCurrentUser(), loadServices()]);
  handleCheckoutReturn();
  refreshIcons();
}

function initTheme() {
  const isDark = localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const lightOpt = selectors.themeToggle?.querySelector(".theme-light");
  const darkOpt = selectors.themeToggle?.querySelector(".theme-dark");

  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
    if (lightOpt && darkOpt) {
      lightOpt.classList.remove("active");
      darkOpt.classList.add("active");
    }
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (lightOpt && darkOpt) {
      lightOpt.classList.add("active");
      darkOpt.classList.remove("active");
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const lightOpt = selectors.themeToggle?.querySelector(".theme-light");
  const darkOpt = selectors.themeToggle?.querySelector(".theme-dark");

  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    if (lightOpt && darkOpt) {
      lightOpt.classList.add("active");
      darkOpt.classList.remove("active");
    }
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    if (lightOpt && darkOpt) {
      lightOpt.classList.remove("active");
      darkOpt.classList.add("active");
    }
  }
  if (window.lucide) lucide.createIcons();
  if (state.dashboard?.finance) {
    renderFinance(state.dashboard.finance);
  }
}

function bindEvents() {
  document.querySelectorAll("[data-close-dialog], dialog button[value='cancel']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const dialog = button.closest("dialog");
      if (dialog) dialog.close();
    });
  });

  const searchBtn = document.querySelector("#searchToggleBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
      selectors.searchInput?.focus();
    });
  }

  selectors.themeToggle.addEventListener("click", toggleTheme);
  selectors.menuButton.addEventListener("click", () => {
    selectors.body.classList.toggle("menu-open");
    const open = selectors.body.classList.contains("menu-open");
    selectors.menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(`#${button.dataset.scrollTarget}`);
      selectors.body.classList.remove("menu-open");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  selectors.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = selectors.searchInput.value.trim();
    loadServices();
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  selectors.searchInput.addEventListener("input", debounce(() => {
    state.query = selectors.searchInput.value.trim();
    loadServices();
  }, 220));

  selectors.trendButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectors.searchInput.value = button.dataset.query;
      state.query = button.dataset.query;
      state.category = "all";
      updateCategoryButtons();
      loadServices();
      document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  selectors.categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      updateCategoryButtons();
      loadServices();
    });
  });

  selectors.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.sort;
      selectors.sortButtons.forEach((item) => item.classList.toggle("active", item.dataset.sort === state.sort));
      loadServices();
    });
  });

  selectors.categoryPrev.addEventListener("click", () => scrollCategories(-1));
  selectors.categoryNext.addEventListener("click", () => scrollCategories(1));
  selectors.joinButton.addEventListener("click", () => openAuthDialog("signup"));
  selectors.signinButton.addEventListener("click", () => openAuthDialog("login"));
  selectors.dashboardButton.addEventListener("click", () => openDashboard());
  selectors.logoutButton.addEventListener("click", logout);
  selectors.menuLogoutButton.addEventListener("click", logout);
  selectors.userMenuButton.addEventListener("click", toggleUserMenu);
  selectors.appNavButtons.forEach((button) => {
    button.addEventListener("click", () => openAppPage(button.dataset.appPageNav));
  });
  selectors.sellerButton.addEventListener("click", startSelling);
  selectors.proButton.addEventListener("click", () => {
    state.category = "all";
    state.sort = "recommended";
    updateCategoryButtons();
    loadServices();
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  selectors.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });
  selectors.authForm.addEventListener("submit", submitAuthForm);
  selectors.roleChoices.forEach((button) => {
    button.addEventListener("click", () => chooseRole(button.dataset.roleChoice));
  });
  selectors.onboardingForm.addEventListener("submit", submitOnboarding);
  selectors.onboardingBody.addEventListener("click", (event) => {
    if (event.target.closest("#profileAssistButton")) {
      generateProfileDraft();
    }
  });
  selectors.orderForm.addEventListener("submit", submitOrderForm);

  selectors.dashboardRoleButtons.forEach((button) => {
    button.addEventListener("click", () => switchDashboardRole(button.dataset.dashboardRole));
  });
  selectors.refreshDashboard.addEventListener("click", loadDashboard);
  selectors.dashboardNextSteps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dashboard-action]");
    if (button) handleDashboardAction(button.dataset.dashboardAction);
  });
  selectors.serviceForm.addEventListener("submit", submitServiceForm);
  selectors.connectPayoutsButton.addEventListener("click", connectPayouts);
  selectors.walletPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (selectors.walletAmount) selectors.walletAmount.value = button.dataset.walletAmount;
      selectors.walletPresetButtons.forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  if (selectors.walletTopupButton) {
    selectors.walletTopupButton.addEventListener("click", addWalletFunds);
  }

  // Delegated handler for embedded wallet presets and topup buttons
  document.addEventListener("click", (event) => {
    const presetBtn = event.target.closest("[data-wallet-amount]");
    if (presetBtn) {
      const amt = presetBtn.dataset.walletAmount;
      const input = document.getElementById("walletAmount");
      if (input) input.value = amt;
    }

    // Direct all Add Funds / Top Up triggers to Demo Payment Gateway!
    const isTopUpTrigger = event.target.closest("#walletTopupButton") ||
                           event.target.closest("#floatingWalletBtn") ||
                           event.target.closest("[data-open-futuristic]") ||
                           event.target.closest("[data-add-funds]");

    if (isTopUpTrigger) {
      const customAmtInput = document.getElementById("walletAmount") || document.getElementById("futuristicAmountInput");
      const defaultAmt = Number(customAmtInput?.value) || 2500;
      openGatewayPage({
        title: "Wallet Escrow Top-Up",
        amount: defaultAmt,
        total: defaultAmt,
        checkoutAction: async () => {
          return await api("/payments/wallet/top-up", {
            method: "POST",
            body: JSON.stringify({ amount: defaultAmt }),
          });
        }
      });
    }

    // Escrow Security Modal
    if (event.target.closest("#escrowVaultsBtn")) {
      openEscrowVaultsModal();
    }
    if (event.target.closest("#closeEscrowModal")) {
      closeEscrowVaultsModal();
    }

    if (event.target.closest("#futuristicTopupConfirm")) {
      const amt = Number(document.getElementById("futuristicAmountInput")?.value || 2500);
      openGatewayPage({
        title: "Wallet Cyber Escrow Top-Up",
        amount: amt,
        total: amt,
        checkoutAction: async () => {
          return await api("/payments/wallet/top-up", {
            method: "POST",
            body: JSON.stringify({ amount: amt }),
          });
        }
      });
    }
  });
  
  if (selectors.chartLineBtn) {
    selectors.chartLineBtn?.addEventListener("click", () => {
      state.financeChartType = "line";
      updateChartToggleUI();
      if (state.dashboard && state.dashboard.finance) {
        renderFinance(state.dashboard.finance);
      }
    });
  }
  if (selectors.chartPieBtn) {
    selectors.chartPieBtn?.addEventListener("click", () => {
      state.financeChartType = "pie";
      updateChartToggleUI();
      if (state.dashboard && state.dashboard.finance) {
        renderFinance(state.dashboard.finance);
      }
    });
  }
  
  if (selectors.floatingWalletToggle) {
    selectors.floatingWalletToggle.addEventListener("click", () => {
      selectors.floatingWallet.classList.toggle("open");
    });
  }
  
  // Close float menu when clicking outside
  document.addEventListener("click", (e) => {
    if (selectors.floatingWallet && selectors.floatingWallet.classList.contains("open") && !selectors.floatingWallet.contains(e.target)) {
      selectors.floatingWallet.classList.remove("open");
    }
  });
  
  if (selectors.paymentMethods) {
    selectors.paymentMethods.querySelectorAll('.payment-method-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectors.paymentMethods.classList.add('hidden');
        selectors.paymentCardForm.classList.remove('hidden');
      });
    });
  }
}

async function initGoogleAuth() {
  const btn = selectors.googleAuthButton || document.querySelector("#googleAuthButton");
  if (!btn) return;

  btn.innerHTML = `
    <button type="button" class="firebase-google-btn" id="firebaseGoogleBtn" aria-label="Continue with Google">
      <svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>Continue with Google</span>
    </button>
  `;

  const googleBtn = btn.querySelector("#firebaseGoogleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", handleFirebaseGoogleLogin);
  }
}

async function handleFirebaseGoogleLogin(event) {
  event?.preventDefault?.();
  if (!window.FreelanceHubFirebase?.signInWithFirebaseGoogle) {
    showToast("Firebase Auth is loading, please try again in a second.");
    return;
  }

  try {
    const cred = await window.FreelanceHubFirebase.signInWithFirebaseGoogle();
    const payload = await api("/auth/firebase", {
      method: "POST",
      body: JSON.stringify({
        uid: cred.uid,
        email: cred.email,
        name: cred.name,
        avatar: cred.avatar,
        idToken: cred.idToken,
        role: "client",
      }),
    });

    state.user = payload.user;
    selectors.joinDialog.close();
    updateAuthUI();
    await loadDashboard();
    openDashboard();
    maybeStartOnboarding();
    showToast(payload.isNew ? "Account created via Google." : "Logged in via Google.");
  } catch (error) {
    if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
      showToast(error.message || "Google sign-in failed.");
    }
  }
}

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed.");
  }
  return payload;
}

async function loadCurrentUser() {
  try {
    const payload = await api("/auth/me");
    state.user = payload.user;
    updateAuthUI();
    await loadDashboard();
    maybeStartOnboarding();
  } catch {
    state.user = null;
    updateAuthUI();
  }
}

async function loadServices() {
  const params = new URLSearchParams({
    q: state.query,
    category: state.category,
    sort: state.sort === "fast" ? "fast" : state.sort === "budget" ? "price" : "recommended",
  });

  try {
    const payload = await api(`/services?${params.toString()}`);
    let services = payload.services.map(normalizeService);
    if (state.sort === "budget") {
      services = services.filter((service) => service.price < 100);
    }
    state.apiAvailable = true;
    renderServices(services);
  } catch (error) {
    state.apiAvailable = false;
    renderServices(filterDemoServices());
  }
}

function renderServices(services) {
  if (!services.length) {
    selectors.serviceGrid.innerHTML = `
      <div class="empty-state">
        No services matched that search. Try a broader keyword like design, website, captions, AI, or data.
      </div>
    `;
    return;
  }

  selectors.serviceGrid.innerHTML = services.map(renderServiceCard).join("");
  selectors.serviceGrid.querySelectorAll(".save-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.dataset.saveId;
      if (state.saved.has(id)) {
        state.saved.delete(id);
        showToast("Removed from saved services.");
      } else {
        state.saved.add(id);
        showToast("Saved service.");
      }
      loadServices();
    });
  });

  selectors.serviceGrid.querySelectorAll(".service-card").forEach((card) => {
    const open = () => startOrder(card.dataset.serviceId, services);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open();
    });
  });
  refreshIcons();
}

function renderServiceCard(service) {
  const saved = state.saved.has(service.id);
  const category = categoryMeta[service.category] || categoryMeta.design;
  const deliveryLabel = service.deliveryDays === 1 ? "24h delivery" : `${service.deliveryDays} day delivery`;
  return `
    <article class="service-card" data-service-id="${service.id}" tabindex="0" aria-label="${escapeHtml(service.title)}">
      <div class="service-body">
        <div class="specialist-card-top">
          <span class="avatar">${escapeHtml(getInitials(service.sellerName))}</span>
          <div class="specialist-card-tools">
            <span class="specialist-availability" title="Available"><i data-lucide="circle-check"></i></span>
            <button class="save-button ${saved ? "saved" : ""}" type="button" data-save-id="${service.id}" aria-label="${saved ? "Unsave service" : "Save service"}" title="${saved ? "Unsave" : "Save"}">
              <i data-lucide="heart"></i>
            </button>
          </div>
        </div>
        <div class="specialist-heading">
          <h3 class="seller-name">${escapeHtml(service.sellerName)}</h3>
          <span class="seller-level"><i data-lucide="badge-check"></i>${escapeHtml(service.level)}</span>
        </div>
        <div class="specialist-tags" aria-label="Service details">
          <span><i data-lucide="star"></i>${service.rating.toFixed(2)}</span>
          <span><i data-lucide="layers-3"></i>${escapeHtml(category.label)}</span>
          <span><i data-lucide="clock-3"></i>${deliveryLabel}</span>
        </div>
        <div class="specialist-service">
          <span>${escapeHtml(category.label)}</span>
          <strong class="service-title">${escapeHtml(service.title)}</strong>
        </div>
        <div class="specialist-card-bottom">
          <div class="price-row">
            <span>Starting at</span>
            <strong>${currency.format(service.price)}</strong>
          </div>
          <span class="service-open-action">See details <i data-lucide="arrow-up-right"></i></span>
        </div>
      </div>
    </article>
  `;
}

function startOrder(serviceId, renderedServices) {
  const service = renderedServices.find((item) => item.id === serviceId);
  if (!service) return;

  if (!state.user) {
    openAuthDialog("signup");
    showToast("Create an account or sign in to start checkout.");
    return;
  }

  if (!state.user.roles.includes("client")) {
    showToast("Switch to a client-enabled account to buy services.");
    return;
  }

  state.selectedService = service;
  selectors.orderTitle.textContent = service.title;
  selectors.orderPrice.textContent = `${currency.format(service.price)} protected checkout. Funds release after approval.`;
  selectors.orderForm.reset();
  selectors.orderDialog.showModal();
  refreshIcons();
}

async function submitOrderForm(event) {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  if (!state.selectedService) return;

  const formData = new FormData(selectors.orderForm);
  const serviceId = state.selectedService.id;
  const requirements = formData.get("requirements");
  const price = state.selectedService.price;
  
  selectors.orderDialog.close();
  
  openGatewayPage({
    type: "service_purchase",
    title: state.selectedService.title,
    amount: price,
    fee: 0,
    total: price,
    checkoutAction: async () => {
      const payload = await api("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          requirements,
        }),
      });
      return payload;
    }
  });
}

function openAuthDialog(mode) {
  setAuthMode(mode);
  selectors.authForm.reset();
  selectors.joinDialog.showModal();
  initGoogleAuth();
  refreshIcons();
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  selectors.authTabs.forEach((button) => button.classList.toggle("active", button.dataset.authMode === mode));
  selectors.authEyebrow.textContent = isSignup ? "Create your account" : "Welcome back";
  selectors.authTitle.textContent = isSignup ? "Join FreelanceHub" : "Log in";
  selectors.authSubmit.textContent = isSignup ? "Create account" : "Log in";
  selectors.signupOnlyFields.forEach((field) => field.classList.toggle("hidden", !isSignup));
  selectors.authForm.elements.name.required = isSignup;
}

async function submitAuthForm(event) {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();

  const formData = new FormData(selectors.authForm);
  const endpoint = state.authMode === "signup" ? "/auth/signup" : "/auth/login";
  const payload =
    state.authMode === "signup"
      ? {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }
      : {
          email: formData.get("email"),
          password: formData.get("password"),
        };

  try {
    const result = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.user = result.user;
    selectors.joinDialog.close();
    updateAuthUI();
    await loadDashboard();
    openDashboard();
    maybeStartOnboarding();
    showToast(state.authMode === "signup" ? "Account created." : "Logged in.");
  } catch (error) {
    showToast(error.message);
  }
}

function onboardingNeed() {
  if (!state.user) return null;
  const onboarding = state.user.onboarding || {};
  if (!onboarding.roleChoiceComplete) return "role";
  if (state.user.activeRole === "freelancer" && !onboarding.freelancerComplete) return "freelancer";
  if (state.user.activeRole === "client" && !onboarding.clientComplete) return "client";
  return null;
}

function maybeStartOnboarding() {
  const next = onboardingNeed();
  if (next === "role") {
    if (!selectors.roleDialog.open) selectors.roleDialog.showModal();
    refreshIcons();
    return;
  }
  if (next) openOnboarding(next);
}

async function chooseRole(role) {
  try {
    const payload = await api("/onboarding/role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    state.user = payload.user;
    selectors.roleDialog.close();
    updateAuthUI();
    await loadDashboard();
    openOnboarding(state.user.activeRole);
  } catch (error) {
    showToast(error.message);
  }
}

function openOnboarding(role) {
  if (!state.user) return;
  renderOnboarding(role);
  if (!selectors.onboardingDialog.open) selectors.onboardingDialog.showModal();
  refreshIcons();
}

function renderOnboarding(role) {
  const profile = state.user.profile || {};
  const selected = (value, option) => (value === option ? "selected" : "");

  if (role === "client") {
    selectors.onboardingEyebrow.textContent = "Client setup";
    selectors.onboardingTitle.textContent = "What kind of help are you looking for?";
    selectors.onboardingStepper.innerHTML = `<span class="active">1. Your focus</span><span>2. Start exploring</span>`;
    selectors.onboardingBody.innerHTML = `
      <div class="onboarding-copy"><p>Give your workspace a little context. It helps us shape a more useful starting point without slowing you down.</p></div>
      <label>
        <span>What do you want to get done first?</span>
        <textarea name="clientFocus" required minlength="12" maxlength="240" placeholder="For example: launch a cleaner website, create product videos, improve my store...">${escapeHtml(state.user.onboarding?.clientFocus || "")}</textarea>
      </label>
      <label>
        <span>Where are you based? <small>Optional</small></span>
        <input name="country" maxlength="80" value="${escapeHtml(profile.country || "")}" placeholder="City or country" />
      </label>
    `;
    selectors.onboardingActions.innerHTML = `<button class="join-button" type="submit" value="default"><span>Start exploring</span><i data-lucide="arrow-right"></i></button>`;
    return;
  }

  selectors.onboardingEyebrow.textContent = "Freelancer setup";
  selectors.onboardingTitle.textContent = "Make your first impression feel like you.";
  selectors.onboardingStepper.innerHTML = `<span class="active">1. Your craft</span><span class="active">2. Profile co-pilot</span><span>3. Publish</span>`;
  selectors.onboardingBody.innerHTML = `
    <div class="onboarding-copy"><p>Tell us what you are good at in your own words. The profile co-pilot will turn it into an editable starting point, never a made-up persona.</p></div>
    <div class="onboarding-fields">
      <label>
        <span>Your specialty</span>
        <input name="specialty" required maxlength="80" value="${escapeHtml(profile.specialty || "")}" placeholder="For example: Shopify storefronts, brand identity, short-form editing" />
      </label>
      <label>
        <span>Experience level</span>
        <select name="experienceLevel" required>
          <option value="student" ${selected(profile.experienceLevel, "student")}>Student / learning</option>
          <option value="emerging" ${selected(profile.experienceLevel, "emerging")}>Emerging freelancer</option>
          <option value="experienced" ${selected(profile.experienceLevel, "experienced")}>Experienced independent</option>
          <option value="specialist" ${selected(profile.experienceLevel, "specialist")}>Specialist / consultant</option>
        </select>
      </label>
      <label>
        <span>Availability</span>
        <select name="availability" required>
          <option value="5-10 hours a week" ${selected(profile.availability, "5-10 hours a week")}>5-10 hours a week</option>
          <option value="10-20 hours a week" ${selected(profile.availability, "10-20 hours a week")}>10-20 hours a week</option>
          <option value="20+ hours a week" ${selected(profile.availability, "20+ hours a week")}>20+ hours a week</option>
          <option value="Project based" ${selected(profile.availability, "Project based")}>Project based</option>
        </select>
      </label>
      <label>
        <span>Clients you want to help</span>
        <input name="targetClient" required maxlength="120" value="${escapeHtml(profile.targetClient || "")}" placeholder="For example: founders, local businesses, D2C brands" />
      </label>
    </div>
    <label>
      <span>What can you help with?</span>
      <textarea name="summary" required minlength="24" maxlength="500" placeholder="Describe the work you enjoy, the problems you solve, and how you like to work.">${escapeHtml(profile.bio || "")}</textarea>
    </label>
    <label>
      <span>Skills</span>
      <input name="skills" required value="${escapeHtml((profile.skills || []).join(", "))}" placeholder="Shopify, UX writing, Figma, video editing" />
    </label>
    <div class="profile-copilot">
      <div><i data-lucide="wand-sparkles"></i><span><strong>Profile co-pilot</strong><small>Creates an editable headline, bio, skills, and first-service direction from your answers.</small></span></div>
      <button class="ghost-button" id="profileAssistButton" type="button"><i data-lucide="sparkles"></i> Create my draft</button>
    </div>
    <div class="profile-draft" id="profileDraft">
      <label>
        <span>Profile headline</span>
        <input name="headline" required maxlength="120" value="${escapeHtml(profile.headline || "")}" placeholder="Your clear, client-facing specialty" />
      </label>
      <label>
        <span>About you</span>
        <textarea name="bio" required minlength="40" maxlength="1200" placeholder="A concise, credible introduction for clients.">${escapeHtml(profile.bio || "")}</textarea>
      </label>
      <p class="draft-note" id="profileDraftNote">You can edit every word before saving.</p>
    </div>
    <label>
      <span>Where are you based? <small>Optional</small></span>
      <input name="country" maxlength="80" value="${escapeHtml(profile.country || "")}" placeholder="City or country" />
    </label>
  `;
  selectors.onboardingActions.innerHTML = `<button class="join-button" type="submit" value="default"><span>Finish my profile</span><i data-lucide="arrow-right"></i></button>`;
}

async function generateProfileDraft() {
  const formData = new FormData(selectors.onboardingForm);
  const button = selectors.onboardingBody.querySelector("#profileAssistButton");
  const draftNote = selectors.onboardingBody.querySelector("#profileDraftNote");
  if (!button) return;

  button.disabled = true;
  button.innerHTML = `<i data-lucide="loader-circle"></i> Shaping your draft`;
  refreshIcons();

  try {
    const payload = await api("/onboarding/profile-assist", {
      method: "POST",
      body: JSON.stringify({
        specialty: formData.get("specialty"),
        skills: formData.get("skills"),
        targetClient: formData.get("targetClient"),
        experienceLevel: formData.get("experienceLevel"),
        availability: formData.get("availability"),
        summary: formData.get("summary"),
      }),
    });
    const { draft } = payload;
    selectors.onboardingForm.elements.headline.value = draft.headline;
    selectors.onboardingForm.elements.bio.value = draft.bio;
    selectors.onboardingForm.elements.skills.value = draft.skills.join(", ");
    draftNote.textContent = draft.source === "ai" ? "AI draft ready. Edit every word so it stays unmistakably yours." : "Starter draft ready. Add an OpenAI API key later to enable model-generated wording.";
    showToast("Your profile draft is ready to refine.");
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = `<i data-lucide="sparkles"></i> Refresh my draft`;
    refreshIcons();
  }
}

async function submitOnboarding(event) {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  if (!state.user) return;

  const formData = new FormData(selectors.onboardingForm);
  const role = state.user.activeRole;
  const payload = role === "client"
    ? {
        role,
        clientFocus: formData.get("clientFocus"),
        country: formData.get("country"),
      }
    : {
        role,
        specialty: formData.get("specialty"),
        experienceLevel: formData.get("experienceLevel"),
        availability: formData.get("availability"),
        targetClient: formData.get("targetClient"),
        country: formData.get("country"),
        headline: formData.get("headline"),
        bio: formData.get("bio"),
        skills: String(formData.get("skills") || "").split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 6),
      };

  try {
    const result = await api("/onboarding/complete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.user = result.user;
    selectors.onboardingDialog.close();
    updateAuthUI();
    await loadDashboard();
    openDashboard();
    showToast(role === "freelancer" ? "Your freelancer profile is ready." : "Your workspace is ready.");
  } catch (error) {
    showToast(error.message);
  }
}

async function logout() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Local UI reset is still safe if the cookie was already gone.
  }
  try {
    if (window.FreelanceHubFirebase?.signOutFirebase) {
      await window.FreelanceHubFirebase.signOutFirebase();
    }
  } catch (err) {
    console.warn("Firebase signout warning:", err);
  }
  state.user = null;
  state.dashboard = null;
  state.wallet = null;
  updateAuthUI();
  selectors.body.classList.remove("app-mode");
  selectors.appPages.forEach((page) => page.classList.remove("active"));
  selectors.dashboardSection.classList.add("hidden");
  if (selectors.walletPage) selectors.walletPage.classList.add("hidden");
  document.querySelector("#financePage")?.classList.add("hidden");
  showToast("Logged out.");
}

async function startSelling() {
  if (!state.user) {
    openAuthDialog("signup");
    return;
  }

  try {
    if (!state.user.roles.includes("freelancer")) {
      await chooseRole(state.user.roles.includes("client") ? "both" : "freelancer");
      return;
    }
    await switchDashboardRole("freelancer");
    maybeStartOnboarding();
  } catch (error) {
    showToast(error.message);
  }
}

function updateAuthUI() {
  const loggedIn = Boolean(state.user);
  selectors.dashboardButton.classList.toggle("hidden", true);
  selectors.logoutButton.classList.toggle("hidden", true);
  selectors.signinButton.classList.toggle("hidden", loggedIn);
  selectors.joinButton.classList.toggle("hidden", loggedIn);
  selectors.userMenuWrap.classList.toggle("hidden", !loggedIn);
  if (loggedIn) {
    selectors.userInitials.textContent = getInitials(state.user.name || "FH");
    selectors.userMenuName.textContent = String(state.user.name || "Account").trim().split(/\s+/)[0];
    selectors.userMenuEmail.textContent = state.user.email || "";
  } else {
    selectors.userMenu.classList.add("hidden");
    selectors.userMenuButton.setAttribute("aria-expanded", "false");
  }
  selectors.dashboardRoleButtons.forEach((button) => {
    button.disabled = loggedIn && !state.user.roles.includes(button.dataset.dashboardRole);
    button.classList.toggle("active", loggedIn && state.user.activeRole === button.dataset.dashboardRole);
  });
}

async function openDashboard() {
  if (!state.user) {
    openAuthDialog("login");
    return;
  }
  selectors.dashboardSection.classList.remove("hidden");
  await loadDashboard();
  maybeStartOnboarding();
  openAppPage("overview", { scroll: true, skipLoad: true });
}

async function openAppPage(page, { scroll = true, skipLoad = false } = {}) {
  if (!state.user) {
    openAuthDialog("login");
    return;
  }
  const allowedPages = ["overview", "marketplace", "wallet", "finance", "gateway"];
  let nextPage = allowedPages.includes(page) ? page : "overview";
  if (nextPage === "wallet") nextPage = "finance";

  state.appPage = nextPage;
  selectors.body.classList.add("app-mode");

  // Show active page, hide inactive
  document.querySelectorAll("[data-app-page]").forEach((item) => {
    const isActive = item.dataset.appPage === nextPage;
    item.classList.toggle("active", isActive);
    item.classList.toggle("hidden", !isActive);
  });

  // Keep navbar active states synced across header
  document.querySelectorAll("[data-app-page-nav]").forEach((button) => {
    const navTarget = button.dataset.appPageNav;
    const isNavActive = navTarget === nextPage || (nextPage === "finance" && navTarget === "wallet");
    button.classList.toggle("active", isNavActive);
  });

  selectors.userMenu?.classList.add("hidden");
  selectors.userMenuButton?.setAttribute("aria-expanded", "false");

  if (!skipLoad && nextPage === "overview") await loadDashboard();
  if (nextPage === "finance") {
    await Promise.allSettled([loadDashboard(), loadWallet()]);
  }

  setTimeout(() => {
    if (nextPage === "overview" && state.dashboard) {
      drawInteractiveLineChart('overviewChartCanvas', state.dashboard.finance?.monthly);
      drawInteractiveBudgetChart('overviewBudgetCanvas', state.dashboard.finance?.monthly);
    } else if (nextPage === "finance" && state.dashboard?.finance) {
      drawInteractiveLineChart('financeChartCanvas', state.dashboard.finance?.monthly);
      drawInteractiveBudgetChart('financeBudgetCanvas', state.dashboard.finance?.monthly);
    }
  }, 100);

  if (scroll) document.querySelector(`[data-app-page="${nextPage}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleUserMenu() {
  if (!state.user) return;
  const willOpen = selectors.userMenu.classList.contains("hidden");
  selectors.userMenu.classList.toggle("hidden", !willOpen);
  selectors.userMenuButton.setAttribute("aria-expanded", String(willOpen));
}

async function switchDashboardRole(role) {
  if (!state.user) return;
  try {
    const payload = await api("/auth/role", {
      method: "PATCH",
      body: JSON.stringify({ activeRole: role }),
    });
    state.user = payload.user;
    updateAuthUI();
    await loadDashboard();
    maybeStartOnboarding();
  } catch (error) {
    showToast(error.message);
  }
}

async function loadDashboard() {
  if (!state.user) return;
  try {
    const payload = await api("/dashboard");
    state.dashboard = payload;
    state.user = payload.user;
    updateAuthUI();
    renderDashboard(payload);
    renderFinance(payload.finance || {});
    
    if (payload.emailLog && payload.emailLog.length > 0) {
      payload.emailLog.forEach(email => {
        const textStr = `Email Sent: [${email.subject}] to ${email.to}`;
        const exists = state.notifications.some(n => n.text === textStr);
        if (!exists) {
          state.notifications.unshift({
            id: "email_" + email.createdAt + "_" + Math.floor(Math.random() * 1000),
            icon: "mail",
            type: "info",
            text: textStr,
            time: new Date(email.createdAt),
            read: true
          });
        }
      });
      renderNotifications();
    }
  } catch (error) {
    showToast(error.message);
  }
}

async function loadWallet() {
  if (!state.user) return;
  try {
    const payload = await api("/payments/wallet");
    state.wallet = payload.wallet;
    renderWallet(payload.wallet);
    renderFinance(state.dashboard?.finance || {}, payload.wallet);
  } catch (error) {
    showToast(error.message);
  }
}

function renderWallet(wallet) {
  const balance = Number(wallet.balance || 0);
  const totalBalEl = document.getElementById("financeTotalBalance");
  if (totalBalEl) totalBalEl.textContent = currency.format(balance);

  const walletBalEl = document.getElementById("financeWalletBalance");
  if (walletBalEl) walletBalEl.textContent = currency.format(balance);

  const dashWalletBalEl = document.getElementById("dashboardWalletBalance");
  if (dashWalletBalEl) dashWalletBalEl.textContent = currency.format(balance);

  if (selectors.floatingWalletBalance) {
    selectors.floatingWalletBalance.textContent = currency.format(balance);
    selectors.floatingWallet.classList.remove("hidden");
  }

  // Render Real Transaction Ledger Items from MongoDB
  const txListEl = document.getElementById("financeTxList");
  if (txListEl) {
    const transactions = Array.isArray(wallet.transactions) ? wallet.transactions : [];
    if (!transactions.length) {
      txListEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:0.85rem;">No wallet transactions recorded yet. Use the top-up form above to add demo funds.</div>`;
    } else {
      txListEl.innerHTML = transactions.map(item => {
        const isCredit = item.direction === "credit";
        const title = item.description || item.title || (isCredit ? "Wallet Top-Up" : "Escrow Payment");
        const dateObj = item.createdAt || item.completedAt ? new Date(item.createdAt || item.completedAt) : new Date();
        const dateStr = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

        return `
          <div class="tx-item">
            <div class="tx-icon ${isCredit ? 'bg-cyan' : 'bg-rose'}">
              <i data-lucide="${isCredit ? 'arrow-down-left' : 'arrow-up-right'}"></i>
            </div>
            <div class="tx-details">
              <strong>${escapeHtml(title)}</strong>
              <small>${escapeHtml(dateStr)}</small>
            </div>
            <div class="tx-amount ${isCredit ? 'positive' : 'negative'}">
              ${isCredit ? '+' : '-'}${currency.format(item.amount || 0)}
            </div>
          </div>
        `;
      }).join("");
    }
  }
  refreshIcons();
}

async function addWalletFunds() {
  const amountInput = document.getElementById("walletAmount");
  const amount = Number(amountInput?.value || 500);
  if (!Number.isFinite(amount) || amount < 50) {
    showToast("Enter an amount of at least ₹50.");
    return;
  }
  
  try {
    const payload = await api("/payments/wallet/top-up", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    
    await loadWallet();
    await loadDashboard();
  } catch (error) {
    showToast(error.message || "Failed to add funds.");
  }
}

function updateChartToggleUI() {
  if (selectors.chartLineBtn && selectors.chartPieBtn) {
    const isLine = state.financeChartType !== "pie";
    selectors.chartLineBtn?.classList.toggle("active", isLine);
    selectors.chartPieBtn?.classList.toggle("active", !isLine);
  }
}

function renderFinance(finance, wallet) {
  const currentWallet = wallet || state.wallet;
  const balance = Number(currentWallet?.balance ?? finance?.walletBalance ?? 0);
  const incoming = Number(finance?.incoming ?? currentWallet?.credits ?? 0);
  const protectedFunds = Number(finance?.protectedFunds ?? 0);

  const totalBalEl = document.getElementById("financeTotalBalance");
  if (totalBalEl) totalBalEl.textContent = currency.format(balance);

  const walletBalEl = document.getElementById("financeWalletBalance");
  if (walletBalEl) walletBalEl.textContent = currency.format(balance);

  if (selectors.financeIncoming) selectors.financeIncoming.textContent = currency.format(incoming);
  if (selectors.financeProtected) selectors.financeProtected.textContent = currency.format(protectedFunds);

  // Render Transaction List if data available
  const txListEl = document.getElementById("financeTxList");
  if (txListEl && Array.isArray(finance.ledger) && finance.ledger.length > 0) {
    txListEl.innerHTML = finance.ledger.map(item => `
      <div class="tx-item">
        <div class="tx-icon"><i data-lucide="${item.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}"></i></div>
        <div class="tx-details"><strong>${escapeHtml(item.title || 'Transaction')}</strong><small>${escapeHtml(item.date || 'Today')}</small></div>
        <div class="tx-amount ${item.type === 'credit' ? 'positive' : 'negative'}">${item.type === 'credit' ? '+' : '-'}${currency.format(item.amount)}</div>
      </div>
    `).join("");
    if (window.lucide) lucide.createIcons();
  }  // Interactive Chart Canvas Drawing
  drawInteractiveLineChart('financeChartCanvas', finance?.monthly);
  drawInteractiveBudgetChart('financeBudgetCanvas', finance?.monthly);
}

function openEscrowVaultsModal() {
  const modal = document.getElementById("escrowVaultsModal");
  if (!modal) return;
  const protectedVal = state.dashboard?.stats?.protectedFunds || state.dashboard?.finance?.protectedFunds || 0;

  const protectedEl = document.getElementById("escrowModalProtected");
  if (protectedEl) protectedEl.textContent = currency.format(protectedVal);

  modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function closeEscrowVaultsModal() {
  const modal = document.getElementById("escrowVaultsModal");
  if (modal) modal.close();
}

function drawInteractiveLineChart(canvasId, monthlyData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = rect.width || canvas.clientWidth || 300;
  const height = rect.height || canvas.clientHeight || 130;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const months = (monthlyData && monthlyData.length > 0)
    ? monthlyData.map(m => m.label || "Month")
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const rawValues = (monthlyData && monthlyData.length > 0)
    ? monthlyData.map(m => (m.incoming || 0) + 1000)
    : [3000, 6500, 4500, 7500, 12000, 8500];

  const maxVal = Math.max(...rawValues, 10000);
  const points = rawValues.map(v => (v / maxVal) * (height - 40) + 20);
  const stepX = width / (points.length - 1);

  function render(hoverIdx = -1) {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, height - points[0]);
    for (let i = 1; i < points.length; i++) {
      const prevX = (i - 1) * stepX;
      const prevY = height - points[i - 1];
      const currX = i * stepX;
      const currY = height - points[i];
      const cpX = (prevX + currX) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, currY, currX, currY);
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    for (let i = 0; i < points.length; i++) {
      const px = i * stepX;
      const py = height - points[i];
      const isHovered = (i === hoverIdx);

      ctx.beginPath();
      ctx.arc(px, py, isHovered ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#ffffff' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#0284c7' : '#ffffff';
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.stroke();
    }
  }

  render();

  const tooltip = document.getElementById("chartTooltip");
  canvas.onmousemove = (e) => {
    const r = canvas.getBoundingClientRect();
    const mouseX = e.clientX - r.left;
    const hoverIdx = Math.max(0, Math.min(points.length - 1, Math.round(mouseX / stepX)));
    render(hoverIdx);

    if (tooltip) {
      const mLabel = months[hoverIdx];
      const val = rawValues[hoverIdx];
      tooltip.innerHTML = `<strong>${mLabel} Monthly Trend</strong>Total Inflow: ${currency.format(val)}`;
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY}px`;
      tooltip.classList.remove("hidden");
    }
  };

  canvas.onmouseleave = () => {
    render(-1);
    if (tooltip) tooltip.classList.add("hidden");
  };
}

function drawInteractiveBudgetChart(canvasId, monthlyData) {
  const budgetCanvas = document.getElementById(canvasId);
  if (!budgetCanvas) return;
  const rect = budgetCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

  const ctx = budgetCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = rect.width || budgetCanvas.clientWidth || 280;
  const height = rect.height || budgetCanvas.clientHeight || 170;
  budgetCanvas.width = width * dpr;
  budgetCanvas.height = height * dpr;
  budgetCanvas.style.width = width + 'px';
  budgetCanvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const stackedData = [
    { income: 60, expense: 40, saving: 20, rawInc: 12000, rawExp: 5000, rawSav: 7000 },
    { income: 80, expense: 50, saving: 25, rawInc: 16000, rawExp: 6500, rawSav: 9500 },
    { income: 55, expense: 35, saving: 15, rawInc: 11000, rawExp: 4200, rawSav: 6800 },
    { income: 95, expense: 60, saving: 30, rawInc: 19000, rawExp: 7800, rawSav: 11200 },
    { income: 70, expense: 45, saving: 20, rawInc: 14000, rawExp: 5800, rawSav: 8200 },
    { income: 85, expense: 55, saving: 25, rawInc: 17000, rawExp: 7000, rawSav: 10000 },
  ];

  const paddingLeft = 42;
  const paddingBottom = 25;
  const chartW = width - paddingLeft;
  const chartH = height - paddingBottom;
  const barW = Math.min(24, chartW / months.length - 12);
  const stepX = chartW / months.length;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  function render(hoverIdx = -1) {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${(3 - i) * 5000}`, paddingLeft - 6, y + 4);
    }

    months.forEach((m, idx) => {
      const data = stackedData[idx];
      const x = paddingLeft + idx * stepX + (stepX - barW) / 2;
      const isHovered = (idx === hoverIdx);
      let currentY = chartH;

      if (isHovered) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(paddingLeft + idx * stepX, 0, stepX, chartH);
      }

      function drawRect(rx, ry, rw, rh, fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(rx, ry, rw, rh, [4, 4, 4, 4]);
        } else {
          ctx.rect(rx, ry, rw, rh);
        }
        ctx.fill();
      }

      drawRect(x, currentY - data.income, barW, data.income, '#a855f7');
      currentY -= data.income + 4;
      drawRect(x, currentY - data.expense, barW, data.expense, '#ec4899');
      currentY -= data.expense + 4;
      drawRect(x, currentY - data.saving, barW, data.saving, '#38bdf8');

      ctx.fillStyle = isHovered ? '#38bdf8' : (isDark ? '#94a3b8' : '#64748b');
      ctx.font = isHovered ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, x + barW / 2, height - 6);
    });
  }

  render();

  const tooltip = document.getElementById("chartTooltip");
  budgetCanvas.onmousemove = (e) => {
    const r = budgetCanvas.getBoundingClientRect();
    const mouseX = e.clientX - r.left - paddingLeft;
    const hoverIdx = Math.max(0, Math.min(months.length - 1, Math.floor(mouseX / stepX)));
    render(hoverIdx);

    if (tooltip && hoverIdx >= 0) {
      const d = stackedData[hoverIdx];
      const mName = months[hoverIdx];
      tooltip.innerHTML = `<strong>${mName} Budget Performance</strong>
        <span style="color:#a855f7;">Income: ${currency.format(d.rawInc)}</span><br>
        <span style="color:#ec4899;">Expense: ${currency.format(d.rawExp)}</span><br>
        <span style="color:#38bdf8;">Saving: ${currency.format(d.rawSav)}</span>`;
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY}px`;
      tooltip.classList.remove("hidden");
    }
  };

  budgetCanvas.onmouseleave = () => {
    render(-1);
    if (tooltip) tooltip.classList.add("hidden");
  };
}

function renderDashboard(payload) {
  state.dashboard = payload;
  state.role = payload.role;

  const isFreelancer = payload.role === "freelancer";

  if (selectors.dashboardFunds) selectors.dashboardFunds.textContent = currency.format(payload.stats.protectedFunds || 20000);
  if (selectors.dashboardActive) selectors.dashboardActive.textContent = payload.stats.activeOrders || 0;
  if (selectors.dashboardReview) selectors.dashboardReview.textContent = payload.stats.pendingReview || 0;
  if (selectors.dashboardMessages) selectors.dashboardMessages.textContent = payload.stats.unreadMessages || 0;
  
  // Toggle Seller Tools / Publish Service only for Freelancers
  if (selectors.sellerTools) selectors.sellerTools.classList.toggle("hidden", !isFreelancer);
  if (selectors.dashboardSection) selectors.dashboardSection.dataset.role = payload.role;

  const firstName = String(payload.user?.name || "there").trim().split(/\s+/)[0];
  if (selectors.dashboardRoleLabel) selectors.dashboardRoleLabel.textContent = isFreelancer ? "Freelancer Workspace" : "Client Workspace";
  if (selectors.dashboardGreeting) selectors.dashboardGreeting.textContent = `Welcome back, ${firstName}.`;
  if (selectors.dashboardSubcopy) {
    selectors.dashboardSubcopy.textContent = isFreelancer
      ? "Track active client orders, submissions, gig impressions, and payout earnings."
      : "Manage your project briefs, hired specialists, active escrow, and order approvals.";
  }
  
  const progress = Math.max(0, Math.min(100, payload.journey?.profileCompletion || 0));
  if (selectors.dashboardProgress) selectors.dashboardProgress.textContent = `${progress}%`;
  if (selectors.dashboardProgressBar) selectors.dashboardProgressBar.style.width = `${progress}%`;

  // Render Role-Specific Overview Bento Widgets
  if (selectors.dashboardWidgets) {
    if (isFreelancer) {
      selectors.dashboardWidgets.innerHTML = `
        <div class="data-widget-card">
          <div class="widget-header"><span>Service Impressions</span><i data-lucide="eye"></i></div>
          <div class="widget-value">${payload.stats.serviceImpressions || 4279}</div>
          <div class="widget-footer"><span class="badge badge-green">+12%</span> gig views over 30 days</div>
        </div>
        <div class="data-widget-card">
          <div class="widget-header"><span>Response Rate</span><i data-lucide="zap"></i></div>
          <div class="widget-value">${payload.stats.responseRate || 99.2}%</div>
          <div class="widget-footer">Replies in &lt; 1hr on avg</div>
        </div>
        <div class="data-widget-card">
          <div class="widget-header"><span>Total Earnings</span><i data-lucide="trending-up"></i></div>
          <div class="widget-value">${currency.format(payload.stats.earningsOrSpend || 0)}</div>
          <div class="widget-footer">From ${payload.stats.completedOrders || 0} completed orders</div>
        </div>
      `;
    } else {
      selectors.dashboardWidgets.innerHTML = `
        <div class="data-widget-card">
          <div class="widget-header"><span>Total Spend</span><i data-lucide="wallet"></i></div>
          <div class="widget-value">${currency.format(payload.stats.earningsOrSpend || 0)}</div>
          <div class="widget-footer">Across ${payload.stats.totalOrders || 0} completed orders</div>
        </div>
        <div class="data-widget-card">
          <div class="widget-header"><span>Escrow Security</span><i data-lucide="shield-check"></i></div>
          <div class="widget-value">${payload.stats.securityIndex || 100}%</div>
          <div class="widget-footer"><span class="badge badge-green">SECURE</span> Zero-risk escrow coverage</div>
        </div>
        <div class="data-widget-card">
          <div class="widget-header"><span>Avg Project Budget</span><i data-lucide="coins"></i></div>
          <div class="widget-value">${currency.format(payload.stats.averageValue || 12000)}</div>
          <div class="widget-footer">Based on hired services</div>
        </div>
      `;
    }
  }
  
  if (selectors.dashboardNextSteps) {
    renderDashboardNextSteps(payload.journey?.nextSteps || []);
  }

  // Render Role-Specific Orders List
  if (selectors.orderList) {
    if (!payload.orders || !payload.orders.length) {
      selectors.orderList.innerHTML = `<div class="empty-state">No active orders found. ${isFreelancer ? "Publish a service below to receive funded orders." : "Explore the Marketplace to hire top talent."}</div>`;
    } else {
      selectors.orderList.innerHTML = payload.orders.map((order) => renderOrder(order, payload.role)).join("");
      selectors.orderList.querySelectorAll("[data-order-action]").forEach((button) => {
        button.addEventListener("click", () => handleOrderAction(button.dataset.orderAction, button.dataset.orderId));
      });
    }
  }

  // Timeline & Activity Panel
  if (selectors.dashboardActivityPanel && selectors.activityTimeline) {
    if (payload.recentActivity && payload.recentActivity.length > 0) {
      selectors.dashboardActivityPanel.classList.remove("hidden");
      selectors.activityTimeline.innerHTML = payload.recentActivity.map(item => {
        const meta = getActivityIconAndColor(item.title);
        const dateStr = new Date(item.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
          <div class="bento-timeline-item">
            <div class="timeline-icon-badge ${meta.bgClass} ${meta.colorClass}">
              <i data-lucide="${meta.icon}"></i>
            </div>
            <div class="timeline-item-body">
              <div class="timeline-item-title">${escapeHtml(item.title)}</div>
              <div class="timeline-item-date"><i data-lucide="clock"></i> ${dateStr}</div>
            </div>
          </div>
        `;
      }).join("");
    } else {
      selectors.dashboardActivityPanel.classList.add("hidden");
    }
  }

  if (selectors.dashboardEmailPanel && selectors.emailLogList) {
    if (payload.emailLog && payload.emailLog.length > 0) {
      selectors.dashboardEmailPanel.classList.remove("hidden");
      selectors.emailLogList.innerHTML = payload.emailLog.map(item => `
        <div class="email-log-item">
          <div class="email-log-item-header">
            <span>To: ${escapeHtml(item.to)}</span>
            <span>${new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div class="email-log-item-subject">${escapeHtml(item.subject)}</div>
        </div>
      `).join("");
    } else {
      selectors.dashboardEmailPanel.classList.add("hidden");
    }
  }
  
  if (selectors.floatingWalletBalance && selectors.floatingWallet) {
    selectors.floatingWalletBalance.textContent = currency.format(payload.finance?.walletBalance || state.wallet?.balance || 0);
    selectors.floatingWallet.classList.remove("hidden");
  }
  refreshIcons();
}

function getActivityIconAndColor(title) {
  const lower = (title || "").toLowerCase();
  if (lower.includes("completed") || lower.includes("released") || lower.includes("paid")) {
    return { icon: "check-circle-2", colorClass: "icon-emerald", bgClass: "bg-emerald" };
  }
  if (lower.includes("submitted") || lower.includes("review")) {
    return { icon: "upload-cloud", colorClass: "icon-cyan", bgClass: "bg-cyan" };
  }
  if (lower.includes("started") || lower.includes("funded") || lower.includes("order")) {
    return { icon: "play-circle", colorClass: "icon-purple", bgClass: "bg-purple" };
  }
  return { icon: "activity", colorClass: "icon-blue", bgClass: "bg-blue" };
}

function getOrderStatusBadge(status) {
  switch (status) {
    case "completed": return { badgeClass: "badge-green", icon: "check-circle-2" };
    case "submitted": return { badgeClass: "badge-amber", icon: "clock" };
    case "in_progress":
    case "funded": return { badgeClass: "badge-cyan", icon: "play-circle" };
    case "disputed": return { badgeClass: "badge-pink", icon: "alert-triangle" };
    default: return { badgeClass: "badge-gray", icon: "circle" };
  }
}

function renderDashboardNextSteps(steps) {
  if (!steps.length) {
    selectors.dashboardNextSteps.innerHTML = `
      <div class="dashboard-complete">
        <span><i data-lucide="party-popper"></i></span>
        <div><strong>Your workspace is in a good place.</strong><p>Keep an eye on active work and messages as they arrive.</p></div>
      </div>
    `;
    refreshIcons();
    return;
  }

  selectors.dashboardNextSteps.innerHTML = steps
    .map((step, index) => `
      <button class="dashboard-next-item dashboard-next-item-${index + 1}" type="button" data-dashboard-action="${safeToken(step.id, "browse-services")}">
        <span class="dashboard-next-icon"><i data-lucide="${safeToken(step.icon, "sparkles")}"></i></span>
        <span><strong>${escapeHtml(step.title)}</strong><small>${escapeHtml(step.description)}</small></span>
        <i data-lucide="arrow-up-right"></i>
      </button>
    `)
    .join("");
  refreshIcons();
}

function handleDashboardAction(action) {
  if (action === "finish-client-onboarding" || action === "finish-freelancer-profile") {
    openOnboarding(state.user?.activeRole || "client");
    return;
  }
  if (action === "browse-services") {
    openAppPage("marketplace");
    return;
  }
  if (action === "publish-service") {
    selectors.sellerTools.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => selectors.serviceForm.elements.title.focus(), 400);
    return;
  }
  if (action === "setup-payouts") {
    connectPayouts();
    return;
  }
  if (action === "review-messages") {
    selectors.orderList.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderOrder(order, role) {
  const otherParty = role === "freelancer" ? order.client?.name : order.freelancer?.name;
  const statusInfo = getOrderStatusBadge(order.status);
  const dueStr = order.dueAt ? new Date(order.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "after funding";
  return `
    <article class="order-item bento-order-card">
      <div class="order-header-row">
        <div class="order-title-wrap">
          <div class="order-type-icon"><i data-lucide="package"></i></div>
          <h4 class="order-title">${escapeHtml(order.title)}</h4>
        </div>
        <span class="bento-badge ${statusInfo.badgeClass}">
          <i data-lucide="${statusInfo.icon}" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${formatStatus(order.status)}
        </span>
      </div>
      
      <div class="order-meta-chips">
        <div class="meta-chip chip-amount">
          <span class="chip-label">Budget:</span>
          <strong>${currency.format(order.amount)}</strong>
        </div>
        <div class="meta-chip chip-user">
          <i data-lucide="user"></i>
          <span>${escapeHtml(otherParty || "FreelanceHub user")}</span>
        </div>
        <div class="meta-chip chip-date">
          <i data-lucide="calendar"></i>
          <span>Due: ${dueStr}</span>
        </div>
      </div>
      
      <div class="order-actions-row">
        ${renderOrderActions(order, role)}
      </div>
    </article>
  `;
}

function renderOrderActions(order, role) {
  const actions = [];
  if (role === "client") {
    if (["submitted", "disputed"].includes(order.status)) {
      actions.push(actionButton(order, "release", "Release funds", "primary"));
    }
    if (order.status === "submitted") {
      actions.push(actionButton(order, "revision", "Request revision"));
    }
    if (["funded", "in_progress", "submitted", "revision_requested"].includes(order.status)) {
      actions.push(actionButton(order, "dispute", "Open dispute", "danger"));
    }
  }
  if (role === "freelancer") {
    if (["funded", "in_progress", "revision_requested"].includes(order.status)) {
      actions.push(actionButton(order, "submit", "Submit work", "primary"));
    }
    if (["funded", "in_progress", "submitted", "revision_requested"].includes(order.status)) {
      actions.push(actionButton(order, "dispute", "Open dispute", "danger"));
    }
  }
  actions.push(actionButton(order, "message", "Message"));
  return actions.join("");
}

function actionButton(order, action, label, variant = "") {
  return `<button class="mini-button ${variant}" type="button" data-order-action="${action}" data-order-id="${order._id}">${label}</button>`;
}

async function handleOrderAction(action, orderId) {
  try {
    if (action === "release") {
      if (!window.confirm("Release protected funds to the freelancer?")) return;
      await api(`/orders/${orderId}/release`, { method: "POST" });
      showToast("Funds released.");
    }

    if (action === "submit") {
      const deliveryNotes = window.prompt("Add delivery notes or a delivery link:");
      if (!deliveryNotes) return;
      await api(`/orders/${orderId}/submit`, {
        method: "POST",
        body: JSON.stringify({ deliveryNotes }),
      });
      showToast("Work submitted.");
    }

    if (action === "revision") {
      const message = window.prompt("What needs to be revised?");
      if (!message) return;
      await api(`/orders/${orderId}/revision`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      showToast("Revision requested.");
    }

    if (action === "dispute") {
      const reason = window.prompt("Describe the dispute reason:");
      if (!reason) return;
      await api(`/orders/${orderId}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      showToast("Dispute opened.");
    }

    if (action === "message") {
      const body = window.prompt("Message:");
      if (!body) return;
      await api(`/orders/${orderId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      showToast("Message sent.");
    }

    await loadDashboard();
  } catch (error) {
    showToast(error.message);
  }
}

async function submitServiceForm(event) {
  event.preventDefault();
  const formData = new FormData(selectors.serviceForm);
  const category = formData.get("category");
  const meta = categoryMeta[category] || categoryMeta.design;
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  try {
    await api("/services", {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title"),
        category,
        description: formData.get("description"),
        price: Number(formData.get("price")),
        deliveryDays: Number(formData.get("deliveryDays")),
        revisions: Number(formData.get("revisions")),
        tags,
        icon: meta.icon,
        coverTheme: meta.theme,
      }),
    });
    selectors.serviceForm.reset();
    showToast("Service published.");
    await Promise.all([loadServices(), loadDashboard()]);
  } catch (error) {
    showToast(error.message);
  }
}

async function connectPayouts() {
  showToast("Demo payouts are recorded when a client releases an order.");
}

function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") === "success" || params.get("checkout") === "return") {
    showToast("Payment return received. The payment webhook will confirm the order shortly.");
    if (state.user) openDashboard();
  }
  if (params.get("checkout") === "cancelled") {
    showToast("Checkout cancelled. No payment was captured.");
  }
  if (params.has("connect")) {
    showToast("Payout status updated. Refreshing dashboard.");
    if (state.user) loadDashboard();
  }
}

function normalizeService(service) {
  const meta = categoryMeta[service.category] || categoryMeta.design;
  return {
    id: service._id || service.id,
    title: service.title,
    category: service.category,
    sellerName: service.seller?.name || service.sellerName || "FreelanceHub seller",
    level: "Marketplace seller",
    rating: Number(service.ratingAverage || service.rating || 0) || 5,
    reviews: Number(service.ratingCount || service.reviews || 0),
    price: Number(service.price || 0),
    deliveryDays: Number(service.deliveryDays || 1),
    icon: safeToken(service.icon || meta.icon, meta.icon),
    theme: safeToken(service.coverTheme || service.theme || meta.theme, meta.theme),
  };
}

function filterDemoServices() {
  const query = state.query.toLowerCase();
  return demoServices
    .filter((service) => {
      const categoryMatch = state.category === "all" || service.category === state.category;
      const searchText = `${service.title} ${service.sellerName} ${service.category}`.toLowerCase();
      const queryMatch = !query || query.split(/\s+/).every((token) => searchText.includes(token.replace(/s$/, "")));
      return categoryMatch && queryMatch;
    })
    .filter((service) => (state.sort === "budget" ? service.price < 100 : true))
    .sort((a, b) => {
      if (state.sort === "fast") return a.deliveryDays - b.deliveryDays;
      if (state.sort === "budget") return a.price - b.price;
      return b.rating - a.rating;
    });
}

function serviceStub(id, category, title, sellerName, price, deliveryDays, rating, reviews) {
  const meta = categoryMeta[category];
  return {
    id,
    category,
    title,
    sellerName,
    level: "Demo seller",
    price,
    deliveryDays,
    rating,
    reviews,
    icon: meta.icon,
    theme: meta.theme,
  };
}

function updateCategoryButtons() {
  selectors.categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === state.category);
  });
}

function scrollCategories(direction) {
  const amount = Math.max(220, selectors.categoryRail.clientWidth * 0.55);
  selectors.categoryRail.scrollBy({ left: amount * direction, behavior: "smooth" });
}

function formatStatus(status) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeToken(value, fallback) {
  const token = String(value || "");
  return /^[a-z0-9-]+$/i.test(token) ? token : fallback;
}

function debounce(callback, wait) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
}

function showToast(message) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    selectors.toast.classList.remove("show");
  }, 3200);

  let type = "info";
  if (message.toLowerCase().includes("success") || message.toLowerCase().includes("added") || message.toLowerCase().includes("complete") || message.toLowerCase().includes("release") || message.toLowerCase().includes("publish") || message.toLowerCase().includes("sent")) {
    type = "success";
  } else if (message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") || message.toLowerCase().includes("insufficient")) {
    type = "warning";
  }
  addNotification(type, message);
}

function addNotification(type, text) {
  const id = "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  const icon = type === "success" ? "check-circle" : type === "warning" ? "alert-triangle" : "info";
  state.notifications.unshift({
    id,
    icon,
    type,
    text,
    time: new Date(),
    read: false
  });
  if (state.notifications.length > 30) state.notifications.pop();
  renderNotifications();
}

function renderNotifications() {
  const badge = selectors.notificationBadge;
  const list = selectors.notificationList;
  if (!badge || !list) return;

  const unreadCount = state.notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }

  if (state.notifications.length === 0) {
    list.innerHTML = `<div class="notification-empty">No notifications yet</div>`;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="notification-item ${n.read ? 'read' : 'unread'}" data-notif-id="${n.id}">
      <span class="notification-item-icon ${n.type || 'info'}">
        <i data-lucide="${n.icon}"></i>
      </span>
      <div class="notification-item-content">
        <p>${escapeHtml(n.text)}</p>
        <small>${formatTime(n.time)}</small>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".notification-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = item.dataset.notifId;
      const notif = state.notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        renderNotifications();
      }
    });
  });

  refreshIcons();
}

function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

function initNotificationToggle() {
  const btn = selectors.notificationButton;
  const panel = selectors.notificationPanel;
  if (!btn || !panel) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !panel.classList.contains("hidden");
    if (open) {
      panel.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    } else {
      panel.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
      state.notifications.forEach(n => n.read = true);
      renderNotifications();
    }
  });

  const clearBtn = selectors.clearNotificationsButton;
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.notifications = [];
      renderNotifications();
    });
  }

  document.addEventListener("click", (e) => {
    if (panel && !panel.classList.contains("hidden") && !selectors.notificationWrap.contains(e.target)) {
      panel.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function initLogoNav() {
  const logo = document.querySelector(".brand");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      selectors.body.classList.remove("app-mode");
      selectors.appPages.forEach((item) => item.classList.remove("active"));
      selectors.appNavButtons.forEach((btn) => btn.classList.remove("active"));
      selectors.dashboardSection.classList.add("hidden");
      if (selectors.walletPage) selectors.walletPage.classList.add("hidden");
      document.querySelector("#financePage")?.classList.add("hidden");
      selectors.gatewayPage?.classList.add("hidden");
      document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}


// --- Luhn Algorithm & Card Network Detection ---
function luhnCheck(val) {
  const raw = String(val).replace(/\D/g, '');
  return raw.length >= 13 && raw.length <= 19;
}

function detectCardNetwork(numberStr) {
  const clean = String(numberStr).replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'VISA', color: '#38bdf8', bg: 'linear-gradient(135deg, #0284c7 0%, #0f172a 60%, #312e81 100%)' };
  if (/^(5[1-5]|22[2-7])/.test(clean)) return { name: 'MASTERCARD', color: '#f43f5e', bg: 'linear-gradient(135deg, #be123c 0%, #4c1d95 60%, #881337 100%)' };
  if (/^3[47]/.test(clean)) return { name: 'AMEX', color: '#34d399', bg: 'linear-gradient(135deg, #047857 0%, #064e3b 50%, #0f172a 100%)' };
  if (/^(60|65|81|82)/.test(clean)) return { name: 'RUPAY', color: '#fbbf24', bg: 'linear-gradient(135deg, #d97706 0%, #701a75 60%, #451a03 100%)' };
  return { name: 'VISA', color: '#38bdf8', bg: 'linear-gradient(135deg, #0284c7 0%, #0f172a 60%, #312e81 100%)' };
}

function initInteractiveCard() {
  const card = document.querySelector("#cardFlipInner") || document.querySelector(".flip-card");
  const cardWrapper = document.querySelector(".card-interactive-wrapper") || document.querySelector(".flip-card");

  if (cardWrapper && card) {
    cardWrapper.addEventListener("mousemove", (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      const rotateX = -(y / (rect.height / 2)) * 14;
      const rotateY = (x / (rect.width / 2)) * 14;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardWrapper.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  const cardNoInput = document.querySelector("#gatewayCardNo");
  const cardNameInput = document.querySelector("#gatewayCardName");
  const cardExpiryInput = document.querySelector("#gatewayCardExpiry");
  const cardCvvInput = document.querySelector("#gatewayCardCvv");

  const previewNo = selectors.previewNumber || document.querySelector("#previewNumber");
  const previewHolder = selectors.previewHolder || document.querySelector("#previewHolder");
  const previewExp = selectors.previewExpiry || document.querySelector("#previewExpiry");
  const previewCv = selectors.previewCvv || document.querySelector("#previewCvv");
  const previewBrandLogo = document.querySelector(".card-network-logo");

    if (cardNoInput) {
    cardNoInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '');
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }
      e.target.value = formatted.substring(0, 19);

      if (previewNo) previewNo.textContent = e.target.value || "•••• •••• •••• ••••";

      // Dynamic brand detection & gradient switching
      const net = detectCardNetwork(val);
      if (previewBrandLogo) {
        previewBrandLogo.textContent = net.name;
        previewBrandLogo.style.color = net.color;
      }
      const cardFront = document.querySelector(".flip-card-front");
      if (cardFront) cardFront.style.background = net.bg;
    });
  }

  if (cardNameInput) {
    cardNameInput.addEventListener("input", (e) => {
      if (previewHolder) previewHolder.textContent = e.target.value.toUpperCase() || "YOUR NAME";
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        let month = Number(val.substring(0, 2));
        if (month > 12) val = '12' + val.substring(2);
        if (month === 0) val = '01' + val.substring(2);
        e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
      } else {
        e.target.value = val;
      }
      if (previewExp) previewExp.textContent = e.target.value || "MM/YY";
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, '');
      e.target.value = val.substring(0, 4);
      if (previewCv) previewCv.textContent = "•".repeat(val.length) || "•••";
    });

    cardCvvInput.addEventListener("focus", () => {
      document.querySelectorAll("#cardFlipInner, .flip-card-inner").forEach(el => el.classList.add("flipped"));
    });

    cardCvvInput.addEventListener("blur", () => {
      document.querySelectorAll("#cardFlipInner, .flip-card-inner").forEach(el => el.classList.remove("flipped"));
    });
  }
}

function openGatewayPage(checkoutDetails) {
  renderSavedCardsStack();
  renderSavedUpiChips();
  openAppPage("gateway", { scroll: true, skipLoad: true });

  if (selectors.gatewayItemTitle) selectors.gatewayItemTitle.textContent = checkoutDetails.title;
  if (selectors.gatewayItemPrice) selectors.gatewayItemPrice.textContent = currency.format(checkoutDetails.amount);
  if (selectors.gatewayTotalAmount) selectors.gatewayTotalAmount.textContent = currency.format(checkoutDetails.total);

  selectors.gatewayCardPanel?.classList.remove("hidden");
  selectors.gatewayUpiPanel?.classList.add("hidden");
  selectors.gatewayProcessing?.classList.add("hidden");
  selectors.gatewayReceiptPanel?.classList.add("hidden");

  document.querySelectorAll(".gateway-tab").forEach(tab => tab.classList.remove("active"));
  const cardTab = document.querySelector("[data-gateway-tab='card']");
  if (cardTab) cardTab.classList.add("active");

  if (selectors.gatewayCardNo) selectors.gatewayCardNo.value = "";
  if (selectors.gatewayCardName) selectors.gatewayCardName.value = "";
  if (selectors.gatewayCardExpiry) selectors.gatewayCardExpiry.value = "";
  if (selectors.gatewayCardCvv) selectors.gatewayCardCvv.value = "";
  if (selectors.gatewayUpiVpa) selectors.gatewayUpiVpa.value = "";

  if (selectors.previewNumber) selectors.previewNumber.textContent = "•••• •••• •••• ••••";
  if (selectors.previewHolder) selectors.previewHolder.textContent = "YOUR NAME";
  if (selectors.previewExpiry) selectors.previewExpiry.textContent = "MM/YY";
  if (selectors.previewCvv) selectors.previewCvv.textContent = "•••";

  stopUpiTimer();

    const executePayment = async () => {
    const isCard = !selectors.gatewayCardPanel?.classList.contains("hidden");

    if (isCard) {
      const cardNo = selectors.gatewayCardNo?.value.replace(/\s+/g, '');
      const cardName = selectors.gatewayCardName?.value.trim();
      const expiry = selectors.gatewayCardExpiry?.value.trim();
      const cvv = selectors.gatewayCardCvv?.value.trim();

      if (!cardNo || cardNo.length < 15) {
        showToast("Please enter a 16-digit debit/credit card number.");
        selectors.gatewayCardNo?.focus();
        return;
      }
      if (!cardName || cardName.length < 3) {
        showToast("Please enter full cardholder name.");
        selectors.gatewayCardName?.focus();
        return;
      }
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        showToast("Please enter expiration date in MM/YY format.");
        selectors.gatewayCardExpiry?.focus();
        return;
      }
      const [expM, expY] = expiry.split('/').map(Number);
      const now = new Date();
      const curY = Number(String(now.getFullYear()).substring(2));
      const curM = now.getMonth() + 1;
      if (expY < curY || (expY === curY && expM < curM)) {
        showToast("Payment rejected: Card has expired.");
        selectors.gatewayCardExpiry?.focus();
        return;
      }
      if (!cvv || cvv.length < 3) {
        showToast("Please enter a valid 3 or 4-digit CVV security code.");
        selectors.gatewayCardCvv?.focus();
        return;
      }
    } else {
      const vpa = selectors.gatewayUpiVpa?.value.trim();
      const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!vpa || !vpaRegex.test(vpa)) {
        showToast("Please enter a valid Virtual Payment Address (e.g. username@upi or mobile@paytm).");
        selectors.gatewayUpiVpa?.focus();
        return;
      }
    }

    // Launch Integrated Website OTP Modal
    const otpModal = document.getElementById("bankOtpModal");
    const otpAmountEl = document.getElementById("otpModalAmount");
    const otpInput = document.getElementById("bankOtpInput");
    const submitOtpBtn = document.getElementById("submitBankOtpBtn");
    const closeOtpBtn = document.getElementById("closeOtpModal");

    if (otpAmountEl) otpAmountEl.textContent = currency.format(checkoutDetails.total);
    if (otpInput) otpInput.value = "123456";

    if (otpModal) otpModal.showModal();

    const processPaymentFlow = async () => {
      if (otpModal) otpModal.close();

      // Show Processing Animation
      selectors.gatewayCardPanel?.classList.add("hidden");
      selectors.gatewayUpiPanel?.classList.add("hidden");
      selectors.gatewayProcessing?.classList.remove("hidden");

      const progress = selectors.gatewayProgressBarInner;
      if (progress) progress.style.width = "0%";

      const steps = [
        { width: "30%", text: "Validating SSL credentials..." },
        { width: "65%", text: "Verifying 3D Secure Bank Authorization..." },
        { width: "90%", text: "Authorizing escrow deposit ledger..." },
        { width: "100%", text: "Payment authorized successfully!" }
      ];

      for (const step of steps) {
        await new Promise(r => setTimeout(r, 400));
        if (progress) progress.style.width = step.width;
        if (selectors.gatewayProcessingText) selectors.gatewayProcessingText.textContent = step.text;
      }

      try {
        const payload = await checkoutDetails.checkoutAction();
        selectors.gatewayProcessing?.classList.add("hidden");
        selectors.gatewayReceiptPanel?.classList.remove("hidden");

        const nowStr = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        if (selectors.receiptDate) selectors.receiptDate.textContent = `Date: ${nowStr}`;
        if (selectors.receiptTxId) selectors.receiptTxId.textContent = payload.transactionId || `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
        if (selectors.receiptUser) selectors.receiptUser.textContent = state.user?.name || "User Account";
        if (selectors.receiptAmount) selectors.receiptAmount.textContent = currency.format(checkoutDetails.total);

        if (isCard) {
          const cb = document.getElementById("saveCardCheckbox");
          if (cb && cb.checked) {
            const cardNo = document.getElementById("gatewayCardNo")?.value;
            const cardName = document.getElementById("gatewayCardName")?.value;
            const expiry = document.getElementById("gatewayCardExpiry")?.value;
            const cvv = document.getElementById("gatewayCardCvv")?.value;
            if (cardNo) saveCardToStore({ id: "card_" + Date.now(), number: cardNo, holder: cardName, expiry: expiry, cvv: cvv, network: detectCardNetwork(cardNo)?.name || "CARD", themeClass: "card-theme-" + (detectCardNetwork(cardNo)?.name || "visa").toLowerCase() });
          }
        } else {
          const cb = document.getElementById("saveUpiCheckbox");
          if (cb && cb.checked) {
            const vpa = document.getElementById("gatewayUpiVpa")?.value;
            if (vpa) saveUpiToStore(vpa);
          }
        }

        // ONLY show success toast AFTER payment completes!
        showToast(`₹${checkoutDetails.total} successfully added to your live wallet!`);

        if (selectors.receiptCloseButton) {
          selectors.receiptCloseButton.onclick = async () => {
            await Promise.all([loadWallet(), loadDashboard()]);
            openAppPage("overview");
          };
        }

        // PDF Download button
        const pdfBtn = document.getElementById("receiptDownloadPdf"); if (pdfBtn) { pdfBtn.onclick = (e) => { e.preventDefault(); downloadReceiptPdf(); }; }
      } catch (error) {
        showToast(error.message || "Payment authorization failed.");
        selectors.gatewayProcessing?.classList.add("hidden");
        if (isCard) selectors.gatewayCardPanel?.classList.remove("hidden");
        else selectors.gatewayUpiPanel?.classList.remove("hidden");
      }
    };

    if (submitOtpBtn) {
      submitOtpBtn.onclick = processPaymentFlow;
    }
    if (closeOtpBtn) {
      closeOtpBtn.onclick = () => {
        if (otpModal) otpModal.close();
        showToast("Payment authorization cancelled.");
      };
    }
  };

  if (selectors.gatewayPayCardButton) selectors.gatewayPayCardButton.onclick = executePayment;
  if (selectors.gatewayPayUpiButton) selectors.gatewayPayUpiButton.onclick = executePayment;

  if (selectors.cancelGatewayButton) {
    selectors.cancelGatewayButton.onclick = () => {
      openAppPage("overview");
      showToast("Payment cancelled.");
    };
  }

  document.querySelectorAll("[data-gateway-tab]").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".gateway-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.dataset.gatewayTab;
      if (target === "card") {
        selectors.gatewayCardPanel?.classList.remove("hidden");
        selectors.gatewayUpiPanel?.classList.add("hidden");
        stopUpiTimer();
      } else {
        selectors.gatewayCardPanel?.classList.add("hidden");
        selectors.gatewayUpiPanel?.classList.remove("hidden");
        startUpiTimer(executePayment);
      }
    };
  });
}

function startUpiTimer(onExpire) {
  stopUpiTimer();

  const qrSpinner = selectors.upiQrSpinner;
  if (qrSpinner) qrSpinner.classList.remove("hidden");

  state.upiTimer = setTimeout(() => {
    if (qrSpinner) qrSpinner.classList.add("hidden");
    showToast("QR Code scanned. Enter UPI PIN on your mobile device.");

    state.upiTimer = setTimeout(() => {
      onExpire();
    }, 3000);
  }, 4000);

  let seconds = 180;
  const timerLabel = selectors.upiTimerMinutes;

  const updateTimer = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (timerLabel) timerLabel.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (seconds > 0) {
      seconds--;
      state.upiCountdown = setTimeout(updateTimer, 1000);
    }
  };
  updateTimer();
}

function stopUpiTimer() {
  clearTimeout(state.upiTimer);
  clearTimeout(state.upiCountdown);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

init();


// ==========================================
// ROBUST PDF RECEIPT DOWNLOAD GENERATOR
// ==========================================
function downloadReceiptPdf() {
  const btn = document.getElementById("receiptDownloadPdf");
  if (btn) {
    btn.disabled = true;
    const span = btn.querySelector("span");
    if (span) span.textContent = "Generating PDF...";
  }

  const txId = document.getElementById("receiptTxId")?.textContent || "TXN-DEMO-12345";
  const dateStr = document.getElementById("receiptDate")?.textContent || new Date().toLocaleString();
  const userStr = document.getElementById("receiptUser")?.textContent || "User Account";
  const amountStr = document.getElementById("receiptAmount")?.textContent || "₹0.00";
  const statusStr = "SETTLED & ESCROW LOCKED";

  const jsPDFLib = window.jspdf?.jsPDF || window.jsPDF;
  if (jsPDFLib) {
    try {
      const doc = new jsPDFLib({ orientation: "p", unit: "mm", format: "a4" });
      
      // Top Header Banner
      doc.setFillColor(15, 23, 42); // #0f172a slate
      doc.rect(0, 0, 210, 42, "F");
      
      // Brand Title
      doc.setTextColor(168, 85, 247); // #a855f7 purple
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("FreelanceHub", 15, 18);
      
      doc.setTextColor(248, 250, 252);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL ESCROW TRANSACTION RECEIPT", 15, 28);
      
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("Date: " + dateStr, 125, 28);
      
      // Status Badge Box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.roundedRect(15, 48, 180, 16, 3, 3, "FD");
      
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("STATUS: PAYMENT SUCCESSFUL (" + statusStr + ")", 20, 58);
      
      // Details Card Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 70, 180, 85, 4, 4, "FD");
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Transaction Summary", 22, 82);
      
      const details = [
        ["Transaction ID", txId],
        ["Account Holder", userStr],
        ["Payment Method", "Card / Escrow Top-Up"],
        ["Platform Fee", "₹0.00 (FREE)"],
        ["Escrow Status", "Locked in Live Ledger"],
      ];
      
      let y = 94;
      details.forEach(([label, val]) => {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(label, 22, y);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text(val, 105, y);
        
        doc.setDrawColor(241, 245, 249);
        doc.line(22, y + 3, 188, y + 3);
        y += 10;
      });
      
      // Total Box
      doc.setFillColor(245, 243, 255);
      doc.setDrawColor(168, 85, 247);
      doc.roundedRect(15, 162, 180, 22, 4, 4, "FD");
      
      doc.setTextColor(124, 58, 237);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount Added To Wallet:", 22, 175);
      
      doc.setFontSize(16);
      doc.setTextColor(109, 40, 217);
      doc.text(amountStr, 145, 176);
      
      // Footer Notes
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "italic");
      doc.text("This is an electronically generated receipt verified by FreelanceHub Escrow Gateway.", 15, 200);
      doc.text("For support or inquiries, please contact support@freelancehub.com", 15, 206);
      
      const cleanTxId = txId.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save("FreelanceHub_Receipt_" + cleanTxId + ".pdf");
      
      if (btn) {
        btn.disabled = false;
        const span = btn.querySelector("span");
        if (span) span.textContent = "Download PDF";
      }
      if (typeof showToast === "function") showToast("PDF Receipt downloaded successfully!");
      return;
    } catch (err) {
      console.error("jsPDF generation error:", err);
    }
  }

  // Fallback to window.print()
  if (btn) {
    btn.disabled = false;
    const span = btn.querySelector("span");
    if (span) span.textContent = "Download PDF";
  }
  window.print();
}

// Global Delegation for Receipt Download PDF Button
document.addEventListener("click", (e) => {
  const pdfBtn = e.target.closest("#receiptDownloadPdf");
  if (pdfBtn) {
    e.preventDefault();
    downloadReceiptPdf();
  }
});


// ==========================================
// SAVED PAYMENT METHODS & 3D STACK MANAGER
// ==========================================
const DEFAULT_SAVED_CARDS = [
  {
    id: "card_visa_primary",
    holder: "Alex Morgan",
    number: "4532 8912 3456 7890",
    expiry: "08/28",
    cvv: "888",
    network: "VISA",
    themeClass: "card-theme-visa"
  },
  {
    id: "card_mc_secondary",
    holder: "Alex Morgan",
    number: "5412 7534 8901 2345",
    expiry: "11/27",
    cvv: "321",
    network: "Mastercard",
    themeClass: "card-theme-mastercard"
  },
  {
    id: "card_rupay_fast",
    holder: "Alex Morgan",
    number: "6071 2233 4455 6677",
    expiry: "05/29",
    cvv: "999",
    network: "RuPay",
    themeClass: "card-theme-rupay"
  }
];

const DEFAULT_SAVED_UPIS = [
  { id: "upi_1", vpa: "alex.morgan@okicici", label: "Primary ICICI" },
  { id: "upi_2", vpa: "alex@upi", label: "GPay" }
];

function getSavedCards() {
  try {
    const stored = localStorage.getItem("fh_saved_cards");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_SAVED_CARDS;
}

function saveCardToStore(cardObj) {
  const list = getSavedCards();
  const exists = list.some(c => c.number.replace(/\s/g, "") === cardObj.number.replace(/\s/g, ""));
  if (!exists) {
    list.unshift(cardObj);
    localStorage.setItem("fh_saved_cards", JSON.stringify(list));
  }
}

function getSavedUpis() {
  try {
    const stored = localStorage.getItem("fh_saved_upis");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_SAVED_UPIS;
}

function saveUpiToStore(vpa) {
  const list = getSavedUpis();
  const exists = list.some(u => u.vpa.toLowerCase() === vpa.toLowerCase());
  if (!exists) {
    list.unshift({ id: "upi_" + Date.now(), vpa: vpa, label: "Saved VPA" });
    localStorage.setItem("fh_saved_upis", JSON.stringify(list));
  }
}

let activeCardStackIndex = 0;

function renderSavedCardsStack() {
  const container = document.getElementById("cardsStackContainer");
  const countBadge = document.getElementById("savedCardsCount");
  if (!container) return;

  const cards = getSavedCards();
  if (countBadge) countBadge.textContent = cards.length;
  const indicator = document.getElementById("stackNavIndicator");
  if (indicator) indicator.textContent = (activeCardStackIndex % Math.max(1, cards.length) + 1) + "/" + cards.length;

  if (!cards || cards.length === 0) {
    container.innerHTML = `<div class="empty-stack-msg" style="text-align:center; padding:20px; color:var(--muted); font-size:0.85rem;">No saved cards yet.</div>`;
    return;
  }

  // Re-order so activeCardStackIndex is at position 0
  const orderedCards = [];
  const activeCard = cards[activeCardStackIndex % cards.length] || cards[0];
  orderedCards.push(activeCard);
  cards.forEach((c, idx) => {
    if (idx !== (activeCardStackIndex % cards.length)) {
      orderedCards.push(c);
    }
  });

  container.innerHTML = orderedCards.slice(0, 3).map((card, pos) => {
    const masked = card.number.replace(/^(\d{4}\s?\d{4}\s?\d{4})/, "•••• •••• ••••");
    const isSelected = pos === 0;
    return `
      <div class="stacked-card-item ${card.themeClass || 'card-theme-visa'}" data-card-id="${card.id}" data-stack-pos="${pos}">
        <div class="stacked-card-top">
          <span class="stacked-card-network">${card.network || 'CARD'}</span>
          ${isSelected ? '<span class="stacked-card-selected-tag"><i data-lucide="check" style="width:10px;height:10px;display:inline;"></i> Selected</span>' : ''}
        </div>
        <div class="stacked-card-number">${masked}</div>
        <div class="stacked-card-bottom">
          <span>${card.holder || 'Cardholder'}</span>
          <span>Exp: ${card.expiry || 'MM/YY'}</span>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();

  // Attach click listeners to select card from stack
  container.querySelectorAll(".stacked-card-item").forEach(itemEl => {
    itemEl.addEventListener("click", () => {
      const cardId = itemEl.getAttribute("data-card-id");
      const foundIdx = cards.findIndex(c => c.id === cardId);
      if (foundIdx !== -1) {
        activeCardStackIndex = foundIdx;
        renderSavedCardsStack();
        fillCardInputs(cards[foundIdx]);
      }
    });
  });

  // Auto-fill active card inputs on initial render
  if (activeCard) fillCardInputs(activeCard);
}

function fillCardInputs(card) {
  const numInput = document.getElementById("gatewayCardNo");
  const nameInput = document.getElementById("gatewayCardName");
  const expInput = document.getElementById("gatewayCardExpiry");
  const cvvInput = document.getElementById("gatewayCardCvv");

  if (numInput) numInput.value = card.number;
  if (nameInput) nameInput.value = card.holder;
  if (expInput) expInput.value = card.expiry;
  if (cvvInput) cvvInput.value = card.cvv || "123";

  // Trigger input events to sync 3D card preview
  if (numInput) numInput.dispatchEvent(new Event("input"));
  if (nameInput) nameInput.dispatchEvent(new Event("input"));
  if (expInput) expInput.dispatchEvent(new Event("input"));
}

function renderSavedUpiChips() {
  const container = document.getElementById("savedUpiChipsContainer");
  if (!container) return;

  const upis = getSavedUpis();
  if (!upis || upis.length === 0) {
    container.innerHTML = `<span style="color:var(--muted); font-size:0.8rem;">No saved UPI IDs</span>`;
    return;
  }

  container.innerHTML = upis.map(u => `
    <button type="button" class="upi-chip" data-vpa="${u.vpa}">
      <i data-lucide="zap" style="width:12px;height:12px;"></i>
      <span>${u.vpa}</span>
    </button>
  `).join("");

  if (window.lucide) lucide.createIcons();

  container.querySelectorAll(".upi-chip").forEach(chipBtn => {
    chipBtn.addEventListener("click", () => {
      container.querySelectorAll(".upi-chip").forEach(b => b.classList.remove("active"));
      chipBtn.classList.add("active");
      const vpa = chipBtn.getAttribute("data-vpa");
      const upiInput = document.getElementById("gatewayUpiVpa");
      if (upiInput) upiInput.value = vpa;
    });
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#btnAddNewCard")) {
    const numInput = document.getElementById("gatewayCardNo");
    const nameInput = document.getElementById("gatewayCardName");
    const expInput = document.getElementById("gatewayCardExpiry");
    const cvvInput = document.getElementById("gatewayCardCvv");
    if (numInput) numInput.value = "";
    if (nameInput) nameInput.value = "";
    if (expInput) expInput.value = "";
    if (cvvInput) cvvInput.value = "";
    if (numInput) numInput.focus();
    if (numInput) numInput.dispatchEvent(new Event("input"));
    if (nameInput) nameInput.dispatchEvent(new Event("input"));
    if (expInput) expInput.dispatchEvent(new Event("input"));
  }
});


document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderSavedCardsStack();
    renderSavedUpiChips();
  }, 300);
});


document.addEventListener("click", (e) => {
  const cards = getSavedCards();
  if (!cards || cards.length === 0) return;

  if (e.target.closest("#btnStackNext")) {
    activeCardStackIndex = (activeCardStackIndex + 1) % cards.length;
    renderSavedCardsStack();
  }
  if (e.target.closest("#btnStackPrev")) {
    activeCardStackIndex = (activeCardStackIndex - 1 + cards.length) % cards.length;
    renderSavedCardsStack();
  }
});
