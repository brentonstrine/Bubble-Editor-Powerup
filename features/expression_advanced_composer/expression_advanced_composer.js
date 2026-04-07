window.loadedCodelessLoveScripts ||= {};
(function () {
  console.log("💙❤️ Advanced Expression Composer");
  let thisScriptKey = "advanced_expression_composer";

  /* ------------------------------------------------ */
  /* ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ Don't mess with this  ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ */
  /* ------------------------------------------------ */
  if (window.loadedCodelessLoveScripts[thisScriptKey] == "loaded") {
    console.warn("💙❤️" + thisScriptKey + " tried to load, but it's value is already " + window.loadedCodelessLoveScripts[thisScriptKey]);
    return;
  }
  window.loadedCodelessLoveScripts[thisScriptKey] = "loaded";
  console.log("💙❤️" + window.loadedCodelessLoveScripts[thisScriptKey]);
  /* ------------------------------------------------ */
  /* ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ Don't mess with this  ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ */
  /* ------------------------------------------------ */

  const ADVANCED_COMPOSER_SVG = `<span class="py18712 py1871m"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="py1871q"><path d="M24.7075 24.7075C24.6146 24.8005 24.5043 24.8742 24.3829 24.9246C24.2615 24.9749 24.1314 25.0008 24 25.0008C23.8686 25.0008 23.7385 24.9749 23.6171 24.9246C23.4957 24.8742 23.3854 24.8005 23.2925 24.7075L9 10.4137V21C9 21.2652 8.89464 21.5196 8.70711 21.7071C8.51957 21.8946 8.26522 22 8 22C7.73478 22 7.48043 21.8946 7.29289 21.7071C7.10536 21.5196 7 21.2652 7 21V8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7H21C21.2652 7 21.5196 7.10536 21.7071 7.29289C21.8946 7.48043 22 7.73478 22 8C22 8.26522 21.8946 8.51957 21.7071 8.70711C21.5196 8.89464 21.2652 9 21 9H10.4137L24.7075 23.2925C24.8005 23.3854 24.8742 23.4957 24.9246 23.6171C24.9749 23.7385 25.0008 23.8686 25.0008 24C25.0008 24.1314 24.9749 24.2615 24.9246 24.3829C24.8742 24.5043 24.8005 24.6146 24.7075 24.7075Z" fill="currentColor"></path></svg></span>`;

  function injectTrigger(target) {
    const row = target.closest('.property-editor-row');
    if (!row) return;

    // Check if we've already injected in this row
    if (row.hasAttribute('data-cl-attached')) return;

    console.log("💙❤️ Attempting to inject Advanced Composer button into row:", row);
    
    // Force the row to column so our button sits below the input
    row.style.setProperty('flex-direction', 'column', 'important');
    row.style.setProperty('align-items', 'flex-start', 'important');
    
    const wrapper = document.createElement('div');
    wrapper.className = '❤️advanced-composer';
    wrapper.setAttribute('data-cl-injected', 'true');
    wrapper.style.cssText = 'width: 100%; display: flex; justify-content: flex-start; margin-top: 5px;';
    
    const btn = document.createElement('div');
    btn.className = 'expand-collapse-button';
    btn.innerHTML = `Advanced Composer ${ADVANCED_COMPOSER_SVG}`;
    
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("💙❤️ Advanced Composer Triggered!");
    };

    wrapper.appendChild(btn);
    row.appendChild(wrapper);
    row.setAttribute('data-cl-attached', 'true');
    
    console.log("💙❤️ Injection complete!");

    // Double check after a short delay if it's still there
    setTimeout(() => {
      if (!wrapper.parentElement) {
        console.warn("💙❤️ Injection disappeared! Bubble might have stripped it.");
        row.removeAttribute('data-cl-attached');
      }
    }, 500);
  }

  function initObserver() {
    console.log("💙❤️ Initializing Advanced Composer Observer...");
    const wrapper = document.querySelector('.property-editor-wrapper');
    if (!wrapper) {
      console.log("💙❤️ .property-editor-wrapper not found yet. Watching body...");
      const bodyObserver = new MutationObserver(() => {
        const potentialWrapper = document.querySelector('.property-editor-wrapper');
        if (potentialWrapper) {
          console.log("💙❤️ .property-editor-wrapper discovered!");
          startMainObserver(potentialWrapper);
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      console.log("💙❤️ .property-editor-wrapper found immediately.");
      startMainObserver(wrapper);
    }
  }

  let debounceTimer;
  function startMainObserver(container) {
    console.log("💙❤️ Starting main observer on:", container);
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const targets = [
          ...document.querySelectorAll('.text-composer'),
          ...document.querySelectorAll('.expression-composer > .expression-composer')
        ];

        if (targets.length > 0) {
          targets.forEach(injectTrigger);
        }
      }, 100);
    });

    observer.observe(container, { childList: true, subtree: true });
    
    // Initial run
    const initialTargets = [
      ...document.querySelectorAll('.text-composer'),
      ...document.querySelectorAll('.expression-composer > .expression-composer')
    ];
    if (initialTargets.length > 0) {
      initialTargets.forEach(injectTrigger);
    }
  }

  initObserver();

})();//👈👈 don't delete this, and don't put anything outside of this!!
