# Kabi Delivery — TODO

> Tout ce qui reste à faire après les sprints documentés dans `dev.md` et `update.md`. Organisé par priorité. Cases à cocher pour suivre l'avancée.

---

## P0 — Bloquants Play Store / App Store

À régler **avant** la première soumission. Le rejet est quasi-certain sans ces éléments.

- [ ] **Politique de confidentialité publique** — héberger `https://kabi.app/privacy` (ou autre URL définitive) et la lier dans `app/settings.tsx`. Obligatoire pour toute app qui demande la permission de localisation et stocke des données utilisateur.
- [ ] **Conditions générales d'utilisation** — même chose pour `https://kabi.app/terms`.
- [ ] **Icône finale** — remplacer `assets/images/iconn.jpg` par un PNG **1024×1024** (stores) et un PNG carré (foreground) **432×432** pour l'adaptive icon Android. Le `.jpg` actuel passe mais sera pénalisé visuellement.
- [ ] **Captures d'écran** pour le listing — 4 à 8 screenshots téléphone (1080×1920 recommandé) montrant : splash, accueil, catalogue, suivi de commande, paiement, profil.
- [ ] **Description Play Store** courte (80 car.) + longue (4000 car.) en français et anglais.
- [ ] **Nettoyer les permissions Android inutiles** dans `android/app/src/main/AndroidManifest.xml` :
  - `RECORD_AUDIO` (jamais utilisé)
  - `SYSTEM_ALERT_WINDOW` (jamais utilisé)
  - `WRITE_EXTERNAL_STORAGE` / `READ_EXTERNAL_STORAGE` (à confirmer — peuvent être héritées de modules)
  Play Store demande une justification pour chaque permission sensible. Les retirer évite les questions.
- [ ] **Compte développeur Google Play** (25 USD à vie) + **certificat de signature** géré par EAS (ou keystore manuel).
- [ ] **Tester l'APK en release sur un vrai téléphone** avant submission. La permission GPS fix est validée en dev, à reconfirmer en release.

---

## P1 — Fonctionnalités importantes manquantes

Pas bloquant pour la soumission, mais l'app est moins crédible sans ces éléments.

### Localisation avancée
- [ ] **Tracking livreur animé sur la carte** : pendant qu'une commande est `in_transit`, simuler le déplacement du livreur sur la map de `orders/[orderId].tsx` en interpolant entre pickup et delivery (toutes les 3 s, marker `accent`).
- [ ] **Sélecteur d'adresse sur la carte** dans `edit-address.tsx` : laisser l'utilisateur déplacer le pin, et déclencher `mockReverseGeocode` à chaque changement.
- [ ] **Clé Google Maps Android** : pour activer `provider="google"` et `showsUserLocation` dans `KhabiMap` proprement. Ajouter `android.config.googleMaps.apiKey` dans `app.json`. Alternative : rester sur le provider par défaut (carte Android stock) — ça marche mais c'est moins joli.

