# Nourish interface guide

## Direction

Nourish should feel calm, precise, and reassuring: a lightweight native nutrition journal rather than a clinical dashboard. Favor warm white surfaces, botanical greens, generous rounded shapes, short labels, and clear numerical hierarchy.

## Palette

- Canvas: `#F4F7F4`
- Paper: `#FFFFFF`
- Ink: `#192420`
- Muted text: `#71807A`
- Border: `#E3E9E5`
- Primary green: `#23795E`
- Deep green: `#155B46`
- Mint surface: `#E3F2EB`
- Chart lime: `#C7E16E`
- Error surface/text: `#FAE8E9` / `#9B4147`
- MyNetDiary source: `#E8F2FF` / `#32639B`
- AI-photo source: `#EEE9FF` / `#6950AE`

## Typography

- Use the native system font stack for fast rendering and a platform-appropriate feel.
- Page titles use tight tracking and strong weight.
- Eyebrows are 11px, uppercase, extra-bold, and widely tracked.
- Body copy is 12–14px; all editable inputs are at least 16px to prevent iOS focus zoom.

## Shape and elevation

- Primary cards: 25px radius, subtle green-tinted shadow.
- Secondary controls: 11–15px radius.
- Modals: 28px top radius on mobile and 28px all around on desktop.
- Prefer borders and spacing over heavy shadows; reserve stronger elevation for primary cards, floating actions, and sheets.

## Layout and interaction

- Mobile is the primary layout. Keep the fixed bottom navigation outside the elastic main content scroll area.
- At 960px and above, show the desktop sidebar and hide the mobile bottom navigation/floating camera button.
- Every interactive control needs a visible focus state and a descriptive accessible label when its icon is not self-explanatory.
- Keep touch targets near 40px or larger. Toasts must never intercept pointer or scrolling gestures.
- Preserve `aria-label="Bottom navigation"` as the launcher's semantic Exit-injection hook.

## Styling implementation

- Tailwind CSS utility classes live directly in React component `className` values.
- `src/index.css` contains only `@import "tailwindcss";`, which is the compiler entry—not an authored stylesheet.
- Dynamic values such as progress widths and conic-gradient angles may use inline `style` properties.
- MUI is intentionally excluded unless a future feature introduces complex data-grid or enterprise form requirements that Tailwind cannot reasonably cover.
