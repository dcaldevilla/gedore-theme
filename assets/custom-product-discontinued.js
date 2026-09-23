(() => {
  if (window.customProductDiscontinuedInitialized) return;
  window.customProductDiscontinuedInitialized = true;

  const NOTICE_ID_PREFIX = 'CustomDiscontinued-';
  const LOCK_ATTRIBUTE = 'data-custom-discontinued-lock';

  const getSectionId = (productInfo) => productInfo.dataset.originalSection || productInfo.dataset.section;

  const getNotice = (productInfo) =>
    productInfo.querySelector(`#${CSS.escape(`${NOTICE_ID_PREFIX}${productInfo.dataset.section}`)}`);

  const lock = (element) => element?.setAttribute(LOCK_ATTRIBUTE, '');

  // Applies the discontinued state to Dawn's buy buttons. Idempotent: safe to run
  // repeatedly for the same variant. Dawn's own toggleSubmitButton() restores the
  // label and disabled state on every variant change before variantChange is
  // published, so only the attributes set here need to be undone.
  const applyState = (productInfo) => {
    const notice = getNotice(productInfo);
    if (!notice) return;

    const isSoldOut = notice.dataset.customDiscontinuedState === 'sold_out';
    const label = notice.dataset.soldOutLabel;
    const productForm = productInfo.querySelector('product-form');
    const submitButton = productForm?.querySelector('[type="submit"][name="add"]');
    const submitButtonText = submitButton?.querySelector('span');
    const paymentButton = productForm?.querySelector('.shopify-payment-button');
    const soldOutBadge = productInfo.querySelector(
      `#${CSS.escape(`price-${productInfo.dataset.section}`)} .price__badge-sold-out`
    );

    if (isSoldOut) {
      if (submitButton) {
        submitButton.setAttribute('disabled', 'disabled');
        submitButton.setAttribute('aria-disabled', 'true');
        lock(submitButton);
      }
      if (submitButtonText && label) submitButtonText.textContent = label;
      if (paymentButton) {
        paymentButton.style.display = 'none';
        lock(paymentButton);
      }
      if (soldOutBadge && label) soldOutBadge.textContent = label;
      return;
    }

    if (submitButton?.hasAttribute(LOCK_ATTRIBUTE)) {
      submitButton.removeAttribute('aria-disabled');
      submitButton.removeAttribute(LOCK_ATTRIBUTE);
    }
    if (paymentButton?.hasAttribute(LOCK_ATTRIBUTE)) {
      paymentButton.style.display = '';
      paymentButton.removeAttribute(LOCK_ATTRIBUTE);
    }
  };

  // Mirrors Dawn's updateSourceFromDestination(): copies the freshly rendered
  // notice from the Section Rendering API response into the live DOM.
  const updateNotice = (productInfo, html) => {
    const source = html?.getElementById(`${NOTICE_ID_PREFIX}${getSectionId(productInfo)}`);
    const destination = getNotice(productInfo);
    if (!source || !destination) return;

    destination.innerHTML = source.innerHTML;
    destination.dataset.customDiscontinuedState = source.dataset.customDiscontinuedState;
    destination.hidden = source.hidden;
  };

  const init = () => {
    document.querySelectorAll('product-info').forEach(applyState);

    // Fires for product-info elements connected later (product swap, quick add).
    document.addEventListener('product-info:loaded', ({ target }) => applyState(target));

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.variantChange) {
      subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        const sectionId = event?.data?.sectionId;
        if (!sectionId) return;

        document.querySelectorAll('product-info').forEach((productInfo) => {
          if (String(getSectionId(productInfo)) !== String(sectionId)) return;
          updateNotice(productInfo, event.data.html);
          applyState(productInfo);
        });
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
