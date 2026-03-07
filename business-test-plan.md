# Sprint Test Plan (API Business Requirements)

## 1. Scope każdego pliku

### req-011-user-profile

- GET profilu zalogowanego usera
- PUT update profilu + re-read i porównanie zmian
- PUT password happy path
- PUT password z błędnym starym hasłem (negative)
- POST deactivate (na końcu testu lub osobny scenariusz)

### req-007-funds

- GET funds (stan początkowy)
- PUT funds z poprawną kwotą
- GET funds po update (musi się zmienić)
- GET funds history (musi pojawić się wpis)
- PUT funds dla wartości spoza zakresu (negative)

### req-019-public-profile

- GET public profile bez tokena
- Weryfikacja, że pola publiczne są dostępne
- Weryfikacja, że pola wrażliwe nie są zwracane

### req-003-progress

- GET progress przed akcją
- Complete lesson
- GET progress po akcji (wzrost albo zmiana completion)
- Ponowne logowanie i GET progress (persistencja)

### req-017-demo-preview

- GET preview bez logowania
- GET full lesson content bez logowania (oczekiwane ograniczenie)
- Porównanie zakresu danych preview vs full content

## 2. Definicja Done dla każdego pliku

- Minimum 3 testy w pliku.
- Co najmniej 1 test pozytywny i 1 negatywny.
- Każdy test łączy minimum 2 endpointy albo ma wyraźny before/after.
- Brak zależności test-test (idempotencja).
- Czytelne nazwy testów z prefixem REQ-xxx.

## 3. Standard techniczny

- beforeEach z restore DB dla testów modyfikujących stan.
- Jeden helper logowania jako standard (`loginAndGetUser`).
- Asercje domenowe, nie tylko status.
- Każdy test kończy się walidacją skutku biznesowego.

## 4. Rytm pracy

1. Napisz 1 plik.
2. Uruchom tylko ten plik.
3. Popraw do zielonego.
4. Dopiero przejdź do kolejnego.

Polecenie per plik:

```
npx playwright test tests/api/business/<nazwa-pliku>.spec.ts --project=api
```

## 5. Checkpointy mentoringowe

- Czy test wykryłby regresję biznesową, czy tylko błąd status code?
- Czy można go uruchomić 5 razy z rzędu bez flaky?
- Czy nowa osoba z zespołu zrozumie „co biznesowo chroni ten test"?
