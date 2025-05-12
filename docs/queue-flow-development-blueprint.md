
# QUEUE FLOW – Development Blueprint

> Consolidated blueprint plus compliance requirements from Broward County
> RFI TRN2130226F1.  
> Status legend: 🟢 Done │ 🟡 Planned │ 🔴 New

## 1  Front‑End (React + Vite)

| Feature | Status | Implementation Tasks |
|---------|--------|----------------------|
| Global theming (Tailwind + shadcn‑ui) | 🟡 | Finalize color palette, fonts |
| Routing & Views (Auth, Customer, Staff, Admin) | 🟡 | Add React‑Router v6 & guards |
| State management (Contexts & hooks) | 🟡 | Replace prop drilling with Context |
| Admin Dashboard | 🟡 | CRUD + live metrics |
| Customer Kiosk | 🟡 | Form validation + live status |
| Accessibility & i18n | 🔴 | **Must support English, Spanish, Haitian Creole, Portuguese (R 4.1.d)**; **ADA‑compliant kiosk flows (R 4.1.ff)** |
| Testing (Vitest / RTL / Playwright) | 🔴 | Add unit + e2e tests |

## 2  Back‑End (Edge Functions)

| Feature | Status | Implementation Tasks |
|---------|--------|----------------------|
| Supabase Auth | 🟡 | Email+Password now; add Google OAuth later |
| Realtime queue updates | 🟡 | DB triggers → client subs |
| Appointments API | 🔴 | POST/GET/PATCH endpoints (covers R 3.1–3.6) |
| Admin Stats API | 🔴 | Aggregated KPIs (covers R 3.7, 4.1.h) |
| SMS Reply API `/sms/reply` | 🔴 | Staff replies to customers (R 4.1.p) |
| Surveys API `/surveys` | 🔴 | Post‑service surveys (R 4.1.n) |

## 3  Database (Postgres / Supabase)

* Tables: customers, staff, locations, services, appointments, service_wait_times  
* RLS: customers self‑scope, staff by location, admin bypass  
* Triggers: update_service_wait_times(), notify_queue()

## 4  Compliance Requirements (RFI TRN2130226F1)

| ID | Requirement | Status | Owner |
|----|-------------|--------|-------|
| 3.1 | Online booking – schedule/cancel/change remotely or onsite | 🟡 | |
| 3.2 | Real‑time queue updates | 🟡 | |
| 3.3 | Appointment reminders | 🔴 | |
| 3.4 | Virtual waiting room | 🔴 | |
| 3.5 | Digital check‑in w/ staff alert | 🟡 | |
| 3.6 | Staff tools – reschedule/call/manage msgs | 🟡 | |
| 3.7 | BI integration (direct/API) | 🔴 | |
| 4.1.a | Staff create/modify queues w/o vendor | 🟡 | |
| 4.1.b | Customer can book multiple appointments with same identifier | 🟡 | |
| 4.1.c | Wait time starts only after check‑in | 🟡 | |
| 4.1.d | Queues & instructions in English, Spanish, Haitian Creole, Portuguese | 🟡 | |
| 4.1.e | Booking via mobile app or computer | 🟡 | |
| 4.1.f | Staff can review past customer visits | 🟡 | |
| 4.1.g | Staff can close a queue >30 days in advance | 🟡 | |
| 4.1.h | Management reports: wait time, service length, customer counts by period & queue | 🟡 | |
| 4.1.i | Custom data fields, roles, permissions, workflows | 🟡 | |
| 4.1.j | Email notifications to staff & customers (with links) | 🟡 | |
| 4.1.k | Role‑based system access | 🟡 | |
| 4.1.l | Highest security standards & safeguards | 🟡 | |
| 4.1.m | High messaging character limit (>500) | 🟡 | |
| 4.1.n | Customer surveys | 🟡 | |
| 4.1.o | Queue admins can edit names, messages, wait times | 🟡 | |
| 4.1.p | User‑to‑user SMS; staff replies to customers | 🟡 | |
| 4.1.q | Free‑form notes field for reason of visit (e.g., case #) | 🟡 | |
| 4.1.r | Match employee schedules to service availability | 🟡 | |
| 4.1.s | Limit availability of specific services | 🟡 | |
| 4.1.t | Link services to specific locations & time blocks | 🟡 | |
| 4.1.u | Preview customer view at different times of day | 🟡 | |
| 4.1.v | Pause new appointments while finishing current ones, auto‑resume | 🟡 | |
| 4.1.w | Support multiple sections with different staffing/hrs | 🟡 | |
| 4.1.x | Summon/work on more than one person at a time | 🟡 | |
| 4.1.y | One staffer can manage 30+ simultaneous appointments (e.g., computer stations) | 🟡 | |
| 4.1.z | Break status: reassign active customers to other staff | 🟡 | |
| 4.1.aa | Cross‑location booking/servicing without re‑login | 🟡 | |
| 4.1.bb | Kiosk modes: make appointments *or* check‑in only | 🟡 | |
| 4.1.cc | Multi‑data split‑screen display (≥3 sets) | 🟡 | |
| 4.1.dd | Staff can book an appointment for a customer while serving another | 🟡 | |
| 4.1.ee | Integrate queuing with intercom system | 🟡 | |
| 4.1.ff | ADA‑supporting functionality | 🟡 | |

## 5  Milestone Plan (8 weeks)

| Week | Deliverables |
|------|--------------|
| 1‑2 | DB migrations, RLS, seed data |
| 3‑4 | Core APIs + Auth helper |
| 5   | Staff & Customer UIs live |
| 6   | Admin dashboard + reports |
| 7   | Accessibility, i18n, tests |
| 8   | UAT, prod deploy |

## Definition of Done

* All tests green  
* Lighthouse ≥ 90/90/95/100  
* No console errors  
* Supabase error rate <1% over 24 h
