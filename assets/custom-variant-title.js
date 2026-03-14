(() => {
  const parseJson = (id) => {
    const node = document.getElementById(id);
    if (!node?.textContent) return null;

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  };

  const updateTitles = (sectionId, variantId) => {
    if (!sectionId || !variantId) return;

    const titlesMap = parseJson(`CustomVariantTitleData-${sectionId}`);
    if (!titlesMap) return;

    const nextTitle = titlesMap[String(variantId)];
    if (!nextTitle) return;

    document.querySelectorAll(`[data-custom-variant-title][data-section-id="${sectionId}"]`).forEach((node) => {
      node.textContent = nextTitle;
    });
  };

  const initSection = (productInfo) => {
    const sectionId = productInfo?.dataset?.section;
    if (!sectionId) return;

    const variantInput = productInfo.querySelector('form input[name="id"]');

    if (variantInput?.value) updateTitles(sectionId, variantInput.value);

    variantInput?.addEventListener('change', (event) => {
      updateTitles(sectionId, event.target.value);
    });
  };

  const initAll = () => {
    document.querySelectorAll('product-info[data-section]').forEach(initSection);
  };

  document.addEventListener('DOMContentLoaded', initAll);

  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
    subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      const sectionId = event?.data?.sectionId;
      const variantId = event?.data?.variant?.id;
      updateTitles(sectionId, variantId);
    });
  }
})();
