# digdir-wallet-messaging-backend

Backend som lagrer meldinger (issuer + tittel + body + lenke) og varsler EUDI wallet-appen
om dem via en silent APNs-push. Appen våkner av pushen og henter meldingene selv via `GET /api/messages`.

> **Slektning:** se `DC-26-Innboks-server` (fra `digdir-camp-wallet-ios-app`-repoet) for en
> nyere, sikkerhetsfokusert variant med PID-binding og ende-til-ende-kryptering av selve
> meldingsinnholdet — den har absorbert APNs-push-logikken herfra (se dens README under
> "Relationship to digdir-wallet-messaging-backend"). Dette repoet er den enklere, opprinnelige
> prototypen: ingen brukerbinding, ingen kryptering, kringkaster til alle registrerte enheter.

## Oppsett

1. `npm install`
2. Kopier `.env.example` til `.env` og fyll inn:
   - `APNS_KEY_PATH` — sti til `.p8`-filen du lastet ned fra Apple Developer-portalen (legg den i `secrets/`, den er gitignored)
   - `APNS_KEY_ID` og `APNS_TEAM_ID` — fra samme side i portalen
   - `APNS_BUNDLE_ID` — bundle-ID-en til wallet-appen (`net.eidas2sandkasse.demo-lommebok.dev` for Demo-builden)
   - `APNS_ENVIRONMENT` — `development` så lenge du tester med en dev-signert build
3. `npm run dev`

Serveren starter på `http://localhost:3000`. Helsesjekk: `GET /health`.

## Endepunkter

### `POST /api/devices`
Registrerer en device token (den appen får fra `didRegisterForRemoteNotificationsWithDeviceToken`).

```json
{ "deviceToken": "a1b2c3..." }
```

### `POST /api/messages`
Lagrer en melding og sender en silent push til alle registrerte devices.

```json
{
  "issuerName": "Skatteetaten",
  "title": "Skattekortet ditt er klart",
  "body": "En arbeidsgiver har bedt om skattekortet ditt.",
  "actionUrl": "https://www.skatteetaten.no/person/"
}
```

### `GET /api/messages?since=<ISO8601>`
Henter meldinger, eventuelt kun de nyere enn `since`. Dette er endepunktet appen kaller
fra `fetchNewMessages()` i `AppDelegate.swift` når den våkner av en push.

## Kjente begrensninger (v1 — bevisst holdt enkelt)

- **Ingen brukerautentisering eller per-bruker-targeting.** Alle meldinger sendes til alle
  registrerte devices. Før dette er noe annet enn en demo må dere koble device tokens til
  en bruker/utsteder-relasjon.
- **SQLite, ingen migrasjoner.** Fint for utvikling, bytt til en ordentlig database (Postgres
  e.l.) før produksjon.
- **Ingen autentisering på `POST /api/messages`.** Hvem som helst som finner URL-en kan i
  dag legge inn meldinger og trigge push. Legg til en API-nøkkel/auth før dette eksponeres
  utenfor lokal testing.

## Teste hele kjeden

1. Start backend (`npm run dev`)
2. Kjør wallet-appen, la den registrere device token (se Xcode-konsollen, eller legg til en
   midlertidig `print(token)` i `didRegisterForRemoteNotificationsWithDeviceToken`)
3. `curl -X POST http://localhost:3000/api/devices -H "Content-Type: application/json" -d '{"deviceToken":"<token>"}'`
4. `curl -X POST http://localhost:3000/api/messages -H "Content-Type: application/json" -d '{"issuerName":"Skatteetaten","title":"Test","body":"Dette er en testmelding"}'`
5. Appen skal våkne (krever fysisk enhet — silent push fungerer ikke pålitelig i Simulator)
