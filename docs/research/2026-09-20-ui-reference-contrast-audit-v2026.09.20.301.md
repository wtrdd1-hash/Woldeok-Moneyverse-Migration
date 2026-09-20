# UI Reference Corpus and Contrast Audit — v2026.09.20.301

Date: 2026-09-20  
Branch: `feat/frontend-contrast-v2026.09.20.301`  
Base: `0b973824d85379119813f9b9f53cd7cdd4ddeb93`

## Purpose

This note defines the visual-reference and colour-accessibility standard for the ongoing full frontend rebuild. The 10k+ reference requirement is treated as corpus-scale evidence, not as a claim that every screenshot was individually hand-reviewed.

## Reference corpus

- SeeClick web data: 270k crawled webpage screenshots with a published 10,000-image subset. Source: https://github.com/njucckevin/SeeClick/blob/main/readme_data.md
- WebUI: 41,970 web screenshots across six viewports in the unified WebUI/Rico benchmark. Source: https://zenodo.org/records/19195885
- RICO: more than 66k unique UI screens and more than 3M UI elements from 9.3k Android apps. Source: https://www.interactionmining.org/archive/rico
- Enrico: manually curated from a random 10k RICO sample and organized into common UI topics such as login, form, list, modal, profile and settings. Source: https://github.com/luileito/enrico

The corpus is used for recurring layout, density, hierarchy and component-pattern evidence. It is not used to copy branding or arbitrary colour palettes.

## Accessibility authority

- WCAG 2.2 SC 1.4.3: normal text requires at least 4.5:1; large text requires 3:1. https://www.w3.org/TR/WCAG22/
- GOV.UK Design System: use functional colour roles and explicitly meet WCAG AA contrast. https://design-system.service.gov.uk/styles/colour/
- Atlassian Design System: apply colour by semantic design tokens and use inverse tokens on bold backgrounds. https://atlassian.design/foundations/color
- Material accessibility guidance: dark text on light surfaces and light text on dark surfaces, with 4.5:1 for small text. https://m1.material.io/usability/accessibility.html

## Defects found

1. v297 applied the same semantic rebuild palette to both `:root` and `.dark`, while Tailwind `dark:` variants still activated. This could mix a light physical surface with dark-mode utility colours.
2. The light tertiary token `#747c86` measured 3.77:1 on the page background and 4.23:1 on a white card, below the 4.5:1 normal-text floor.
3. Header/footer/table/skeleton surfaces included hard-coded light colours that stayed light in dark mode.
4. Home status content retained inverse white text after its feature card became a light semantic card.
5. Multiple shop, work, business, inventory and admin screens retained light-theme 300/400 accent text on light surfaces.
6. User-selected point colours could produce a bright primary surface while keeping white primary text.

## Repaired contrast floors

Light palette:

- primary text / page: 15.58:1
- secondary text / page: 6.73:1
- tertiary text / page: 4.90:1
- accent text / page: 6.00:1
- primary button foreground / primary: 6.48:1

Dark palette:

- primary text / page: 17.32:1
- secondary text / page: 11.49:1
- tertiary text / page: 8.67:1
- accent text / card: 6.14:1
- primary button foreground / primary: 7.34:1

## Implementation rule

Use semantic foreground/background tokens for ordinary product UI. Use explicit inverse text only on an explicit, stable dark presentation surface. Status colours should communicate meaning but must not be the only carrier of that meaning. New normal-size text combinations must meet 4.5:1 before merge.
