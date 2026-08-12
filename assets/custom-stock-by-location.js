(() => {
  const STOCK_CONTAINER_SELECTOR = '[data-stock-by-location-container]';

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

  const getStockTone = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('sin stock')) return 'out';

    const quantityMatch = normalized.match(/(\d+)/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : null;

    if (quantity !== null) {
      if (quantity === 0) return 'out';
      if (quantity < 10) return 'warn';
      return 'ok';
    }

    if (normalized.includes('disponible')) return 'ok';
    if (normalized.includes('sin stock') || normalized.includes('0 uds')) return 'out';
    if (normalized.includes('disponible')) return 'ok';
    if (normalized.includes('uds')) return 'warn';
    return 'warn';
  };

  const updateStatusBadge = (container, textSelector, statusSelector) => {
    const textNode = container.querySelector(textSelector);
    const statusNode = container.querySelector(statusSelector);
    if (!textNode || !statusNode) return;

    const tone = getStockTone(textNode.textContent);
    statusNode.className = `custom-product-stock__status custom-product-stock__status--${tone}`;

    const labels = {
      ok: container.dataset.statusOkText,
      warn: container.dataset.statusWarnText,
      out: container.dataset.statusOutText,
    };
    const statusTextNode = statusNode.querySelector('[data-stock-status-text]');
    if (statusTextNode) statusTextNode.textContent = labels[tone] || '';
  };

  const updateStock = (container, stockData, variantId) => {
    if (!container || !stockData || !variantId) return;

    const variantStock = stockData[String(variantId)];
    if (!variantStock) return;

    const vitoriaNode = container.querySelector('[data-stock-vitoria]');
    const alemaniaNode = container.querySelector('[data-stock-alemania]');

    if (vitoriaNode) vitoriaNode.textContent = variantStock.vitoria;
    if (alemaniaNode) alemaniaNode.textContent = variantStock.alemania;

    updateStatusBadge(container, '[data-stock-vitoria]', '[data-stock-vitoria-status]');
    updateStatusBadge(container, '[data-stock-alemania]', '[data-stock-alemania-status]');
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
