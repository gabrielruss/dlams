# button

2026-11-04, transformation engine (legacy `new-york` style, no base counterpart), migrated to `@base-ui/react/button` with its classes kept.

## Changed

- `src/components/ui/button.tsx`: `Slot`/`asChild` replaced by `ButtonPrimitive`. Classes unchanged, `data-variant` and `data-size` kept.
- `src/components/ui/combobox.tsx`: `InputGroupButton asChild` with a `ComboboxTrigger` child became `render={<ComboboxTrigger />}`, matching the base registry's file.
- `src/pages/Register.tsx`, `src/components/AppSidebar.tsx`: `Button asChild` links became `Link` and `NavLink` with `buttonVariants`, as shadcn's Button docs say for links. In `AppSidebar`, `buttonVariants` does not merge classes, so both `justify-center` and `justify-start` are on the link; `justify-start` wins because it comes later in the built CSS.
- `.prettierignore`, `eslint.config.js`: ignore `.agents` and `.claude`, the installed skill files. `.prettierignore` also ignores `.migration`.
- Consumers were repointed one at a time through `button-base.tsx` with a typecheck after each, then flipped back, so the other import lines have no net change.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder" src/components/ui/button.tsx` finds nothing.

## Left alone

- `src/components/ui/drawer.tsx` and its `DrawerClose asChild` uses: Vaul, not Radix. Moved in a later step at the owner's request.
- `src/components/ui/label.tsx`, `src/components/ui/form.tsx`: later steps.

## Behavior changes

- Links no longer render through `Button`, so they have no `data-slot="button"`, `data-variant`, or `data-size`.

## Verify by hand

- Tab to and click a default, outline, and ghost `Button`. Focus ring and hover should look as before.
- Submit login and a drawer form with Save and with Enter. A disabled Save should not click.
- As an admin, check "Manage users": left-aligned, highlighted on that page, and it navigates.
- Register with an invitation and follow "Go to login".
- Open the console combobox with its arrow button and pick an option.
