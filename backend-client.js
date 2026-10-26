(() => {
  const form = document.getElementById('demoForm');
  if (!form) return;
  const formDescription = document.querySelector('.modal-panel > p');
  if (formDescription) formDescription.textContent = 'Your details will be sent to the AI Sasa server so the team can follow up. This form needs an active server connection.';
  const formHint = form.querySelector('.formhint');
  if (formHint) formHint.textContent = 'Your enquiry is stored for the AI Sasa team.';
  const honeypot = document.createElement('div');
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  honeypot.innerHTML = '<label for="contactWebsite">Leave this field blank</label><input id="contactWebsite" name="website" type="text" tabindex="-1" autocomplete="off">';
  form.append(honeypot);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('[type="submit"]');
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    const payload = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send your request.');
      const success = document.getElementById('formSuccess');
      success.textContent = 'Thanks — your request has been received. We’ll be in touch.';
      success.style.background = '';
      success.style.color = '';
      success.classList.add('show');
      form.reset();
    } catch (error) {
      const success = document.getElementById('formSuccess');
      success.textContent = error.message === 'Failed to fetch'
        ? 'The server could not be reached. Please try again when connected to the AI Sasa server.'
        : error.message;
      success.classList.add('show');
      success.style.background = '#f8e6df';
      success.style.color = '#743c2f';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }, true);
})();
