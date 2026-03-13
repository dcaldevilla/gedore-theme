(() => {
  const VENDOR_SKU_SELECTOR = '[id^="ProductVendorSku-"]';
  const IDENTIFIERS_SELECTOR = '[id^="ProductIdentifiers-"]';

  const parseDataNode = (id) => {
    const node = document.getElementById(id);
    if (!node) return null;

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error(`No se pudo parsear ${id}`, error);
      return null;
    }
  };

  const textOrFallback = (value) => {
    if (value === null || value === undefined || value === '') return 'no disponible';
    return value;
  };

  const updateVendorSku = (container, skuData, variantId) => {
    if (!container || !skuData || !variantId) return;

    const sku = skuData[String(variantId)] ?? '';
    const skuNode = container.querySelector('[data-product-sku]');
    if (skuNode) skuNode.textContent = sku;

    container.classList.toggle('visibility-hidden', !sku);
  };

  const updateIdentifiers = (container, identifiersData, variantId) => {
    if (!container || !identifiersData || !variantId) return;

    const values = identifiersData[String(variantId)];
    if (!values) return;

    const skuNode = container.querySelector('[data-product-sku-grid]');
    const mpnNode = container.querySelector('[data-product-mpn]');
    const eanNode = container.querySelector('[data-product-ean]');

    if (skuNode) skuNode.textContent = textOrFallback(values.sku);
    if (mpnNode) mpnNode.textContent = textOrFallback(values.mpn);
    if (eanNode) eanNode.textContent = textOrFallback(values.ean);
  };

  const registerVariantListener = (sectionId, onVariantChange) => {
    const productInfo = document.querySelector(`product-info[data-section="${sectionId}"]`) ||
      document.getElementById(`ProductInfo-${sectionId}`)?.closest('product-info');

    const variantInput = productInfo?.querySelector('form input[name="id"]');

    if (variantInput?.value) onVariantChange(variantInput.value);

    variantInput?.addEventListener('change', (event) => {
      onVariantChange(event.target.value);
    });

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
      subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        if (String(event?.data?.sectionId) !== String(sectionId)) return;
        onVariantChange(event?.data?.variant?.id);
      });
    }
  };

  const initVendorSku = () => {
    document.querySelectorAll(VENDOR_SKU_SELECTOR).forEach((container) => {
      const sectionId = container.dataset.sectionId;
      const skuData = parseDataNode(`ProductVendorSkuData-${sectionId}`);
      if (!sectionId || !skuData) return;

      registerVariantListener(sectionId, (variantId) => {
        updateVendorSku(container, skuData, variantId);
      });
    });
  };

  const initIdentifiers = () => {
    document.querySelectorAll(IDENTIFIERS_SELECTOR).forEach((container) => {
      const sectionId = container.dataset.sectionId;
      const identifiersData = parseDataNode(`ProductIdentifiersData-${sectionId}`);
      if (!sectionId || !identifiersData) return;

      registerVariantListener(sectionId, (variantId) => {
        updateIdentifiers(container, identifiersData, variantId);
      });
    });
  };

  const init = () => {
    initVendorSku();
    initIdentifiers();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
