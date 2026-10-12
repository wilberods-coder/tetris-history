(() => {
  'use strict';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualPause = false;
  let reduceMotion = motionQuery.matches;
  const progress = document.getElementById('reading-progress');
  const header = document.getElementById('site-header');
  const hero = document.getElementById('hero');
  const art = document.getElementById('hero-art');
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    header.classList.toggle('scrolled', scrollY > 10);
    art.style.transform = !reduceMotion && scrollY < hero.offsetHeight ? `translateY(${scrollY * .12}px)` : '';
  }
  function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(queueScroll).observe(document.body);
  updateScroll();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .15 });
    revealItems.forEach(item => { item.classList.add('ready'); observer.observe(item); });
  }
  const counters = document.querySelectorAll('[data-count]');
  const runningCounters = new Map();
  function finishCounters() {
    runningCounters.forEach((frame, el) => { cancelAnimationFrame(frame); el.textContent = el.dataset.count; });
    runningCounters.clear();
  }
  function animateCounter(el) {
    if (reduceMotion) return;
    const target = Number(el.dataset.count);
    const start = performance.now();
    function tick(now) {
      const fraction = Math.min((now - start) / 1500, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - fraction, 3))));
      if (fraction < 1 && !reduceMotion) runningCounters.set(el, requestAnimationFrame(tick));
      else { el.textContent = String(target); runningCounters.delete(el); }
    }
    runningCounters.set(el, requestAnimationFrame(tick));
  }
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
    }), { threshold: .6 });
    counters.forEach(el => counterObserver.observe(el));
  }

  const events = {
    1984: ['МОСКВА · СССР', 'Первая фигура упала.', 'Алексей Пажитнов создаёт Tetris на «Электронике-60». Официальная дата рождения игры — 6 июня 1984 года.', 'birth'],
    1988: ['ИЗ МОСКВЫ · В МИР', 'Игра пересекает границы.', 'Западные компьютерные версии находят новую аудиторию. Хенк Роджерс знакомится с Tetris на выставке в Лас-Вегасе и выпускает игру в Японии.', 'expansion'],
    1989: ['NINTENDO · GAME BOY', 'Легенда становится портативной.', 'Роджерс получает права на портативную версию. Tetris и Game Boy складываются в один из самых узнаваемых дуэтов в истории игр.', 'gameboy'],
    1996: ['THE TETRIS COMPANY', 'Новая глава для создателей.', 'Пажитнов и Роджерс объединяют усилия. The Tetris Company становится центром лицензирования и дальнейшего развития бренда.', 'rights'],
    2009: ['TETRIS ONLINE · БРАУЗЕР', 'Встречаемся онлайн.', 'Tetris Online запускает Tetris Friends. Для следующей партии и встречи с другими игроками достаточно открыть браузер.', 'digital'],
    2010: ['CTWC · ПЕРВЫЙ ЧЕМПИОНАТ', 'У классики появляется арена.', 'Йонас Нойбауэр побеждает на первом Classic Tetris World Championship. Впереди — ещё шесть чемпионских титулов.', 'esports'],
    2018: ['TETRIS EFFECT · НОВОЕ ИЗМЕРЕНИЕ', 'Знакомая игра. Новые чувства.', '9 ноября Tetris Effect выходит на PlayStation 4 с поддержкой PS VR. Музыка и свет откликаются на действия игрока.', 'today']
  };
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    const year = tab.dataset.year;
    const [label, title, description, section] = events[year];
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    document.getElementById('timeline-year').textContent = year;
    document.getElementById('timeline-label').textContent = label;
    document.getElementById('timeline-event').textContent = title;
    document.getElementById('timeline-description').textContent = description;
    document.getElementById('timeline-link').href = `#${section}`;
    document.getElementById('timeline-panel').setAttribute('aria-labelledby', tab.id);
    if (focus) { tab.focus({ preventScroll: true }); tab.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest' }); }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });

  // Original, static compositions; these are illustrations, not a playable game.
  const palette = { C: '#00f0f0', Y: '#f0f000', P: '#a000f0', G: '#00f000', R: '#f00000', B: '#0000f0', O: '#f0a000' };
  const rows = ['........','....P...','...PPP..','........','........','......YY','......YY','..C.GG..','..CGG.O.','..CRR.O.','BBC.RROO','BBPPPOOO'];
  document.querySelectorAll('[data-board]').forEach(board => rows.join('').split('').forEach(symbol => {
    const cell = document.createElement('span');
    cell.className = 'board-cell';
    if (palette[symbol]) cell.style.setProperty('--cell', palette[symbol]);
    board.append(cell);
  }));
  const motionButton = document.getElementById('motion-toggle');
  motionButton.hidden = false;
  function updateMotion() {
    reduceMotion = motionQuery.matches || manualPause;
    document.body.classList.toggle('motion-paused', reduceMotion);
    document.documentElement.style.scrollBehavior = reduceMotion ? 'auto' : '';
    motionButton.setAttribute('aria-pressed', String(reduceMotion));
    motionButton.textContent = motionQuery.matches ? 'Анимация отключена в системе' : reduceMotion ? 'Включить анимацию' : 'Приостановить анимацию';
    motionButton.disabled = motionQuery.matches;
    if (reduceMotion) finishCounters();
    dispatchEvent(new CustomEvent('tetris-motion', { detail: { paused: reduceMotion } }));
    queueScroll();
  }
  motionButton.addEventListener('click', () => { manualPause = !manualPause; updateMotion(); });
  motionQuery.addEventListener('change', updateMotion);
  updateMotion();
})();
