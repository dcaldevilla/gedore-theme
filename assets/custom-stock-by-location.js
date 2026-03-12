(() => {
  const STOCK_CONTAINER_SELECTOR = '[id^="StockByLocation-"]';

  const parseStockData = (sectionId) => {
    const dataNode = document.getElementById(`StockByLocationData-${sectionId}`);
    if (!dataNode) return null;

    try {
      return JSON.parse(dataNode.textContent);
    } catch (error) {
      console.error('No se pudo parsear StockByLocationData', error);
      return null;
    }
  };

  const updateStock = (container, stockData, variantId) => {
    if (!container || !stockData || !variantId) return;

    const variantStock = stockData[String(variantId)];
    if (!variantStock) return;

    const vitoriaNode = container.querySelector('[data-stock-vitoria]');
    const alemaniaNode = container.querySelector('[data-stock-alemania]');

    if (vitoriaNode) vitoriaNode.textContent = variantStock.vitoria;
    if (alemaniaNode) alemaniaNode.textContent = variantStock.alemania;
  };

  const initStockByLocation = () => {
    document.querySelectorAll(STOCK_CONTAINER_SELECTOR).forEach((container) => {
      const sectionId = container.dataset.sectionId;
      const stockData = parseStockData(sectionId);
      if (!sectionId || !stockData) return;

      const productInfo = container.closest('product-info');
      const variantInput = productInfo?.querySelector('form input[name="id"]');

      if (variantInput?.value) {
        updateStock(container, stockData, variantInput.value);
      }

      variantInput?.addEventListener('change', (event) => {
        updateStock(container, stockData, event.target.value);
      });

      if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
        subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (String(event?.data?.sectionId) !== String(sectionId)) return;
          updateStock(container, stockData, event?.data?.variant?.id);
        });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStockByLocation);
  } else {
    initStockByLocation();
  }
})();
