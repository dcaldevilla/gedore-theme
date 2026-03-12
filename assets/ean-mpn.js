document.addEventListener("DOMContentLoaded", function () {
  const dataElement = document.getElementById("ProductVariantsWithMPN");
  const output = document.querySelector('[id^="VariantEANMPN-"]');

  if (!dataElement || !output) return;

  const variantData = JSON.parse(dataElement.textContent);

  function updateVariantDetails() {
    const variantInput = document.querySelector('form input[name="id"]');
    if (!variantInput) return;

    const selectedId = parseInt(variantInput.value);
    const variant = variantData.find(v => v.id === selectedId);
    if (!variant) return;

    const mpn = variant.mpn || 'no disponible';
    const ean = variant.barcode || 'no disponible';

    output.textContent = `MPN: ${mpn} – EAN13: ${ean}`;
  }

  updateVariantDetails();

  const observer = new MutationObserver(updateVariantDetails);
  const variantInput = document.querySelector('form input[name="id"]');
  if (variantInput) {
    observer.observe(variantInput, { attributes: true, attributeFilter: ['value'] });
  }

  document.querySelectorAll('form input[type=radio], form select').forEach(input => {
    input.addEventListener('change', updateVariantDetails);
  });
});

