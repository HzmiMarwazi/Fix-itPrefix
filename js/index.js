document.addEventListener("DOMContentLoaded", function() {

    // --- DOM ELEMENT SELECTION ---
    const headerBtn = document.getElementById("header-whatsapp-btn");
    const heroBtn = document.getElementById("hero-whatsapp-btn");
    const packageCards = document.querySelectorAll(".package-card");
    const packageBtns = document.querySelectorAll(".btn-pilih");
    const sendOrderBtn = document.getElementById("send-order-btn") || document.querySelector(".btn-send-order");
    const faqQuestions = document.querySelectorAll(".faq-question");

    // Dynamic Printing Controls
    const btnTogglePrinting = document.getElementById("btnTogglePrinting");
    const printingInputsWrapper = document.getElementById("printingInputsWrapper");
    const printType = document.getElementById("printType");
    const printPages = document.getElementById("printPages");

    // Laptop & Location Details
    const laptopBrand = document.getElementById("laptopBrand");
    const userLocation = document.getElementById("userLocation");
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");

    // Phone Number & Fallback Links
    const phoneNumber = "60149967838"; 
    const temporaryLink = "ServisOrder.html"; 

    // State Variables
    let selectedPackageName = "";
    let selectedPackagePrice = 0;
    let isPrintingSelected = false;

    // --- REDIRECT HANDLER FOR HEADER/HERO BUTTONS ---
    function handleGenericClick() {
        window.location.href = temporaryLink;
    }

    if (headerBtn) {
        headerBtn.addEventListener("click", handleGenericClick);
    }
    if (heroBtn) {
        heroBtn.addEventListener("click", handleGenericClick);
    }

    // --- PRINTING SERVICE BUTTON TOGGLE ---
    if (btnTogglePrinting && printingInputsWrapper) {
        btnTogglePrinting.addEventListener("click", function() {
            isPrintingSelected = !isPrintingSelected;

            if (isPrintingSelected) {
                printingInputsWrapper.style.display = "block";
                btnTogglePrinting.textContent = "Servis Printing Dipilih";
                btnTogglePrinting.classList.add("active-print");
            } else {
                printingInputsWrapper.style.display = "none";
                btnTogglePrinting.textContent = "Tambah Servis Printing";
                btnTogglePrinting.classList.remove("active-print");
            }
            calculateTotal();
        });
    }

    // --- DYNAMIC TOTAL PRICE CALCULATION ---
    function calculateTotal() {
        let total = selectedPackagePrice;

        // 1. Delivery Option Check
        const selectedDelivery = document.querySelector('input[name="deliveryOption"]:checked');
        if (selectedDelivery) {
            if (selectedDelivery.value === "pickup") {
                total += 2.00;
            } else if (selectedDelivery.value === "pickup_luar") {
                total += 10.00; // Base rate for estimation (RM10.00)
            }
        }

        // 2. Printing Service Cost
        if (isPrintingSelected && printType && printPages) {
            const selectedOption = printType.options[printType.selectedIndex];
            const pagePrice = parseFloat(selectedOption.getAttribute("data-price")) || 0;
            const pageCount = parseInt(printPages.value) || 0;

            if (pagePrice > 0 && pageCount > 0) {
                total += (pagePrice * pageCount);
            }
        }

        // Update display text in UI
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = "RM" + total.toFixed(2);
        }

        return total;
    }

    // --- PACKAGE SELECTION HIGHLIGHT LOGIC ---
    packageBtns.forEach(function(btn) {
        btn.addEventListener("click", function(event) {
            event.stopPropagation();

            const parentCard = btn.closest(".package-card");

            if (parentCard && parentCard.classList.contains("selected")) {
                parentCard.classList.remove("selected");
                btn.textContent = "Pilih Pakej";
                selectedPackageName = "";
                selectedPackagePrice = 0;
            } else {
                packageCards.forEach(function(card) {
                    card.classList.remove("selected");
                    const cardBtn = card.querySelector(".btn-pilih");
                    if (cardBtn) {
                        cardBtn.textContent = "Pilih Pakej";
                    }
                });

                if (parentCard) {
                    parentCard.classList.add("selected");
                    btn.textContent = "Dipilih";

                    const nameElem = parentCard.querySelector(".package-name");
                    const priceElem = parentCard.querySelector(".price");

                    selectedPackageName = nameElem ? nameElem.innerText.replace("\n", " ") : "";

                    if (priceElem) {
                        const rawPrice = priceElem.textContent.replace(/[^0-9.]/g, "");
                        selectedPackagePrice = parseFloat(rawPrice) || 0;
                    } else {
                        selectedPackagePrice = 0;
                    }
                }
            }

            calculateTotal();
        });
    });

    // Recalculate total in real-time when delivery radio changes
    const deliveryRadios = document.querySelectorAll('input[name="deliveryOption"]');
    deliveryRadios.forEach(function(radio) {
        radio.addEventListener("change", calculateTotal);
    });

    if (printType) {
        printType.addEventListener("change", calculateTotal);
    }
    if (printPages) {
        printPages.addEventListener("input", calculateTotal);
    }

    // --- SEND ORDER BUTTON LOGIC ---
    if (sendOrderBtn) {
        sendOrderBtn.addEventListener("click", function() {
            if (!selectedPackageName && !isPrintingSelected) {
                alert("Sila pilih sekurang-kurangnya Pakej Servis Laptop ATAU Servis Printing!");
                return;
            }

            const selectedDelivery = document.querySelector('input[name="deliveryOption"]:checked');
            let deliveryText = "Walk-in / Drop-off (RM0.00)";
            if (selectedDelivery) {
                if (selectedDelivery.value === "pickup") {
                    deliveryText = "Pickup & Delivery Dalam UiTM (+RM2.00)";
                } else if (selectedDelivery.value === "pickup_luar") {
                    deliveryText = "Pickup & Delivery Luar UiTM / Melaka (+RM10.00 - RM25.00 mengikut lokasi)";
                }
            }

            const brandValue = (laptopBrand && laptopBrand.value.trim()) ? laptopBrand.value.trim() : "Tidak dinyatakan";
            const locationValue = (userLocation && userLocation.value.trim()) ? userLocation.value.trim() : "Tidak dinyatakan";

            let printingDetail = "Tiada";
            if (isPrintingSelected && printType) {
                const selectedOptionText = printType.options[printType.selectedIndex].text;
                const pagesCount = printPages ? (printPages.value || 1) : 1;
                printingDetail = `${selectedOptionText} (${pagesCount} helai/muka surat)`;
            }

            const grandTotal = calculateTotal().toFixed(2);

            const message = `Salam Fix'it Prefix! Saya nak buat tempahan servis:\n\n` +
                            `* Pakej Laptop: ${selectedPackageName ? selectedPackageName + ' (RM' + selectedPackagePrice + ')' : 'Tiada (Servis Printing Sahaja)'}\n` +
                            `* Layanan Printing: ${printingDetail}\n` +
                            `* Kaedah Penyerahan: ${deliveryText}\n` +
                            `* Laptop/Model: ${brandValue}\n` +
                            `* Lokasi Pelanggan: ${locationValue}\n\n` +
                            `* Anggaran Jumlah: RM${grandTotal}\n\n` +
                            `Boleh saya dapatkan slot tempahan? Terima kasih!`;

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
        });
    }

    // --- FAQ ACCORDION TOGGLE LOGIC ---
    faqQuestions.forEach(function(question) {
        question.addEventListener("click", function() {
            const item = question.parentElement;
            
            document.querySelectorAll(".faq-item").forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                }
            });

            item.classList.toggle("active");
        });
    });

});