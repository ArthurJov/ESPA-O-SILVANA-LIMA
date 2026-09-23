/**
 * Public results are rendered only after authorization and publication checks.
 */
export function renderResultsGallery(results = []) {
  const gallery = document.querySelector('[data-results-gallery]');
  if (!gallery) return;

  const publishedResults = results.filter((result) => (
    result.authorized &&
    result.confirmed &&
    result.published &&
    ((result.beforeImage && result.afterImage) || result.compositeImage)
  ));

  if (!publishedResults.length) {
    gallery.innerHTML = `
      <div class="results-empty" role="status">
        <span class="eyebrow">Galeria em construção</span>
        <h3>Os primeiros registros autorizados aparecerão aqui.</h3>
        <p>Enquanto reunimos imagens reais com contexto e autorização expressa, você pode conversar com a equipe sobre o seu objetivo.</p>
        <a href="/avaliacao/" class="btn btn--primary">Agendar avaliação</a>
      </div>`;
    return;
  }

  gallery.innerHTML = publishedResults.map((result) => {
    const details = [result.region, result.period, result.sessions]
      .filter(Boolean)
      .map(escapeHTML)
      .join(' / ');
    const context = result.context ? `<p class="result-card__context">${escapeHTML(result.context)}</p>` : '';

    const images = result.compositeImage
      ? `
          <button class="gallery-item gallery-item--composite" type="button" aria-label="Ampliar registro de antes e depois">
            <img src="${escapeAttribute(result.compositeImage)}" alt="${escapeAttribute(result.imageAlt || 'Registro de antes e depois')}" width="${escapeAttribute(result.imageWidth || 1200)}" height="${escapeAttribute(result.imageHeight || 800)}" loading="lazy" decoding="async" />
            <span>Antes e depois</span>
          </button>`
      : `
          <button class="gallery-item" type="button" aria-label="Ampliar imagem de antes">
            <img src="${escapeAttribute(result.beforeImage)}" alt="${escapeAttribute(result.beforeAlt || 'Registro de antes')}" width="900" height="1125" loading="lazy" decoding="async" />
            <span>Antes</span>
          </button>
          <button class="gallery-item" type="button" aria-label="Ampliar imagem de depois">
            <img src="${escapeAttribute(result.afterImage)}" alt="${escapeAttribute(result.afterAlt || 'Registro de depois')}" width="900" height="1125" loading="lazy" decoding="async" />
            <span>Depois</span>
          </button>`;

    return `
      <article class="result-card" data-reveal>
        <div class="result-card__images${result.compositeImage ? ' result-card__images--single' : ''}">${images}
        </div>
        <div class="result-card__content">
          <span class="result-card__type">Registro oficial</span>
          <h3>${escapeHTML(result.procedure || 'Evolução acompanhada')}</h3>
          ${details ? `<p class="result-card__meta">${details}</p>` : ''}
          ${context}
        </div>
      </article>`;
  }).join('');
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, '&#96;');
}
