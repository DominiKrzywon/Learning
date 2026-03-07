# Cases API - nowe podejscie (biznesowe, bez UI)

## 1) Co juz mamy ( CRUD/smoke)

Te testy zostaja jako baza regresji technicznej. Docelowo mozna je zgrupowac do `api-crud`.

- Authentication: login, login negative, register, status auth
- Courses: list, details, ratings, progress
- Enrollments: enroll, unauthorized, duplicate enroll, own/other user access
- Lessons: list, titles, preview, content, complete
- Certificates: user certificates, public certificate, generate flow

## 2) Business requirements -> API cases (z `business-requirements.html`)

Legenda statusu:

- `P0` - robimy teraz
- `P1` - kolejny etap
- `P2` - backlog/po doprecyzowaniu API

### REQ-001 User Registration and Authentication (P0)

- Rejestracja: walidacja email i wymaganej sily hasla
- Logowanie: poprawne dane vs bledne dane
- Status sesji i wylogowanie
- Endpointy:
  `POST /api/learning/auth/register`,
  `POST /api/learning/auth/login`,
  `GET /api/learning/auth/status`,
  `POST /api/learning/auth/logout`

### REQ-002 Course Enrollment System (P0)

- Browse katalogu kursow
- Enroll i potwierdzenie zapisu
- Dostep do kursu po enroll
- Endpointy:
  `GET /api/learning/courses`,
  `POST /api/learning/courses/{courseId}/enroll`,
  `GET /api/learning/courses/{courseId}/lessons`,
  `GET /api/learning/users/{userId}/enrollments`

### REQ-003 Progress Tracking (P0)

- Poprawnosc wyliczania progressu
- Zmiana statusu po `lesson complete`
- Trwalosc progressu po ponownym logowaniu
- Endpointy:
  `GET /api/learning/courses/{courseId}/progress`,
  `POST /api/learning/courses/{courseId}/lessons/{lessonId}/complete`

### REQ-005 Assessment System (P1)

- Wysylka quizu i automatyczna ocena
- Walidacja feedbacku po quizie
- Endpointy:
  `POST /api/learning/courses/{courseId}/lessons/{lessonId}/quiz`

### REQ-006 Certificate Generation (P1)

- Trigger generowania certyfikatu po ukonczeniu
- Publiczna walidacja certyfikatu
- Endpointy:
  `POST /api/learning/courses/{courseId}/certificate`,
  `GET /api/learning/users/{userId}/certificates`,
  `GET /api/learning/public/certificates/{uuid}`

### REQ-007 Payment Processing -> mapujemy na Funds (P0)

- Saldo przed i po doladowaniu
- Historia transakcji
- Odrzucenie kwoty poza zakresem
- Endpointy:
  `GET /api/learning/users/{userId}/funds`,
  `PUT /api/learning/users/{userId}/funds`,
  `GET /api/learning/users/{userId}/funds/history`

### REQ-011 User Profile Management (P0)

- Odczyt i aktualizacja profilu
- Zmiana hasla (happy path + bledne obecne haslo)
- Dezaktywacja konta
- Endpointy:
  `GET /api/learning/users/{userId}`,
  `PUT /api/learning/users/{userId}/profile`,
  `PUT /api/learning/users/{userId}/password`,
  `POST /api/learning/users/{userId}/deactivate`

### REQ-013 Instructor Dashboard (P1)

- Tworzenie i edycja kursu/lekcji jako instruktor
- Statystyki/analityka instruktora
- Endpointy:
  `GET /api/learning/instructor/stats`,
  `GET /api/learning/instructor/analytics`,
  `POST /api/learning/instructor/courses`,
  `POST /api/learning/courses/{courseId}/lessons`

### REQ-014 Search and Filtering (P1)

- Search endpoint: aktualne zachowanie vs oczekiwane
- Filtrowanie po tagach i sortowanie (jesli wspierane)
- Endpointy:
  `GET /api/learning/courses/search`

### REQ-015 Rating and Feedback System (P1)

- Dodanie oceny i komentarza
- Widocznosc feedbacku w ratings
- Endpointy:
  `POST /api/learning/courses/{courseId}/rate`,
  `GET /api/learning/courses/{courseId}/ratings`

### REQ-017 Free Demo Preview (P0)

- Dostep do preview bez logowania
- Ograniczenie zakresu preview vs pelna tresc
- Endpointy:
  `GET /api/learning/courses/{courseId}/lessons/preview`,
  `GET /api/learning/courses/{courseId}/lessons/{lessonId}/content`

### REQ-018 Free Course Access (P2)

- Enroll na kurs free bez platnosci
- Ukonczenie free course + certyfikat
- Endpointy:
  `POST /api/learning/courses/{courseId}/enroll`,
  `POST /api/learning/courses/{courseId}/certificate`

### REQ-019 Public User Profile (P0)

- Publiczny profil dostepny bez logowania
- Brak danych wrazliwych
- Endpoint:
  `GET /api/learning/public/users/{userId}`

### REQ-021 Course Tags System (P2)

- Filtrowanie po tagach i kontrola widocznosci tagow
- Endpointy (do potwierdzenia):
  `GET /api/learning/courses`,
  `GET /api/learning/courses/search`

## 3) Poza zakresem API-only (nie robimy jako API testy)

- REQ-010 Mobile Responsiveness
- REQ-016 Accessibility Features (ARIA, keyboard, contrast)
- Czesc REQ-020 zwiazana z pobieraniem plikow przez UI, jesli brak dedykowanego endpointu download

## 4) Priorytet najblizszej iteracji

1. REQ-011 User Profile Management
2. REQ-007 Funds (payment-like flow)
3. REQ-003 Progress persistence
4. REQ-019 Public User Profile
5. REQ-017 Free Demo Preview
