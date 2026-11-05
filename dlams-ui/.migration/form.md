# form

2026-11-05, replaced rather than transformed: shadcn has no base `form` (its `base-nova` registry entry is empty), so its consumers moved to `field` as shadcn's React Hook Form guide shows, and `form.tsx` was deleted. Our `form.tsx` used no Radix Form parts, only `Slot` and a label prop type.

## Changed

- `src/pages/Login.tsx` (2 fields), `src/pages/Register.tsx` (4), `src/components/collections/CreateLinkForm.tsx` (1), `src/components/collections/EditCollectionDrawer.tsx` (1): `Form` > `FormField` > `FormItem` > `FormLabel` / `FormControl` / `FormMessage` became `Controller` > `Field` > `FieldLabel`, `Input` with `id` and `aria-invalid`, and `FieldError`. Zod schemas and `useForm` calls unchanged.
- `src/components/ui/form.tsx`: deleted.
- `src/components/ui/field.tsx`, `src/components/ui/separator.tsx`: installed by the owner from `base-nova`.
- `.github/copilot-instructions.md`: the form pattern now follows the guide.

Leftover scan clean: `grep -rn "radix" src` finds nothing.

## Left alone

- `FieldGroup`, used in the guide's full example: it sets `gap-5`, and our forms keep their own `gap-4` / `gap-2` layout.
- Item drawer forms (`GameForm`, `ConsoleForm`) and the invite drawer: raw elements with `register`, plan item 6a.
- `src/components/ui/drawer.tsx`: Vaul, the next step.

## Behavior changes

- Field errors are a `div role="alert"` (`FieldError`), so they are announced when they appear. `FormMessage` was a plain `p` linked through `aria-describedby`; `FieldError` is not linked.
- The label turns red on an invalid field through `Field`'s `data-invalid` (was `FormLabel`'s `data-error`).
- `FieldLabel` uses `leading-snug` where `FormLabel` had `leading-none`, and `Field` spaces its parts with `flex-col gap-2` where `FormItem` used `grid gap-2`.

## Verify by hand

- Login: submit empty. Both errors show and the labels turn red; typing a valid value clears them. Clicking a label focuses its input. `Field` turns its whole group red while invalid, so check whether typed text turns red too.
- Register with an invitation: mismatched passwords show the error on Confirm password.
- Share drawer: create a named link. Edit collection drawer: blank the name and save to see the error, then rename.
- Compare the spacing between label and input with before.
