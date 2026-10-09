# Strategize materials - 9 October 2026

Strategize (module 01) now uses six records in Supabase `public.module_materials` and the private `module-materials` Storage bucket. Other modules keep their previous sources.

Order: 01 AI Readiness; 02 Token - Data x Biaya; 03 AI Usecase; 04 Responsible AI; 05 Claude - Thinking; 06 Materi Visual Strategize.

The sixth file is a nine-page PDF containing Images 1-9 in numeric order. Images retain their original pixel dimensions and aspect ratios. PDF size: 9,032,836 bytes, below the existing 10 MiB per-file limit.

The first HTML was saved from a browser and referenced a missing local font stylesheet and telemetry script. The upload copy uses the matching Google Fonts families and removes the broken telemetry reference. The original desktop file is unchanged.

## Data change

Before import, module 01 had zero rows in `module_materials`. Six new records were inserted using the accompanying SQL, with sequential creation timestamps for existing catalog ordering. No schema, policies, participant records, or progress history were modified. Each new material has a new remote progress identity.

File paths, IDs, hashes, and byte lengths are recorded in the manifest. Uploads were downloaded again and their SHA-256 hashes checked against the prepared sources. Do not put signed URLs, access tokens, or participant data in this document.

## Recovery

Original built-in HTML source files remain in the repository; the old catalog is available at commit `c092da1`. Restore that frontend version and, only after authorization to roll back, run the scoped rollback SQL to remove the six import IDs. Uploaded files can remain in Storage; no file deletion is required. Other modules and participant data are unaffected.

## Verification

TypeScript and production build passed. Localhost synthetic checks confirmed all six ordered titles, no old Strategize built-ins, and all five HTML files rendered without JavaScript errors. All nine PDF pages were rendered and visually inspected. Role policies and the existing private-bucket configuration were retained.
