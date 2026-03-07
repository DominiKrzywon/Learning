# Refactor Plan - API learning w oparciu o business requirements

## Cel zmiany

Przestawiamy nauke z "duzo podobnych testow endpointowych" na "scenariusze biznesowe API".
UI i frontowe checklisty pomijamy, chyba ze maja bezposredni odpowiednik endpointu.

## Decyzja architektoniczna

- Obecne testy zostaja, ale traktujemy je jako `API CRUD smoke`.
- Nowe testy piszemy jako `Business API scenarios` mapowane do REQ-001..REQ-021.
- Jeden scenariusz = kilka endpointow + asercja efektu biznesowego, nie tylko status code.

## Docelowa organizacja testow

Proponowana struktura (etapami, bez ryzykownego big-bang):

1. Etap A - porzadkowanie obecnych testow

- Zostawic aktualne pliki bez zmian funkcjonalnych
- Oznaczyc je jako CRUD/smoke w nazwach `describe`
- Opcjonalnie skonsolidowac do `tests/api/api-crud.spec.ts` lub `tests/api/crud/*.spec.ts`

2. Etap B - nowa warstwa biznesowa

- `tests/api/business/req-001-auth.spec.ts`
- `tests/api/business/req-002-enrollment.spec.ts`
- `tests/api/business/req-003-progress.spec.ts`
- `tests/api/business/req-011-user-profile.spec.ts`
- `tests/api/business/req-017-demo-preview.spec.ts`
- `tests/api/business/req-019-public-profile.spec.ts`

3. Etap C - rozszerzenia

- `req-005-assessment`, `req-006-certificate`, `req-013-instructor`, `req-015-rating`
- backlog: `req-018`, `req-021` (po doprecyzowaniu danych i API)

## Co bierzemy z business-requirements (API-fit)

Wysoki fit do API testow:

- REQ-001, REQ-002, REQ-003, REQ-005, REQ-006, REQ-007 (u nas jako funds), REQ-011, REQ-013, REQ-014, REQ-015, REQ-017, REQ-018, REQ-019, REQ-021

Niski fit do API-only (nie priorytetyzujemy teraz):

- REQ-010 Mobile Responsiveness
- REQ-016 Accessibility
- Czesc REQ-020 zwiazana z UX pobierania plikow

## Definicja "dobrego" testu biznesowego

Kazdy nowy test powinien:

- laczyc minimum 2 endpointy
- sprawdzac stan przed i po operacji
- miec asercje domenowe (np. progress wzrosl, funds history zawiera wpis)
- byc idempotentny (restore DB lub nowy user z factory)
- miec w nazwie REQ-ID

## Plan wdrozenia (2 sprinty)

Sprint 1 (teraz):

1. Utrzymac obecne testy jako smoke/CRUD
2. Napisac scenariusze biznesowe: REQ-011 + REQ-007 + REQ-019
3. Dodac scenariusz REQ-003 (progress persistence)
4. Uspojnic helpery auth (`loginAndGetUser` jako standard)

Sprint 2:

1. Dodac REQ-017 + REQ-005 + REQ-006
2. Dodac REQ-013 (instructor role)
3. Dodac REQ-014 i REQ-015
4. Zweryfikowac backlog REQ-018 i REQ-021

## Minimalny backlog techniczny wspierajacy nowe podejscie

- Unifikacja helperow logowania (usuniecie niespojnosci `loginAsUser` vs `loginAndGetUser`)
- Stabilne setup/teardown (`/api/learning/system/restore` dla testow modyfikujacych stan)
- Ewentualny helper scenariuszowy: `createLoginAndReturnUserContext`
- Raportowanie tagami: `@crud`, `@business`, `@req-011`

## Metryka progresu nauki

Nie liczymy liczby endpointow. Liczymy:

- ile REQ pokrytych scenariuszami API
- ile testow wykrywa regresje biznesowe (a nie tylko status code)
- ile scenariuszy jest powtarzalnych lokalnie i w CI
