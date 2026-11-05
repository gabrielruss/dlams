# drawer

2026-11-05, golden pair via CLI (opt-in Vaul move, not Radix): our `drawer.tsx` was the stock `new-york-v4` Vaul drawer with no edits, so the owner reinstalled it from `base-nova` with `npx shadcn@latest add drawer --overwrite`. It now uses `@base-ui/react/drawer`.

## Changed

- `src/components/ui/drawer.tsx`: the `base-nova` registry file (the CLI dropped `cn-font-heading` from `DrawerTitle`). Content is now `Viewport > Popup > Content`; Root takes `swipeDirection` (default `"down"`), `modal`, `snapPoints`, `showSwipeHandle`.
- 7 drawers (`AppSidebar`, `RegistrationInviteManager`, `CollectionNavigation`, `ShareCollectionDrawer`, `EditCollectionDrawer`, `ConsoleManager`, `GameManager`): Vaul's `direction` became `swipeDirection`.
- 6 Close buttons: `DrawerClose asChild` with a child became `DrawerClose render={...}`, as in shadcn's Base drawer docs.
- Headers with `border-b` gained `pb-4`, footers with `border-t` gained `pt-4`: the new header has no bottom padding and the footer no top padding.
- `components/ui/combobox.tsx`: its `container` edit, a Vaul workaround, was removed with the drawer ref wiring in the console and game drawers, after the owner checked that picking an option no longer closes the drawer.
- `drawer.tsx`: side drawers set `--drawer-content-height` to `100svh` (logged local edit) so iOS 26 Safari's toolbar does not hide the footer.

Leftover scan clean: `grep -rn "vaul" src` finds nothing.

## Left alone

- Nothing related.

## Behavior changes

- `base-nova` look: a lighter blurred backdrop (`bg-black/10`, was `/50`), rounded corners on the open side, `bg-popover` (was `bg-background`), swipe-to-close.
- Base UI drawers default to opening from the bottom; every drawer here passes its side explicitly.

## Verify by hand

- Open each drawer (Create collection, Edit collection, Share, Invite, Add/Edit console, Add/Edit game, phone menu): right side (menu on the left), slides in and out, Escape and Close close it, the backdrop click closes it.
- In a game drawer, open the console combobox and pick an option: the drawer stays open.
- On a phone, edit an item, open and close the keyboard: the drawer should return to full height (the old Vaul bug).
- Swipe a drawer closed toward its side.