### Onboarding / Auth
- [ ] **Renvoyer un vrai SMS** (Twilio, Africa's Talking, ou un provider local RDC). Pour l'instant le code OTP est dans le code (`1234`/`5678`/`1234` pour inscrits) — clairement temporaire.
- [ ] **Vérification email optionnelle** pour récupération de compte.
- [ ] **Persistance des comptes inscrits côté serveur** — actuellement en AsyncStorage, perdu si l'app est désinstallée.

### Notifications
- [ ] **Push notifications** (FCM) — actuellement uniquement local. Nécessite un backend qui peut pusher depuis le serveur quand un livreur accepte, quand un produit est près d'expirer, etc.
- [ ] **Catégories de notif** Android (commandes / promos / système) pour permettre à l'utilisateur d'en désactiver une partie.
- [ ] **Notification action buttons** : "Voir la commande", "Annuler" directement depuis la notif.

### Commandes
- [ ] **Vrai tracking GPS du livreur** : actuellement on simule. À brancher sur un backend qui reçoit la position du livreur en temps réel (WebSocket / SSE).
- [ ] **Chat client ↔ livreur** : pour l'instant uniquement appel téléphone. Un chat textuel avec messages prédéfinis ("Je suis devant la porte", "Pouvez-vous descendre ?") serait utile.
- [ ] **Notes / instructions de livraison** modifiables depuis l'écran de suivi, pas seulement au checkout.
- [ ] **Évaluation après livraison** : 1-5 étoiles + commentaire optionnel.

### Côté livreur
- [ ] **Documents livreur** : permis de conduire, carte d'identité, photo véhicule. Écran `app/(driver-tabs)/driver-profile/documents.tsx` (item de menu existe déjà mais non branché).
- [ ] **Évaluations livreur** : écran ratings avec moyenne + historique commentaires. Item de menu existe déjà.
- [ ] **Mode pause** : entre "en ligne" et "hors ligne", un mode "en pause" qui ne reçoit plus de missions mais reste connecté.
- [ ] **Type de véhicule** (moto / vélo / voiture) — influence les missions reçues et les frais.

### Catalogue
- [ ] **Vraie recherche globale** depuis l'accueil — actuellement la barre sur `home/index.tsx` n'a pas d'action. Soit naviguer vers un écran de recherche dédié, soit ouvrir une modale.
- [ ] **Filtres avancés** sur le catalogue : fourchette de prix, note minimum, distance.
- [ ] **Restaurants / boutiques** au lieu de "produits flat" — il manque la notion de marchand. Actuellement un produit n'a pas de vendeur identifié.
- [ ] **Favoris** : étoile sur les produits / marchands, écran "Mes favoris".

### Profil
- [ ] **Plusieurs photos de profil** ou avatar généré quand pas de photo.
- [ ] **Suppression de compte** (GDPR / Play Store policy 2024 — devient bloquant pour les apps avec compte). Bouton dans paramètres.
- [ ] **Export des données** (RGPD).
- [ ] **Changer le numéro de téléphone** avec re-vérification OTP.

---

## P2 — Qualité de code et tooling

### TypeScript
- [ ] **Typer correctement les routes** `expo-router` (`typedRoutes: true` est déjà actif) et supprimer les ~50 `as any` sur `router.push`/`router.replace`. Documentation : https://docs.expo.dev/router/reference/typed-routes/
- [ ] **Strict mode** : passer `tsconfig.json` à `"strict": true` et corriger les retombées.
- [ ] **Type des routes paramétrées** : `useLocalSearchParams<{ orderId: string }>` est OK mais inconsistant — certains écrans n'utilisent pas le générique.

### Lint
- [ ] Corriger les **21 warnings** de `expo lint` : imports inutilisés, dépendances de hook manquantes. La plupart sont triviaux.
- [ ] Ajouter **Prettier** + un script `format`.
- [ ] **Husky + lint-staged** pour bloquer les commits non-formatés.

### Tests
- [ ] **Tests unitaires** sur la logique pure :
  - `OrdersProvider` : auto-progression des statuts, annulation, timer missions.
  - `CartProvider` : ajout/retrait/clear/persistance.
  - `AddressesProvider` : CRUD + default.
  - `mockReverseGeocode` : déterminisme.
- [ ] **Tests d'intégration** avec `@testing-library/react-native` sur les écrans critiques (login → OTP → GPS → home).
- [ ] **Tests E2E** avec Detox ou Maestro pour : flow de commande complet, flow de livraison complet.

### Performance
- [ ] **`react-native-screens`** déjà installé mais `enableScreens()` n'est pas appelé explicitement (expo le fait par défaut, à confirmer).
- [ ] **FlatList** pour les listes longues (orders, completedMissions, transactions) au lieu de `ScrollView.map`. Actuellement OK car les listes sont courtes, mais à anticiper.
- [ ] **`useMemo`** plus systématique sur les `filter`/`map` chains dans `OrdersProvider`.
- [ ] **`react-native-fast-image`** ou `expo-image` (déjà installé) pour les `<Image>` du catalogue qui chargent depuis Unsplash.

---

## P3 — Internationalisation et accessibilité

- [ ] **i18n** : tous les textes sont en français en dur. Extraire dans `i18n/fr.json` + `i18n/en.json` via `expo-localization` et `i18next` ou `react-i18next`. Critique si vous visez le marché anglophone (Kenya, Rwanda…).
- [ ] **Lingala / Swahili** : utile pour la RDC. Demande un relecteur natif.
- [ ] **Accessibilité** :
  - `accessibilityLabel` sur tous les boutons icône (actuellement sans label).
  - Contrastes : vérifier WCAG AA sur les textes secondaires (`#9BA8B7` sur `#F7FAF9` est limite).
  - Taille de touch : minimum 44×44 (la plupart sont OK).
  - Lecteurs d'écran : tester avec TalkBack.

---

## P4 — Backend (sortie du mode mocks)

Quand l'app passe en production réelle.

### API
- [ ] **Choisir une stack backend** : Node.js + tRPC (`@tanstack/react-query` déjà branché côté client, intégration directe) / NestJS / Go / Python FastAPI.
- [ ] **Schema DB** : users, addresses, services, products, merchants, orders, missions, payments, transactions, ratings.
- [ ] **API REST ou tRPC** pour : auth (OTP), CRUD adresses, listing produits, création commande, statut commande, missions livreur, validation PIN.

### Auth
- [ ] **Phone Auth** réel : Firebase Phone Auth (gratuit jusqu'à un certain seuil) ou Twilio Verify.
- [ ] **Tokens JWT** + refresh tokens stockés en `SecureStore` (pas AsyncStorage pour les credentials).
- [ ] **Rate limiting** sur les endpoints OTP.

### Temps réel
- [ ] **WebSocket / Socket.io** ou **SSE** pour : tracking livreur, nouvelles missions livreur, changement de statut commande.
- [ ] **MapLibre / Mapbox** au lieu de Google Maps si le quota gratuit Google ne suffit pas.

### Paiements
- [ ] **Intégrations vraies** :
  - **M-Pesa Vodacom RDC** (Daraja API similaire au Kenya).
  - **Airtel Money RDC** (Airtel Money API).
  - **Orange Money RDC** (Orange Developer Portal).
  - **Cash** : aucun changement, juste workflow.
- [ ] **Webhooks** côté serveur pour confirmer le paiement après callback opérateur.
- [ ] **Réconciliation manuelle** : interface admin pour cas d'échec partiel.

### Stockage / DevOps
- [ ] **Cloud DB** : Supabase (simple à démarrer) ou Postgres managé (Neon, Railway, RDS).
- [ ] **Stockage images** : Supabase Storage / S3 / Cloudflare R2 pour les photos de profil, photos de preuve de livraison.
- [ ] **CI/CD** : GitHub Actions pour tester + builder + déployer EAS automatiquement sur tag.
- [ ] **Monitoring** : Sentry (déjà compatible Expo) pour les crashs, Logtail / Better Stack pour les logs serveur.
- [ ] **Analytics** : PostHog ou Amplitude pour comprendre les funnels.

### Admin
- [ ] **Back-office** web (Next.js + même tRPC backend) pour :
  - Gérer marchands et produits.
  - Valider documents livreurs.
  - Voir commandes en cours et intervenir si bug.
  - Statistiques business.

---

## P5 — UX et finition

- [ ] **Skeleton screens** : utiliser `components/Skeleton.tsx` (déjà créé) sur les écrans qui hydratent depuis AsyncStorage (orders/index, addresses, transactions, etc.). Actuellement flash de contenu vide.
- [ ] **Animations fluides** entre les écrans — vérifier les transitions de `Stack` (`animation: 'slide_from_right'` pas partout).
- [ ] **Haptics** plus systématiques sur les actions importantes (déjà en place sur certains boutons, à généraliser).
- [ ] **Sons** : ding subtil quand commande confirmée, mission acceptée (optionnel mais agréable).
- [ ] **Mode sombre** : `SettingsProvider.themeMode` existe mais aucun écran ne réagit. Soit créer un `ThemedView` qui swap `theme.bg` / `theme.surface` / `theme.text` selon le mode, soit utiliser `useColorScheme` plus systématiquement.
- [ ] **Promo code** : champ "code promo" au checkout qui applique une réduction (mock : `KHABI2024` → -1000 FC).
- [ ] **Tutoriel premier usage** : tooltip / coachmark sur les éléments clés au premier login.

---

## P6 — Marketing et croissance

Sortie du périmètre technique, mais à anticiper.

- [ ] **App icon** finale, branding cohérent (logo, splash, splash dark).
- [ ] **Site vitrine** `kabi.app` avec download buttons stores, FAQ, contact.
- [ ] **Pages légales** (cf P0) hébergées.
- [ ] **Programme de parrainage** : code à partager → -2000 FC pour les deux.
- [ ] **Notifications push promotionnelles** (avec opt-out clair, exigé par Play Store).
- [ ] **A/B testing** des écrans clés (couleur du CTA, ordre des services sur l'accueil).
- [ ] **Onboarding livreur** : formulaire, validation documents, formation initiale.

---

## P7 — Cas limites et robustesse

- [ ] **Que se passe-t-il si la commande est créée mais le paiement échoue** ? Actuellement le flow va vers `payment-failed.tsx` mais la commande reste dans le store. À nettoyer ou marquer `payment_pending`.
- [ ] **Que se passe-t-il si l'app est tuée pendant que les timers tournent** ? Les `setTimeout` sont perdus. À la reprise, recalculer l'état attendu en fonction de `createdAt` + délais.
- [ ] **Conflit panier multi-service** : si le client ajoute un produit Restaurant après un produit Pharmacie, on clear le panier. Déjà géré dans `CartProvider`. Ajouter un Alert de confirmation.
- [ ] **Réseau coupé** : aucune gestion. À terme, queue de retry sur les mutations critiques (création commande).
- [ ] **Permission GPS refusée puis activée plus tard** : pas de mécanisme pour re-demander. À gérer dans `SettingsProvider` ou via un banner sur l'accueil.
- [ ] **Photo de preuve livreur** : actuellement un simple flag, pas d'upload réel. À brancher sur `expo-image-picker` + upload vers le serveur (cf P4).

---

## P8 — Documentation

- [ ] **README.md** à compléter : prérequis, installation, commandes, conventions de commit, structure des dossiers.
- [ ] **CONTRIBUTING.md** si vous ouvrez le repo.
- [ ] **CHANGELOG.md** pour tracker les versions.
- [ ] **Architecture decision records** (ADR) pour les choix structurants (pourquoi Zustand non utilisé, pourquoi `createContextHook` au lieu de Redux, etc.).

---

## Conventions

- Cocher les cases au fur et à mesure.
- Les sections P0 → P1 → P2 doivent être faites dans l'ordre. P3 et au-delà sont parallélisables.
- Ne pas oublier de mettre à jour `dev.md` et `update.md` quand une section est finie.
- Toujours **mocks d'abord**, intégration backend ensuite (P4 attend que P0–P2 soient verts).
