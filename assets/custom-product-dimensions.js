(() => {
  const DIMENSIONS_ACCORDION_SELECTOR = '[data-product-dimensions-accordion]';

  const parseDimensionsData = (sectionId) => {
    const dataNode = document.getElementById(`ProductDimensionsData-${sectionId}`);
    if (!dataNode) return null;

    try {
      return JSON.parse(dataNode.textContent);
    } catch (error) {
      console.error('No se pudo parsear ProductDimensionsData', error);
      return null;
    }
  };

  const setDimensionValue = (container, rowSelector, valueSelector, value, unit = '') => {
    const row = container.querySelector(rowSelector);
    const valueNode = container.querySelector(valueSelector);
    if (!row || !valueNode) return false;

    const hasValue = value !== null && value !== undefined && value !== '';
    row.classList.toggle('hidden', !hasValue);
    valueNode.textContent = hasValue ? `${value}${unit}` : '';

    return hasValue;
  };

  const updateDimensions = (container, dimensionsData, variantId) => {
    if (!container || !dimensionsData || !variantId) return;

    const values = dimensionsData[String(variantId)];
    if (!values) return;

    const hasWeight = setDimensionValue(
      container,
      '[data-dimensions-weight]',
      '[data-dimensions-weight-value]',
      values.weight
    );
    const hasLongitud = setDimensionValue(
      container,
      '[data-dimensions-longitud]',
      '[data-dimensions-longitud-value]',
      values.longitud,
      ' mm'
    );
    const hasAnchura = setDimensionValue(
      container,
      '[data-dimensions-anchura]',
      '[data-dimensions-anchura-value]',
      values.anchura,
      ' mm'
    );
    const hasAltura = setDimensionValue(
      container,
      '[data-dimensions-altura]',
      '[data-dimensions-altura-value]',
      values.altura,
      ' mm'
    );

    container.classList.toggle('hidden', !(hasWeight || hasLongitud || hasAnchura || hasAltura));
  };

  const initDimensionsAccordion = () => {
    document.querySelectorAll(DIMENSIONS_ACCORDION_SELECTOR).forEach((container) => {
      const sectionId = container.dataset.sectionId;
      const dimensionsData = parseDimensionsData(sectionId);
      if (!sectionId || !dimensionsData) return;

      const productInfo = container.closest('product-info');
      const variantInput = productInfo?.querySelector('form input[name="id"]');

      if (variantInput?.value) {
        updateDimensions(container, dimensionsData, variantInput.value);
      }

      variantInput?.addEventListener('change', (event) => {
        updateDimensions(container, dimensionsData, event.target.value);
      });

      if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
        subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (String(event?.data?.sectionId) !== String(sectionId)) return;
          updateDimensions(container, dimensionsData, event?.data?.variant?.id);
        });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDimensionsAccordion);
  } else {
    initDimensionsAccordion();
  }
})();
