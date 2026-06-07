# Khabi Delivery — Carnet de bord développeur

> État du projet et travail restant pour rendre l'application **utilisable de bout en bout sur mocks** (sans backend réel). Mis à jour le 2026-06-07.

---

## 1. Correctif critique appliqué — crash GPS sur APK

### Symptôme
Sur l'APK compilé, après que l'utilisateur clique sur « Autoriser » ou « Plus tard » sur l'écran `gps-permission`, l'application crashait et se fermait instantanément. Le bug n'était pas reproductible en dev (Expo Go / dev-client).

### Cause racine
Trois facteurs combinés :

1. **`expo-location` n'était pas déclaré comme plugin** dans `app.json`. Sur un build de production (`eas build` ou `expo run:android`), les modules natifs doivent être enregistrés via leur config plugin pour générer correctement les Info.plist / strings.xml.
2. **Le composant `<KhabiMap />` (rendu juste après la navigation post-permission, sur `(client-tabs)/home` et `(driver-tabs)/dashboard`) utilisait `showsUserLocation` sur `<MapView>`**. Cette prop force Android à instancier immédiatement le `LocationManager` natif ; sans Google Maps API key déclarée et sans plugin location enregistré, cela provoque une `UnsatisfiedLinkError` qui tue le process.
3. **`await import("expo-location")`** (import ESM dynamique) est instable sous Hermes en release — quand le module ne se résout pas, la promesse rejette en dehors du try/catch et remonte non gérée.

### Corrections appliquées
- `app.json` :
  - Ajout du plugin `expo-location` avec message de permission FR et désactivation explicite du background location.
  - Ajout de `android.permissions` (`ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`) en redondance.
- `components/KhabiMap.tsx` :
  - Chargement de `react-native-maps` via `require()` (résolution synchrone, stable sous Hermes).
  - **Suppression de `showsUserLocation`** — la carte affiche désormais une région fixe ; on activera cette prop plus tard quand on aura besoin de la vraie position et qu'on aura ajouté une clé Google Maps.
  - Ajout d'un `MapErrorBoundary` qui retombe sur le placeholder web si le composant natif crash au mount.
- `app/gps-permission.tsx` :
  - Remplacement de `await import()` par `require()`.
  - Ajout d'un `isProcessingRef` pour empêcher les double-taps.
  - Haptics enveloppé dans try/catch (peut throw sur certains Android).
  - Navigation déférée via `InteractionManager.runAfterInteractions` pour laisser la modal de permission se fermer proprement avant de naviguer (cause classique de crash sur Android).

### Étapes pour rebuild
Le dossier `android/` est commité (prebuild figé), donc :
```
npx expo prebuild --clean
eas build --platform android --profile preview
```
ou pour un test local rapide :
```
npx expo run:android --variant release
```

---

## 2. État actuel du projet

### Architecture
- **Stack** : Expo SDK 54, expo-router v6, React 19, Hermes, new architecture activée.
- **State** : `@nkzw/create-context-hook` + `@tanstack/react-query` + AsyncStorage pour la persistance.
- **Données** : 100 % mocks (`mocks/auth.ts`, `mocks/products.ts`, `mocks/orders.ts`, `mocks/payments.ts`, `mocks/services.ts`).

### Ce qui fonctionne aujourd'hui
| Domaine | État |
| --- | --- |
| Splash + routing initial (`app/index.tsx`) | OK |
| Onboarding 2 slides | OK |
| Sélection rôle client / livreur | OK |
| Login téléphone + OTP mock | OK (credentials : `810000001 / 1234` client, `810000002 / 5678` livreur) |
| Permission GPS | **Corrigée** — voir §1 |
| Tabs client : Accueil / Commandes / Profil | OK |
| Tabs livreur : Dashboard / Revenus / Profil | OK |
| Catalogue produits, panier, checkout | OK |
| Flow paiement (méthode → processing → succès/échec → reçu) | OK |
| Envoi de colis (`create-parcel`) | OK |
| Persistance panier + auth via AsyncStorage | OK |

