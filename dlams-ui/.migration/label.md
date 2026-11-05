# label

2026-11-05, transformation engine (legacy `new-york` style, no base counterpart), moved to a native `<label>` with its classes kept. Base UI has no standalone label primitive; its `Field.Label` is part of `Field`.

## Changed

- `src/components/ui/label.tsx`: `LabelPrimitive.Root` replaced by `<label>`, props typed as `React.ComponentProps<"label">`. Classes and `data-slot` unchanged. This matches the base registry's file except for the `cn` import path.
- `src/components/ui/form.tsx`, its only consumer, was repointed through `label-base.tsx` with a typecheck, then flipped back, so it has no net change.

Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder" src/components/ui/label.tsx` finds nothing.

## Left alone

- `src/components/ui/form.tsx`: still imports `@radix-ui/react-label` for `FormLabel`'s prop type, and `@radix-ui/react-slot`. Next step, so `@radix-ui/react-label` stays installed until then.
- `src/components/ui/drawer.tsx`: Vaul, not Radix. Moved in a later step at the owner's request.
- Raw `<label>` elements in our own forms: item 6a in the plan.

## Behavior changes

- Radix called `preventDefault` on a double-click's mouse down, to stop the label's text being selected. The native label does not. The `select-none` class already stops that selection, so nothing should look different.

## Verify by hand

- On Login, click the "Username" label. The field should take focus.
- Double-click the label. No text should be selected.
