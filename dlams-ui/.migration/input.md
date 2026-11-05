# input

2026-11-05, transformation engine, moved to `@base-ui/react/input` with our classes kept. It had no Radix import; it was a native `<input>` where the `base-nova` registry uses Base UI's Input.

## Changed

- `src/components/ui/input.tsx`: `<input>` replaced by `InputPrimitive`. Props, classes and `data-slot` unchanged.
- `src/index.css`: Base UI's quick start setup, `position: relative` on `body` and `isolation: isolate` on `#root`.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder" src/components/ui/input.tsx` finds nothing.

## Left alone

- Consumers (`Login`, `Register`, `CreateLinkForm`, `EditCollectionDrawer`, `RegistrationInviteManager`, `SearchField`, and `InputGroupInput` in the combobox): no call-site changes needed.

## Behavior changes

- Base UI's Input adds state attributes such as `data-dirty`, `data-touched`, `data-filled` and `data-focused`. Nothing styles them yet.

## Verify by hand

Owner-checked 2026-11-05: typing and submitting, validation errors, search, the console combobox in a drawer, and drawers at phone width.