### Ce qui manque ou est incomplet
Voir §3 ci-dessous.

---

## 3. Travail restant pour un MVP démontrable sur mocks

### 3.1 — Localisation (priorité haute)

- [ ] **Récupérer et stocker la position courante** : créer un `LocationProvider` qui appelle `Location.getCurrentPositionAsync()` au démarrage (si permission accordée), met à jour un state global et tombe sur `DEFAULT_LOCATION` sinon.
- [ ] **Brancher `KhabiMap`** sur cette position au lieu de `DEFAULT_LOCATION` (Kinshasa) pour le marker principal.
- [ ] **Mock du tracking livreur** : simuler le mouvement du livreur sur la carte pendant qu'une commande est `in_transit` (interpoler entre `pickupAddress` et `deliveryAddress` toutes les ~3 s). Affichage dans `app/(client-tabs)/orders/[orderId].tsx`.
- [ ] **Réactiver `showsUserLocation`** une fois qu'on aura :
  - soit ajouté une clé Google Maps dans `app.json` (`android.config.googleMaps.apiKey`),
  - soit basculé sur `provider={PROVIDER_DEFAULT}` (carte Android stock, pas besoin de clé) avec test en release.
- [ ] **Géocodage inverse mock** sur la saisie d'adresse (faux résultats à partir de quelques quartiers de Kinshasa).

### 3.2 — Recherche & catalogue

- [ ] La barre de recherche sur `home/index.tsx` est purement décorative — implémenter une vraie modal de recherche avec filtrage local sur `MOCK_PRODUCTS`.
- [ ] Filtres par catégorie sur le catalogue (`catalogue.tsx`) — actuellement seulement le filtre par `serviceId`.
- [ ] Tri (prix croissant / décroissant / popularité mock).
- [ ] État "produit indisponible" (`available: false`) déjà dans le type mais non géré visuellement.

### 3.3 — Commandes & temps réel

- [ ] **Progression automatique du statut** d'une commande après création : `pending → confirmed → preparing → pickup_ready → in_transit → delivered` avec timers mockés (par ex. 10 s entre chaque étape). Actuellement la commande reste sur son statut initial.
- [ ] **Notifications locales** (`expo-notifications` à installer) à chaque changement de statut.
- [ ] **PIN de livraison** (`deliveryPin` dans le type Order/Mission) : afficher au client, vérifier côté livreur dans `(driver-tabs)/dashboard/validate.tsx`.
- [ ] **Annulation client** d'une commande tant que statut ∈ `{pending, confirmed}`.
- [ ] **Chat / appel** client ↔ livreur : boutons présents mais sans action — au minimum déclencher `Linking.openURL('tel:...')`.

### 3.4 — Côté livreur

- [ ] **Acceptation de mission** : actuellement `acceptMission` change juste le statut. Ajouter un timer (15 s) sur la mission en attente avant qu'elle disparaisse automatiquement (refus implicite).
- [ ] **Mode en ligne / hors ligne** sur le dashboard livreur (toggle qui filtre les missions reçues).
- [ ] **Validation de livraison** (`validate.tsx`) : flow complet PIN → marquer `delivered` → ajouter aux gains.
- [ ] **Historique des missions** : déjà dans `completedMissions` mais pas listé sur l'écran Revenus.
- [ ] **Statistiques Revenus** : graphique jour/semaine/mois (données mockées).

### 3.5 — Paiement

- [ ] **Sauvegarde des méthodes de paiement** : numéro M-Pesa / Airtel / Orange par défaut, stocké en AsyncStorage.
- [ ] **Reçu PDF** : `expo-print` et `expo-sharing` sont déjà installés, brancher sur `receipt.tsx` (bouton « Télécharger ») pour générer un PDF mock.
- [ ] **Historique des transactions** dans le profil.

### 3.6 — Profil utilisateur

