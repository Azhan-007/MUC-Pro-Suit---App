# MUC PRO SUITE — File Storage and Backup Architecture

**Classification:** NEEDS DECISION — no file-storage provider or backup implementation exists.

## Locked abstraction

Application modules depend on a `StoragePort` with create-upload-intent, complete-upload, authorized-download, delete/archive and integrity-check operations. A provider adapter is selected later; no business service hard-codes an S3, disk, Dropbox, or other provider SDK.

PostgreSQL stores `stored_file` metadata: UUID, provider/key, original filename, safe display name, MIME type, byte length, hash, uploader, created timestamp, classification, owner/source relationship, scan status, archive/deletion status. Binary objects live in the provider, never as application-database blobs by default.

## File classes and access

| Class | Owner/origin | Read access | Notes |
| --- | --- | --- | --- |
| Profile image | student/faculty | owner and policy-authorized institutional viewers | Size/type limits and replacement history policy |
| Certificate PDF | certificate document | requester and Certificate/Master Admin scope | Immutable rendition/snapshot; revoked files are not public |
| Placement resume/certification | placement profile | owner and Placement/Master Admin scope | Sensitive; signed short-lived downloads only |
| Event attachment | event | eligible audience and authorized event staff | Virus scan prior to publication |
| Study material/assignment evidence | future Faculty→Student module | authorized class participants/author | Out of backend implementation scope until requirements are locked |
| Backup archive | platform | Super Admin/recovery operator only | Separate credentials/location from ordinary user files |

## Controls

- Validate declared/inspected MIME type, size, extension policy, SHA-256 hash and owner authorization; mark `PENDING_SCAN` until scanning completes.
- Generate uploads/downloads with short-lived signed URLs or proxy through an authorization-checking Fastify route. Never make placement/certificate buckets publicly listable.
- Use opaque UUID-based keys; do not trust user filename as a path. Log metadata/actions, never file contents.
- Database backups are operational artifacts, not `BackupRecord` mock rows alone: encrypt, checksum, restrict access, test restore, and document retention/RPO/RTO after provider decision.
- **Decision required:** object-storage provider, region/residency, malware scanning, encryption-key ownership, retention/versioning and backup operating model.
