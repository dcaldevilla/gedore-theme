# AGENTS.md — Shopify Theme (GEDORE Ibérica)

## Objetivo

Permitir que agentes de IA (Codex) refactoricen y mantengan el theme **sin romper compatibilidad con Dawn ni con Sparklayer**.

## Reglas generales

1. **No modificar la estructura base del theme** (layout/, config/, locales/, sections/, snippets/, assets/, templates/).
2. **Evitar cambios directos en `sections/main-product.liquid`** salvo para añadir o mover llamadas `{% render %}`.
3. **Toda lógica custom debe ir en snippets** con prefijo `custom-` o `gedore-`.
4. **No alterar el `schema` de secciones existentes** salvo que se indique explícitamente.
5. **No eliminar bloques ni settings existentes** del theme.
6. **Mantener compatibilidad con apps que usan app blocks**, especialmente Sparklayer.

## Convenciones de código

* Snippets custom: `snippets/custom-*.liquid`
* JS custom: `assets/custom-*.js`
* CSS custom: `assets/custom-*.css`
* Comentarios delimitadores para hooks:

```liquid
{% comment %} CUSTOM START: stock by location {% endcomment %}
{% render 'custom-stock-by-location', product: product %}
{% comment %} CUSTOM END: stock by location {% endcomment %}
```

## Patrón para modificar `main-product.liquid`

* Insertar únicamente llamadas a snippets.
* Nunca añadir lógica compleja directamente en el archivo.
* Ejemplo permitido:

```liquid
{% render 'custom-product-identifiers', product: product %}
{% render 'custom-stock-by-location', product: product %}
```

## Flujo de trabajo

1. Crear rama desde `main`.
2. Hacer cambios en snippets o assets.
3. Mantener `sections/main-product.liquid` lo más cercano posible al original de Dawn.
4. Generar diff claro y documentado en el commit.

## Tareas comunes para el agente

* Extraer lógica repetida a snippets.
* Documentar secciones y snippets.
* Analizar diffs entre versiones del theme.
* Reaplicar customizaciones tras actualización de Dawn.

## Tareas prohibidas

* Reescribir archivos completos de Dawn sin necesidad.
* Modificar `schema` de secciones base sin justificación.
* Eliminar compatibilidad con bloques de apps.

## Contexto del proyecto

* Tienda: gedore-iberica.myshopify.com
* Theme base: Dawn (customizado)
* Integraciones: Sparklayer
* Custom features actuales:

  * EAN / MPN en ficha de producto
  * Stock por ubicación
  * Snippets custom para identificadores de producto
