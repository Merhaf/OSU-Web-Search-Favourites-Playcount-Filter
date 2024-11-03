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
        const updateFilters = () => {
            const [minFavouritecount, minPlaycount] = getMinCounts();
            const selectors = [
                { selector: '.beatmapset-panel__stats-item--favourite-count', minCount: minFavouritecount, panelSelector: '.beatmapset-panel' },
                { selector: '.beatmapset-panel__stats-item--play-count', minCount: minPlaycount, panelSelector: '.beatmapsets__item' }
            ];
            selectors.forEach(({ selector, minCount, panelSelector }) => {
                document.querySelectorAll(selector).forEach(el => {
                    const count = parseInt(el.querySelector('span:nth-of-type(2)').textContent) || 0;
                    el.closest(panelSelector).style.opacity = (count < minCount) ? '0' : '1';
                });
            });
        };
        const appendFilterDiv = () => {
            const filterGrid = document.querySelector('.beatmapsets-search__filter-grid');
            if (filterGrid && !document.getElementById('minFavouritecount')) {
                filterGrid.appendChild(filterDiv);
                filterDiv.querySelectorAll('input').forEach(input => input.addEventListener('input', updateFilters));
            }
        };
        appendFilterDiv();
        const intervalId = setInterval(updateFilters, 10);
        const targetNode = document.querySelector('.beatmapsets__items');
        if (targetNode) {
            new MutationObserver(updateFilters).observe(targetNode, { childList: true, subtree: true });
        }
        new MutationObserver(updateFilters).observe(document.body, { attributes: true });
        new MutationObserver(appendFilterDiv).observe(document.head, { childList: true, subtree: true });
        window.addEventListener('beforeunload', () => clearInterval(intervalId));
        updateFilters();
    };
})();
