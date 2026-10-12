# MUC PRO SUITE — Notification Architecture

**Classification:** NEEDS DECISION for external delivery; READY for transactional in-app notification design.

## Design

Domain services create notification intent/outbox records inside their own successful transaction. A worker later resolves/delivers external messages and updates per-recipient `notification_delivery`. This makes notification creation reliable without coupling a finance, attendance or result transaction to an email/SMS/push outage.

No standalone queue is justified at this audit stage. Start with a PostgreSQL transactional outbox plus a single scheduled worker/process using locking and retries. Introduce a dedicated queue only when measured throughput, retry isolation, multiple workers, or provider rate limits make it necessary. The worker hosting/scheduler is a decision-required deployment concern.

## Required triggers

| Source event | Audience | Timing |
| --- | --- | --- |
| Fee assessment / overdue | affected student; finance operators as policy requires | Outbox after posting; scheduled overdue scan |
| Attendance shortage/condonation/redo | affected student; authorized attendance staff | After locked/recalculated threshold crossing |
| Library overdue / reservation available | member; library staff as appropriate | Scheduled due-date scan / loan return event |
| Placement drive publish, eligibility, deadline, shortlist, schedule, result, offer | targeted eligible/affected registered students | Publish/status transaction then outbox |
| Certificate approval/rejection/issue/revoke | requester | Certificate workflow transaction then outbox |
| Event publication, registration change, schedule change | eligible/registered participants | Event transaction then outbox |

## Targeting and delivery

Normalize targets and recipient deliveries; never rely on raw `targetIds` arrays as the authoritative audience. Resolve audience from current eligible relationships at publication time, record recipient-level deliveries, and retain history. In-app delivery is the first channel. Email, SMS and push may be added behind a `NotificationDeliveryPort` after providers/templates/consent/opt-out requirements are chosen.

At-least-once delivery is expected. Provider sends require idempotency keys and delivery attempt records. A message can be `PUBLISHED` even when individual external deliveries are retrying/failed; reporting must distinguish the states.
