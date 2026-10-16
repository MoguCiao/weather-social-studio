'use strict';

// Keep the native selects as the source of truth for the existing filters.
// Only the Topics filter row gets this visual enhancement.
(() => {
  let openSelect = null;
  const paths = {
    globe: 'M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
    clock: 'M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM12 7v5l3 2',
    weather: 'M7 16a4 4 0 1 1 1-7 5 5 0 0 1 9 2 3 3 0 1 1 0 6H7M8 20h.01M12 21h.01M16 20h.01',
    layers: 'm12 3 9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
    chevron: 'm7 10 5 5 5-5',
    check: 'm5 12 4 4L19 6'
  };
  const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const flags = {'United States':'🇺🇸', Canada:'🇨🇦', Japan:'🇯🇵', Norway:'🇳🇴', Switzerland:'🇨🇭'};
  const symbol = (type, value) => type === 'country' && flags[value]
    ? `<span class="filter-symbol filter-flag" aria-hidden="true">${flags[value]}</span>`
    : `<span class="filter-symbol" aria-hidden="true">${svg({country:'globe',time:'clock',weather:'weather',content:'layers'}[type])}</span>`;

  function close() {
    if (!openSelect) return;
    const control = openSelect;
    control.root.classList.remove('is-open', 'opens-up');
    control.trigger.setAttribute('aria-expanded', 'false');
    control.trigger.removeAttribute('aria-activedescendant');
    control.panel.hidden = true;
    openSelect = null;
  }

  function enhance() {
    close();
    document.querySelectorAll('.filters select:not([data-enhanced])').forEach(native => {
      const label = document.querySelector(`label[for="${native.id}"]`);
      const name = label?.textContent.trim() || native.getAttribute('aria-label') || 'Filter';
      const type = native.dataset.filter;
      const root = document.createElement('div');
      root.className = 'atmos-select';
      native.before(root);
      root.append(native);
      native.hidden = true;
      native.tabIndex = -1;
      native.dataset.enhanced = 'true';
      native.setAttribute('aria-hidden', 'true');

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.id = `${native.id}-trigger`;
      trigger.className = 'filter-select-trigger';
      trigger.setAttribute('role', 'combobox');
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', name);
      trigger.setAttribute('aria-controls', `${native.id}-options`);
      root.append(trigger);

      const panel = document.createElement('div');
      panel.id = `${native.id}-options`;
      panel.className = 'filter-select-panel';
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', `${name} options`);
      panel.hidden = true;
      root.append(panel);

      const choices = Array.from(native.options);
      const items = choices.map((option, index) => {
        const item = document.createElement('div');
        item.id = `${native.id}-option-${index}`;
        item.className = 'filter-select-option';
        item.setAttribute('role', 'option');
        item.dataset.index = index;
        item.innerHTML = `${symbol(type, option.value)}<span class="filter-option-label"></span><span class="filter-option-check">${svg('check')}</span>`;
        item.querySelector('.filter-option-label').textContent = option.textContent;
        panel.append(item);
        return item;
      });
      const control = {root, trigger, panel};
      let activeIndex = native.selectedIndex;
      let search = '';
      let lastTypedAt = 0;

      function sync() {
        trigger.innerHTML = `${symbol(type, native.value)}<span class="filter-select-value"></span><span class="filter-select-chevron">${svg('chevron')}</span>`;
        trigger.querySelector('.filter-select-value').textContent = choices[native.selectedIndex].textContent;
        items.forEach((item, index) => item.setAttribute('aria-selected', String(index === native.selectedIndex)));
      }
      function highlight(index) {
        activeIndex = (index + items.length) % items.length;
        items.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex));
        trigger.setAttribute('aria-activedescendant', items[activeIndex].id);
        items[activeIndex].scrollIntoView({block:'nearest'});
      }
      function open(index = native.selectedIndex) {
        close();
        openSelect = control;
        panel.hidden = false;
        root.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        const bounds = root.getBoundingClientRect();
        if (panel.offsetHeight > innerHeight - bounds.bottom - 12 && bounds.top > innerHeight - bounds.bottom) {
          root.classList.add('opens-up');
        }
        highlight(index);
      }
      function choose(index) {
        const changed = native.selectedIndex !== index;
        native.selectedIndex = index;
        sync();
        close();
        trigger.focus({preventScroll:true});
        if (changed) native.dispatchEvent(new Event('change', {bubbles:true}));
      }

      native.addEventListener('change', sync);
      label?.addEventListener('click', event => {
        event.preventDefault();
        trigger.focus();
      });
      root.addEventListener('pointerdown', event => {
        if (event.target.closest('.filter-select-option')) event.preventDefault();
      });
      root.addEventListener('click', event => {
        if (event.target.closest('.filter-select-trigger')) {
          event.preventDefault();
          event.stopPropagation();
          openSelect === control ? close() : open();
        } else {
          const option = event.target.closest('.filter-select-option');
          if (!option) return;
          event.preventDefault();
          event.stopPropagation();
          choose(Number(option.dataset.index));
        }
      });
      root.addEventListener('pointerover', event => {
        const option = event.target.closest('.filter-select-option');
        if (option && openSelect === control) highlight(Number(option.dataset.index));
      });
      trigger.addEventListener('keydown', event => {
        const isOpen = openSelect === control;
        if (['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === 'Enter' || event.key === ' ') {
            isOpen ? choose(activeIndex) : open();
          } else if (event.key === 'Home' || event.key === 'End') {
            const index = event.key === 'Home' ? 0 : items.length - 1;
            isOpen ? highlight(index) : open(index);
          } else if (!isOpen) {
            open();
          } else {
            highlight(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
          }
        } else if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          event.stopPropagation();
          close();
        } else if (event.key === 'Tab') {
          close();
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          event.stopPropagation();
          const now = Date.now();
          search = now - lastTypedAt > 700 ? event.key.toLowerCase() : search + event.key.toLowerCase();
          lastTypedAt = now;
          const repeated = [...search].every(letter => letter === search[0]);
          const prefix = repeated ? search[0] : search;
          const start = repeated ? activeIndex + 1 : 0;
          const index = choices.map((_, i) => (start + i) % choices.length)
            .find(i => choices[i].textContent.toLowerCase().startsWith(prefix));
          if (index !== undefined) isOpen ? highlight(index) : open(index);
        }
      });
      sync();
    });
  }

  document.addEventListener('pointerdown', event => {
    if (openSelect && !openSelect.root.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (openSelect && !openSelect.root.contains(event.target)) close();
  });
  window.addEventListener('resize', close);
  window.AtmosFilters = {enhance};
})();
