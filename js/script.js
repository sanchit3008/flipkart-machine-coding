const obj = (function () {
    let apiData = [];
    let widgets = [];

    const displayDiv = document.getElementById('displayDiv');
    const pincodeInput = document.getElementById('pincodeInput');

    async function processApiData() {
        await getApiData();
        displayDiv.innerHTML = '';
        for (let slot of apiData) {
            if (slot.slotType === 'WIDGET') {
                displayDiv.innerHTML += getWidgetHTML(slot);
            }
            else {
                displayDiv.innerHTML += getContainerHTML(slot);
            }
        }
    }

    async function getApiData() {
        await fetch('https://flipkart-page-api.vercel.app/')
            .then(response => response.json())
            .then(response => apiData = response);
    }

    function getContainerHTML(slot) {
        let divOpen = `<div style="width:${slot.grow};" class=containerDiv>`;
        let innerText = '';
        for (let child of slot.children) {
            if (child.slotType === 'WIDGET') {
                innerText += getWidgetHTML(child);
            }
            else {
                innerText += getContainerHTML(child);
            }
        }
        let divClose = `</div>`;
        let finaltext = divOpen + innerText + divClose;
        return finaltext;
    }

    function getWidgetHTML(slot) {
        widgets.push(slot);
        let divOpen = `<div class=widgetDiv style="width:${slot.grow}">`;
        let imgText = '';
        let width = 100 / slot.assets.length;
        let selectedIds = JSON.parse(localStorage.getItem("id")) || [];
        for (let asset of slot.assets) {
            let classText = '';
            if (selectedIds.includes(asset.id)) classText = "class='selectedImg'";
            imgText += `<img ${classText} src="${asset.imageUrl}" id="${asset.id}" style="width:${width}%; height:100%">`;
        }
        let divClose = `</div>`;
        let finaltext = divOpen + imgText + divClose;
        return finaltext;
    }

    function onImgClick(e) {
        if (e.target.tagName === "IMG") {
            let selectedIds = JSON.parse(localStorage.getItem("id"));
            if (selectedIds) {
                if (selectedIds.includes(e.target.id)) {
                    selectedIds = selectedIds.filter(x => x != e.target.id);
                    e.target.classList.remove('selectedImg');
                }
                else {
                    selectedIds.push(e.target.id);
                    e.target.classList.add('selectedImg');
                }
            }
            else {
                selectedIds = [e.target.id];
                e.target.classList.add('selectedImg');
            }
            localStorage.setItem("id", JSON.stringify(selectedIds));
        }
    }

    function debounce(fn, lim) {
        let timeOut;
        return function (e) {
            if (timeOut) clearTimeout(timeOut);
            timeOut = setTimeout(fn.bind(null, e), lim);
        }
    }

    const debouncedFilterPincode = debounce(filterPincode, 400);
    
    displayDiv.addEventListener('click', onImgClick);
    pincodeInput.addEventListener('input', debouncedFilterPincode);

    function filterPincode(e) {
        const pincode = e.target.value;

        function displayWidget(widget) {
            for (asset of widget.assets) {
                const img = document.getElementById(asset.id);
                img.style.display = 'initial';
            }
        }

        function hideWidget(widget) {
            for (asset of widget.assets) {
                const img = document.getElementById(asset.id);
                img.style.display = 'none';
            }
        }

        if (!pincode || pincode.length === 0) {
            widgets.forEach(x => displayWidget(x));
        }

        if (pincode.length === 6) {
            for (let widget of widgets) {
                if (widget.serviceablePincodes && !widget.serviceablePincodes.includes(pincode)) {
                    hideWidget(widget);
                }
                else {
                    displayWidget(widget);
                }
            }
        }
    }

    return processApiData;

})();

obj();