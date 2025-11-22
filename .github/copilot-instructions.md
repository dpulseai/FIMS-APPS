<!-- Copilot / AI agent instructions for FIMS-APPS -->

# Quick Orientation

This repo is a React Native (Expo) mobile app connecting to Supabase. Primary concerns for an AI coder: offline/online sync logic, Supabase table/field mappings, photo storage buckets, and the navigation/screens structure used for many different inspection forms.

**Tech stack:** `Expo` + `React Native` + `TypeScript` + `Supabase`.

**Run / build:** use `npm run start` (Expo), `npm run android`, `npm run ios`, `npm run web`. Builds use EAS: `npm run build:android` / `npm run build:ios`.

**Key directories:**
- `src/services/` — Supabase wrapper and offline sync (`supabase.ts`, `offlineService.ts`, `fimsService.ts`).
- `src/screens/forms/` — form screens for each inspection type.
- `src/screens/inspections/` — list/detail flows and category selection.
- `src/components/` — shared UI components.
- `src/types/` — app TypeScript types.

## Big-picture architecture notes (must-read)
- `supabase.ts` creates the Supabase client and exports `supabase` and `isSupabaseConfigured`. Many services rely on those exports.
- `offlineService.ts` manages local persistence (AsyncStorage), network detection (`@react-native-community/netinfo`) and a `syncOfflineData()` routine that attempts to insert offline inspections and upload photos to Supabase storage.
- `fimsService.ts` is the online facade used by screens. It maps local model fields to DB columns and handles both online and offline creation (delegates to `offlineService`).
- UI screens call `fimsService` for CRUD; `offlineService` is used directly for local persistence and for status checks.

## Important patterns & conventions (concrete)
- Field mapping: the DB uses `latitude`, `longitude`, `address` columns while the app uses `location_latitude`, `location_longitude`, `location_address`. Check `fimsService.getInspections()` and `createInspection()` for exact mappings.
+- Photo upload paths and canonical bucket:
  - The canonical storage bucket used by the backend is `field-visit-images` (use this everywhere).
  - Photo uploads are canonicalized to `field-visit-images` and DB inserts should use `photo_name` and `photo_order` (see `src/services/fimsService.ts` and `src/services/offlineService.ts`).
- AsyncStorage keys used by offline code: `@fims_offline_inspections`, `@fims_offline_photos`, `@fims_pending_sync`. Use these keys when reading/writing offline data.
- DB table names used across services: `fims_inspections`, `fims_categories`, `fims_inspection_photos`. Keep names exact when calling Supabase.

## Examples (copy these usages to preserve behavior)
- Creating an inspection when offline (in `fimsService.createInspection`):
  - Generates an id like `offline_<timestamp>_<rand>` and stores `OfflineInspection` with `photos: []` and `created_at`.
- Online upload flow (in `fimsService.uploadPhoto`):
  - `supabase.storage.from('field-visit-images').upload(filePath, blob)` then `getPublicUrl(filePath)` then insert into `fims_inspection_photos`.

## Integration / environment notes
- Supabase config is in `src/services/supabase.ts`. This repo currently contains a Supabase URL & anon key in plaintext — handle with care. `isSupabaseConfigured` is used as a gate throughout services.
- There are no explicit unit tests in the repo; use the Expo dev client / emulator to exercise flows, especially offline sync. To reproduce sync issues: create offline inspections (toggle network) then call `offlineService.syncOfflineData()`.

## Developer workflows (how you, the AI, should behave)
- When changing DB-related code, update both `fimsService` and `offlineService` mappings. Search for table/column names: `fims_inspections`, `latitude`, `longitude`, `address`, `fims_inspection_photos`.
- Preserve existing storage bucket names unless you update every usage (`fimsService` vs `offlineService`). Point out bucket mismatches in PR notes.
- Use TypeScript types from `src/types/` when adding new functions or changing payloads. Prefer adding to `src/types/index.ts` instead of ad-hoc `any` where possible.

## Where to look for changes or bugs
- Offline/online sync bugs: `src/services/offlineService.ts` and `src/services/fimsService.ts` (mappings + sync loops).
- Photo problems: `fimsService.uploadPhoto()` and the upload logic in `offlineService.syncOfflineData()` (different bucket and insert fields).
- Authentication/session issues: `supabase.ts` (client creation and `auth` settings using `AsyncStorage`).

## PR / commit behavior for AI-generated changes
- Keep changes minimal and focused. If you change DB column names or storage buckets, include migration notes and list all files touched in the PR description.
- Add tests only if small, scoped, and runnable via the Expo environment. Otherwise, document manual verification steps.

---
If anything here is incomplete or you want more detail (for example: exact mapping tables, sample API rows, or run/debugging steps for offline sync), tell me which area and I will expand or adjust the file.
