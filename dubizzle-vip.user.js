// ==UserScript==
// @name         Dubizzle – Smart Info Box
// @namespace    https://github.com/Khaledonline
// @version      1.0.1
// @description  Injects smart info boxes on Dubizzle listings (SPA-safe)
// @author       Khaled
// @match        https://www.dubizzle.com.eg/*
// @updateURL    https://raw.githubusercontent.com/Khaledonline/pricelist/refs/heads/main/dubizzle-vip.user.js
// @downloadURL  https://raw.githubusercontent.com/Khaledonline/pricelist/refs/heads/main/dubizzle-vip.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function toWesternNumbers(s = "") {
        return String(s)
            .replace(/[٠-٩]/g, d => String.fromCharCode(48 + "٠١٢٣٤٥٦٧٨٩".indexOf(d)))
            .replace(/٫/g, '.')
            .replace(/،/g, ',');
    }

    function buildExtraMap() {
        const rows = document.querySelectorAll('#extra-fields table tr');
        const map = {};
        rows.forEach(row => {
            const th = row.querySelector('th');
            const td = row.querySelector('td');
            if (!th || !td) return;
            const key = th.textContent.trim();
            const keyNorm = key.toLowerCase();
            const valEl = td.querySelector('.extra-field-value');
            let val = valEl ? valEl.innerText.trim() : td.innerText.trim();
            val = toWesternNumbers(val).replace(/\s+/g, ' ').trim();
            map[key] = val;
            map[keyNorm] = val;
        });
        return map;
    }

    function findRowValueByThText(thText) {
        const rows = Array.from(document.querySelectorAll('table.object-attributes tr'));
        const row = rows.find(r => {
            const th = r.querySelector('th');
            return th && th.textContent.trim().toLowerCase() === thText.toLowerCase();
        });
        if (!row) return null;
        const td = row.querySelector('td');
        return td ? td.innerText.trim() : null;
    }

    function findValueWithAliases(map, aliases = []) {
        for (const a of aliases) {
            const v1 = map[a];
            const v2 = map[a.toLowerCase()];
            if (v1) return v1;
            if (v2) return v2;
        }
        const keys = Object.keys(map);
        for (const a of aliases) {
            const frag = a.toLowerCase();
            const found = keys.find(k => k.toLowerCase().includes(frag));
            if (found) return map[found];
        }
        return null;
    }

    function getPrice(extra) {
        const priceType = extra && (extra["Price type"] || extra["price type"]);
        if (priceType) {
            const typeLower = priceType.toLowerCase();
            if (typeLower === "free") {
                return `<span style="color:red;font-weight:bold;">FREE</span>`;
            } else if (typeLower === "exchange") {
                return `<span style="color:green;font-weight:bold;">Exchange</span>`;
            }
        }

        const priceRows = document.querySelectorAll('#price_rows tr');
        if (priceRows && priceRows.length) {
            for (const tr of priceRows) {
                const th = tr.querySelector('th');
                const td = tr.querySelector('td');
                if (!th || !td) continue;
                const thText = th.textContent.trim().toLowerCase();
                if (thText.includes('price')) {
                    const valEl = td.querySelector('.extra-field-value');
                    let raw = valEl ? valEl.innerText : td.innerText;
                    raw = toWesternNumbers(raw);
                    const match = raw.match(/[\d\.,]+/);
                    if (match) return match[0];
                    return raw.trim();
                }
            }
        }
        return 'N/A';
    }

    function buildPropertyValues() {
        const extra = buildExtraMap();
        const categoryText = (findRowValueByThText('Category') || '').toLowerCase();

        let area = findValueWithAliases(extra, ['Area', 'Ft', 'متر', 'مساحة']);
        area = area || 'N/A';

        let purpose = findValueWithAliases(extra, ['Purpose']);
        if (!purpose) {
            if (/sale/.test(categoryText)) purpose = 'Sale';
            else if (/rent/.test(categoryText)) purpose = 'Rent';
            else purpose = 'N/A';
        }

        let monthly = findValueWithAliases(extra, ['Monthly installment amount', 'Monthly', 'قسط']) || 'N/A';
        let installments = findValueWithAliases(extra, ['Installments payment duration years', 'Payment period']) || 'N/A';

        let rental = "N/A";
        if (purpose.toLowerCase() === "rent") {
            rental = findValueWithAliases(extra, ['Rental period']) || "N/A";
        }

        let completion = findValueWithAliases(extra, ['Completion status']) || 'N/A';
        let paymentOption = findValueWithAliases(extra, ['Payment option', 'Payment']) || 'N/A';

        const price = getPrice(extra);

        return {
            Price: price,
            Area: area,
            Purpose: purpose,
            Monthly: monthly,
            Installments: installments,
            Rental: rental,
            Completion: completion,
            PaymentOption: paymentOption
        };
    }

    function insertStyledPropertyBox(values) {
        const basicInfoTitle = Array.from(document.querySelectorAll("h3"))
            .find(h => h.textContent.trim().toLowerCase().includes("basic information"));
        if (!basicInfoTitle) return;
        if (basicInfoTitle.nextElementSibling?.innerHTML?.includes("Price:")) return;

        const outerWrapper = document.createElement("div");
        outerWrapper.style.cssText = "width:100%;display:flex;justify-content:center;margin-top:10px;";

        const infoBox = document.createElement("div");
        infoBox.style.cssText =
            "padding:10px 15px;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;font-size:13px;color:#222;" +
            "overflow-x:auto;max-width:95%;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin:0 auto;";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";

        let completionVal = values.Completion || 'N/A';
        let completionStyle = "";
        if (/ready|completed/i.test(completionVal)) {
            completionStyle = "color:green;font-weight:bold;";
        } else if (/under.?construction/i.test(completionVal)) {
            completionStyle = "color:red;font-weight:bold;";
        } else if (/in.?progress|off.?plan/i.test(completionVal)) {
            completionStyle = "color:orange;font-weight:bold;";
        }

        const cells = [
            `<td><strong>Price:</strong> ${values.Price}</td>`,
            `<td><strong>Area:</strong> ${values.Area}</td>`,
            `<td><strong>Purpose:</strong> ${values.Purpose}</td>`,
            `<td><strong>Monthly:</strong> ${values.Monthly}</td>`,
            `<td><strong>Installments:</strong> ${values.Installments}</td>`,
            `<td><strong>Completion:</strong> <span style="${completionStyle}">${completionVal}</span></td>`,
            `<td><strong>Payment option:</strong> ${values.PaymentOption}</td>`
        ];

        if (values.Purpose.toLowerCase() === "rent" && values.Rental) {
            let rentalCell = `<td><strong>Rental period:</strong> ${values.Rental}</td>`;
            if (values.Rental.toLowerCase() === "daily") {
                rentalCell = `<td><strong>Rental period:</strong> <span style="color:#d9534f;font-weight:bold;">${values.Rental}</span></td>`;
            }
            cells.push(rentalCell);
        }

        table.innerHTML = `<tr>${cells.join('')}</tr>`;
        infoBox.appendChild(table);
        outerWrapper.appendChild(infoBox);
        basicInfoTitle.insertAdjacentElement("afterend", outerWrapper);
    }

    function displayCarInfo() {
        const extra = buildExtraMap();
        const data = {
            Make: findValueWithAliases(extra, ['Make']),
            Model: findValueWithAliases(extra, ['Model']),
            Year: findValueWithAliases(extra, ['Year']),
            Color: findValueWithAliases(extra, ['Color']),
            Used: findValueWithAliases(extra, ['New used', 'Used']),
            Body: findValueWithAliases(extra, ['Body type']),
            Mileage: findValueWithAliases(extra, ['Mileage']),
        };

        const colorMap = {
            red: '#d00', blue: '#007bff', 'navy blue': '#001f3f', 'blue-navy blue': '#001f3f',
            green: '#28a745', black: '#000', white: '#aaa', gray: '#888', grey: '#888',
            silver: '#bbb', yellow: '#ffcc00', orange: '#fd7e14', brown: '#8b4513',
            gold: '#daa520', beige: '#f5f5dc', pink: '#ff69b4', purple: '#6f42c1'
        };

        const colorName = (data.Color || '').toLowerCase().trim();
        const colorHex = colorMap[colorName] || '#333';

        let usedStyle = "";
        let mileageStyle = "";
        const mileageNum = parseInt((data.Mileage || '').replace(/[^0-9]/g, ''), 10) || 0;
        if (data.Used === "New" && mileageNum > 0) usedStyle = "color:red;font-weight:bold;";
        if (data.Used === "Used" && mileageNum === 0) mileageStyle = "color:red;font-weight:bold;";

        let modelStyle = "";
        let modelBg = "";
        if ((data.Model || "").toLowerCase().includes("other")) {
            modelStyle = "color:red;font-weight:bold;";
            modelBg = "background-color:#f0f0f0;";
        }

        let yearStyle = "";
        const yearNum = parseInt((data.Year || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(yearNum) && yearNum < 1970) {
            yearStyle = "color:red;font-weight:bold;font-size:16px;";
        }

        const infoBox = document.createElement('div');
        infoBox.style.cssText =
            "margin-top:8px;padding:10px 15px;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;" +
            "display:flex;flex-wrap:wrap;gap:10px;font-size:13px;color:#222;box-shadow:0 2px 6px rgba(0,0,0,0.08);";

        const itemStyle =
            "background-color:#fff;padding:6px 10px;border-radius:8px;border:1px solid #eee;" +
            "box-shadow:1px 1px 3px rgba(0,0,0,0.05);white-space:nowrap;";

        infoBox.innerHTML = `
            <span style="${itemStyle}"><strong>Make:</strong> ${data.Make || 'N/A'}</span>
            <span style="${itemStyle + modelBg}"><strong>Mdl:</strong> <span style="${modelStyle}">${data.Model || 'N/A'}</span></span>
            <span style="${itemStyle}"><strong>Year:</strong> <span style="${yearStyle}">${data.Year || 'N/A'}</span></span>
            <span style="${itemStyle}"><strong>Clr:</strong> <strong style="color:${colorHex}">${data.Color || 'N/A'}</strong></span>
            <span style="${itemStyle + (usedStyle ? ' background-color:#ffe6e6;' : '')}">
                <strong>Used:</strong> <span style="${usedStyle}">${data.Used || 'N/A'}</span>
            </span>
            <span style="${itemStyle}"><strong>Body:</strong> ${data.Body || 'N/A'}</span>
            <span style="${itemStyle + (mileageStyle ? ' background-color:#ffe6e6;' : '')}">
                <strong>Mile:</strong> <span style="${mileageStyle}">${data.Mileage || 'N/A'}</span>
            </span>
        `;

        const basicInfoHeader = Array.from(document.querySelectorAll('h3'))
            .find(h => h.textContent.trim().toLowerCase().includes('basic information'));
        if (basicInfoHeader) {
            basicInfoHeader.parentNode.insertBefore(infoBox, basicInfoHeader.nextSibling);
        }
    }

    function displayMobileInfo() {
        const extra = buildExtraMap();
        const data = {
            Price: getPrice(extra),
            Make: findValueWithAliases(extra, ['Make']),
            Model: findValueWithAliases(extra, ['Model']),
            Storage: findValueWithAliases(extra, ['Storage']),
            Ram: findValueWithAliases(extra, ['Ram']),
            "New used": findValueWithAliases(extra, ['New used']),
            Battery: findValueWithAliases(extra, ['Battery capacity']),
        };
        insertGenericBox(data, "Make:");
    }

    function displayLaptopInfo() {
        const extra = buildExtraMap();
        const data = {
            Price: getPrice(extra),
            Make: findValueWithAliases(extra, ['Make']),
            Ram: findValueWithAliases(extra, ['Ram']),
            "New used": findValueWithAliases(extra, ['New used']),
            "Hard disk capacity": findValueWithAliases(extra, ['Hard disk capacity'])
        };
        insertGenericBox(data, "Make:");
    }

    function insertGenericBox(data, checkKey) {
        const basicInfoTitle = Array.from(document.querySelectorAll("h3"))
            .find(h => h.textContent.trim().toLowerCase().includes("basic information"));
        if (!basicInfoTitle) return;
        if (basicInfoTitle.nextElementSibling?.innerHTML?.includes(checkKey)) return;

        const outerWrapper = document.createElement("div");
        outerWrapper.style.cssText = "width:100%;display:flex;justify-content:center;margin-top:10px;";

        const infoBox = document.createElement("div");
        infoBox.style.cssText =
            "padding:10px 15px;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;font-size:13px;color:#222;" +
            "overflow-x:auto;max-width:95%;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin:0 auto;";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";

        const cells = Object.entries(data).map(
            ([k, v]) => `<td style="padding:6px 12px;"><strong>${k}:</strong> ${v || 'N/A'}</td>`
        );

        table.innerHTML = `<tr>${cells.join('')}</tr>`;
        infoBox.appendChild(table);
        outerWrapper.appendChild(infoBox);
        basicInfoTitle.insertAdjacentElement("afterend", outerWrapper);
    }

    function displayPriceOnly() {
        const extra = buildExtraMap();
        const price = getPrice(extra);

        const basicInfoTitle = Array.from(document.querySelectorAll("h3"))
            .find(h => h.textContent.trim().toLowerCase().includes("basic information"));
        if (!basicInfoTitle) return;
        if (basicInfoTitle.nextElementSibling?.innerHTML?.includes("Price:")) return;

        const outerWrapper = document.createElement("div");
        outerWrapper.style.cssText = "width:100%;display:flex;justify-content:center;margin-top:10px;";

        const infoBox = document.createElement("div");
        infoBox.style.cssText =
            "padding:10px 15px;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;font-size:13px;color:#222;" +
            "overflow-x:auto;max-width:95%;box-shadow:0 2px 6px rgba(0,0,0,0.05);margin:0 auto;";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.innerHTML = `<tr><td style="padding:6px 12px;"><strong>Price:</strong> ${price}</td></tr>`;

        infoBox.appendChild(table);
        outerWrapper.appendChild(infoBox);
        basicInfoTitle.insertAdjacentElement("afterend", outerWrapper);
    }

    window.addEventListener("load", () => {
        setTimeout(() => {
            const cat = (findRowValueByThText('Category') || '').toLowerCase();

            if (cat.includes("cars for sale")) {
                displayCarInfo();
            } else if (/commercial|properties|residential/.test(cat)) {
                insertStyledPropertyBox(buildPropertyValues());
            } else if (cat.includes("mobile phones")) {
                displayMobileInfo();
            } else if (
                cat.includes("laptop computers") ||
                (cat.includes("electronics & home appliances") && cat.includes("computers - accessories"))
            ) {
                displayLaptopInfo();
            } else {
                displayPriceOnly();
            }
        }, 10);
    });

})();
