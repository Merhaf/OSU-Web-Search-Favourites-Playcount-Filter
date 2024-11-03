// ==UserScript==
// @name         OSU! Web Search: Favourites Playcount Filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description 오스 검색에서 즐찾 플카 횟수에 따라 필터함
// @author Merhaf
// @match        https://osu.ppy.sh/beatmapsets*
// @match        https://osu.ppy.sh/*
// @grant        none
// ==/UserScript==

(function() {
    window.onload = () => {
        const filterDiv = document.createElement('div');
        filterDiv.className = 'beatmapsets-search-filter beatmapsets-search-filter--grid';
        filterDiv.innerHTML = `
            <span class="beatmapsets-search-filter__header">최소 즐겨찾기 수</span>
            <input type="text" id="minFavouritecount" placeholder="0" style="color: rgb(166, 200, 217); background-color: rgb(69, 79, 84); width: 50px; border: 1px solid rgb(46, 53, 56); box-sizing: border-box;" />
            <span class="beatmapsets-search-filter__header">최소 플레이 수</span>
            <input type="text" id="minPlaycount" placeholder="0" style="color: rgb(166, 200, 217); background-color: rgb(69, 79, 84); width: 50px; border: 1px solid rgb(46, 53, 56); box-sizing: border-box;" />
        `;
        const getMinCounts = () => [
            parseInt(document.getElementById('minFavouritecount').value) || 0,
            parseInt(document.getElementById('minPlaycount').value) || 0
        ];
        let isUpdating = false;
        const updateFilters = () => {
            if (isUpdating) return;
            isUpdating = true;
            const [minFavouritecount, minPlaycount] = getMinCounts();
            const selectors = [
                { selector: '.beatmapset-panel__stats-item--favourite-count', minCount: minFavouritecount, panelSelector: '.beatmapset-panel' },
                { selector: '.beatmapset-panel__stats-item--play-count', minCount: minPlaycount, panelSelector: '.beatmapsets__item' }
            ];
            selectors.forEach(({ selector, minCount, panelSelector }) => {
                document.querySelectorAll(selector).forEach(el => {
                    const title = el.getAttribute('title');
                    const dataOrigTitle = el.getAttribute('data-orig-title');
                    let count = 0;
                    if (title) {
                        const match = title.match(/(\d[\d,]*)/);
                        count = match ? parseInt(match[0].replace(/,/g, '')) : 0;
                    } else if (dataOrigTitle) {
                        const match = dataOrigTitle.match(/(\d[\d,]*)/);
                        count = match ? parseInt(match[0].replace(/,/g, '')) : 0;
                    }
                    const panel = el.closest(panelSelector);
                    if (count < minCount) {
                        panel.remove(); // 요소를 DOM에서 완전히 제거
                    }
                });
            });
            isUpdating = false;
        };
        const appendFilterDiv = () => {
            const filterGrid = document.querySelector('.beatmapsets-search__filter-grid');
            if (filterGrid && !document.getElementById('minFavouritecount')) {
                filterGrid.appendChild(filterDiv);
                filterDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateFilters));
            }
        };
        appendFilterDiv();
        const intervalId = setInterval(updateFilters, 5);
        window.addEventListener('beforeunload', () => clearInterval(intervalId));
        updateFilters();
    };
})();
