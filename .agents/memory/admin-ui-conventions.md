---
name: Admin UI conventions
description: Patterns established for the UFO Sport admin panel — toast notifications, confirm modals, Czech labels, breadcrumbs, search.
---

## Toast notifications
- Store: `store/toastStore.ts` — Zustand store, `useToast()` hook exports `.success()`, `.error()`, `.info()`, `.warning()`
- Renderer: `components/admin/Toast.tsx` — `<ToastRenderer />` fixed bottom-right, rendered once in `app/admin/layout.tsx`
- Usage: `const toast = useToast();` at top of component, then `toast.success('...')` etc.
- Auto-dismiss: 4.5 seconds

## Confirm modal
- Component: `components/admin/ConfirmModal.tsx`
- Props: `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `isDestructive` (default true → red button), `onConfirm`, `onCancel`
- Pattern: add `const [deleteModal, setDeleteModal] = useState<{ id: string; ... } | null>(null)` to component state; call `setDeleteModal({ id, ... })` from the handler; use `confirmDelete` async function for the actual work
- Keyboard: Escape = cancel, Enter = confirm

## Breadcrumbs
- Rendered automatically in `app/admin/layout.tsx` via `<Breadcrumbs pathname={pathname} />`
- Section label map lives in `SECTION_LABELS` in the layout file
- Shows "Dashboard > Section > Sub-page" based on pathname segments

## Search (products page)
- State: `const [search, setSearch] = useState('');`
- Filter: apply `product.name.toLowerCase().includes(search.toLowerCase())` on top of existing filter tabs
- UI: search input with inline clear button, placed above filter tabs

## Czech labels to remember
- `sizeFit` field label: "Střih a velikost" (was "Size & Fit")
- `shippingInfo` label: "Doprava a vrácení" (already correct)
- `careInfo` label: "Péče o produkt" (already correct)
- Payment statuses: PAID→Zaplaceno, PENDING→Čeká na platbu, FAILED→Platba selhala, REFUNDED→Vráceno
- Order statuses: PENDING→Čeká, PAID→Zaplaceno, PROCESSING→Zpracovává se, SHIPPED→Odesláno, COMPLETED→Dokončeno, CANCELLED→Zrušeno

## Back navigation
- All back buttons in detail pages (objednávky, produkty) use hardcoded `<Link href="/admin/...">` not `router.back()`

**Why:** `router.back()` fails when users open a page directly via URL bookmark, and creates confusing navigation when coming from external pages.
