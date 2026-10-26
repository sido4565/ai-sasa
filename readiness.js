(() => {
  const style = document.createElement('style');
  style.textContent = `
    .readiness{background:#fff;border:1px solid var(--line);border-radius:9px;padding:25px;box-shadow:0 10px 32px #24261b08}
    .readiness-form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .readiness-question{border:1px solid #e8e7e2;border-radius:6px;padding:14px;margin:0}
    .readiness-question legend{font-size:11px;font-weight:800;padding:0 4px}
    .readiness-question select{width:100%;padding:9px 10px;border:1px solid #ddded8;border-radius:4px;background:white;color:var(--ink);font:inherit;font-size:11px}
    .readiness-actions{display:flex;align-items:center;gap:12px;grid-column:1/-1}
    .readiness-result{display:none;margin-top:18px;padding:17px;border-radius:6px;background:#edf2e7;border-left:4px solid var(--green)}
    .readiness-result.show{display:block}.readiness-result h3{font-size:16px;margin:0 0 5px}
    .readiness-result p{font-size:11px;color:#525b52;margin:0 0 12px}.readiness-result .button{font-size:9px}
    .readiness-note{font-size:9px;color:#777d76}
    @media(max-width:580px){.readiness{padding:17px}.readiness-form{grid-template-columns:1fr}.readiness-actions{grid-column:auto;align-items:flex-start;flex-direction:column}}
  `;
  document.head.append(style);

  const section = document.createElement('section');
  section.className = 'wrap section';
  section.id = 'readiness';
  section.innerHTML = `
    <div class="section-head"><span class="eyebrow">Quick self-check</span>
      <h2 class="heading">How ready is your team to use AI at work?</h2>
      <p class="subheading">Answer five practical questions to get a suggested next step. This is a starting point for discussion, not a formal assessment.</p>
    </div>
    <div class="readiness"><form class="readiness-form" id="readinessForm">
      <fieldset class="readiness-question"><legend>1. Have you picked a specific task to improve?</legend><select name="workflow" required><option value="">Choose one</option><option value="0">Not yet</option><option value="1">We have a few ideas</option><option value="2">Yes, with a clear owner</option></select></fieldset>
      <fieldset class="readiness-question"><legend>2. How often does that task happen?</legend><select name="frequency" required><option value="">Choose one</option><option value="0">Occasionally</option><option value="1">Weekly</option><option value="2">Daily or several times a week</option></select></fieldset>
      <fieldset class="readiness-question"><legend>3. Does your team know what information must stay private?</legend><select name="privacy" required><option value="">Choose one</option><option value="0">We have not discussed it</option><option value="1">Some guidance exists</option><option value="2">Clear rules are in place</option></select></fieldset>
      <fieldset class="readiness-question"><legend>4. Is there an approved AI tool or policy?</legend><select name="tools" required><option value="">Choose one</option><option value="0">No</option><option value="1">People are experimenting</option><option value="2">Yes, tools and use are guided</option></select></fieldset>
      <fieldset class="readiness-question"><legend>5. Can a person check the AI-assisted result?</legend><select name="review" required><option value="">Choose one</option><option value="0">Not defined</option><option value="1">Usually, but informally</option><option value="2">Yes, with a clear review step</option></select></fieldset>
      <div class="readiness-actions"><button class="button" type="submit">See your suggested next step ↗</button><span class="readiness-note">Your answers stay in this browser and are not stored or sent.</span></div>
    </form><div class="readiness-result" id="readinessResult" role="status" aria-live="polite" tabindex="-1"><h3 id="readinessTitle"></h3><p id="readinessText"></p><button class="button open-modal" id="readinessCta" type="button">Discuss this with AI Sasa ↗</button></div></div>`;
  document.querySelector('#pilot').before(section);
  const nav = document.querySelector('#navLinks');
  const readinessLink = document.createElement('a');
  readinessLink.href = '#readiness';
  readinessLink.textContent = 'Readiness check';
  nav.insertBefore(readinessLink, nav.querySelector('.demo-link'));
  readinessLink.addEventListener('click', () => {
    nav.classList.remove('open');
    const menuButton = document.getElementById('menuButton');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = '☰';
  });

  const form = section.querySelector('#readinessForm');
  const result = section.querySelector('#readinessResult');
  const title = section.querySelector('#readinessTitle');
  const description = section.querySelector('#readinessText');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const answers = Object.fromEntries(new FormData(form));
    const score = Object.values(answers).reduce((sum, value) => sum + Number(value), 0);
    let recommendation;
    if (score <= 3 || Number(answers.privacy) === 0 || Number(answers.review) === 0) {
      recommendation = ['Start with safe foundations', 'Choose one low-risk task, agree what information can be used, and define who checks the result before introducing an AI workflow.'];
    } else if (score <= 7) {
      recommendation = ['Run a small, guided experiment', 'Your team has a starting point. Set a baseline for one frequent task, try it with an approved tool, and review quality and time saved with the team.'];
    } else {
      recommendation = ['Measure and improve a live workflow', 'You have several useful foundations in place. Track adoption, time and rework for one workflow, then decide whether to expand it.'];
    }
    title.textContent = recommendation[0];
    description.textContent = recommendation[1];
    result.classList.add('show');
    result.focus();
  });

  section.querySelector('#readinessCta').addEventListener('click', () => {
    const interest = document.getElementById('interest');
    if (interest) interest.value = 'SME pilot';
    document.querySelector('.open-modal')?.click();
  });
})();