Menus présents dans `(client-tabs)/profile/index.tsx` mais non implémentés :
- [ ] **Mes adresses** : CRUD local (AsyncStorage) — domicile, bureau, autres.
- [ ] **Moyens de paiement** : voir §3.5.
- [ ] **Paramètres** : langue (FR/EN/Lingala/Swahili ?), thème (light/dark — `useColorScheme` déjà câblé), notifications.
- [ ] **Aide & Support** : FAQ statique + bouton WhatsApp (`Linking`).
- [ ] **Édition du profil** : photo (expo-image-picker déjà installé), nom, téléphone.

### 3.7 — Notifications & UX

- [ ] **expo-notifications** : permissions au premier launch (après GPS), notifs locales pour : nouvelle mission (livreur), changement de statut (client), promo.
- [ ] **Badge sur l'icône Commandes** (tab bar) quand commande active.
- [ ] **Empty states** uniformisés : commandes vides, panier vide, historique vide — illustration + CTA.
- [ ] **Loader / skeleton** sur les écrans qui hydratent depuis AsyncStorage (actuellement flash de contenu vide).
- [ ] **Gestion d'erreur globale** : ErrorBoundary racine dans `app/_layout.tsx` pour récupérer les crashs JS proprement.
- [ ] **Internationalisation** : tous les textes sont en français en dur. À extraire dans un `i18n` (au minimum FR/EN) — `expo-localization` à ajouter.

### 3.8 — Auth (mocks)

- [ ] **Inscription** : actuellement seul le login OTP avec utilisateurs préexistants fonctionne. Ajouter un flux `register` qui ajoute un user au mock store en mémoire (perdu au redémarrage, c'est OK pour MVP).
- [ ] **Renvoi du code OTP** (bouton « Renvoyer » sur `otp.tsx`).
- [ ] **Détection automatique du rôle** (si on tape un numéro client connu, ne pas demander le rôle).
- [ ] **Session expiry mock** : invalider le user après X jours d'inactivité.

### 3.9 — Performance & qualité

- [ ] **Vérification TypeScript stricte** : il y a beaucoup de `as any` sur les `router.replace` — typer correctement les routes avec `typedRoutes` (déjà activé dans `app.json`).
- [ ] **Lint** : `npm run lint` à exécuter et corriger.
- [ ] **Tests** : aucun test n'est présent. Ajouter au minimum quelques tests de logique pure (providers, reducers).
- [ ] **Assets** : `iconn.jpg` utilisé partout — vérifier l'icône adaptive sur Android 13+ (foreground vs background vs monochrome).

### 3.10 — Préparation backend (hors mocks, pour mémoire)

À considérer après le MVP mocks validé :
- API REST ou tRPC (`@tanstack/react-query` déjà branché).
- WebSocket / SSE pour le tracking temps réel.
- Auth : Firebase Phone Auth ou un OTP provider (Twilio, Africa's Talking).
- Paiements : intégrations M-Pesa, Airtel Money, Orange Money (RDC).
- Stockage : Supabase ou Firebase pour la phase 1.

---

## 4. Conventions & rappels

- **Mocks d'abord** : ne jamais introduire d'appel réseau réel tant que le flow correspondant n'est pas validé en mocks.
- **AsyncStorage** : préfixe `khabi_` pour toutes les clés.
- **Logs** : préfixe `[ModuleName]` (ex. `[AuthProvider]`, `[Cart]`) — utile pour filtrer dans `adb logcat`.
- **Navigation** : `router.replace` pour les changements de section (post-auth, post-GPS), `router.push` pour la navigation linéaire.
- **Couleurs** : toujours via `theme` (`constants/theme.ts`) — ne pas hardcoder.

---

## 5. Commandes utiles

```bash
# Dev (Expo Go limité — utilise expo-dev-client)
npx expo start --dev-client

# Build APK local pour tester en release
npx expo run:android --variant release

# Build EAS (recommandé)
eas build --platform android --profile preview

# Reset complet (utile si crash inexpliqué)
npx expo prebuild --clean
rm -rf node_modules && npm install
```
