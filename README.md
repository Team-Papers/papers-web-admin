# Papers — Admin Dashboard

Tableau de bord d'administration de la plateforme **Papers - Livres et Histoires**.
Permet la modération des auteurs, livres, utilisateurs et la gestion des transactions.

## Stack

- **React 19** + **TypeScript** (Vite 7)
- **Tailwind CSS v4**
- **Zustand** (state management)
- **Axios** (API client avec JWT refresh)
- **React Router** (SPA routing)
- **Recharts** (graphiques)
- **i18next** (internationalisation — FR)

## Liens

| Environnement | URL |
|---------------|-----|
| **Production** | https://admin.papers237.duckdns.org |
| **API** | https://api.papers237.duckdns.org/api/v1 |

## Développement

```bash
# Installation
npm install

# Serveur de développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## Variables d'environnement

```bash
# .env
VITE_API_URL=http://localhost:8000/api/v1
```

## Fonctionnalités

- Connexion admin sécurisée
- Dashboard KPIs (utilisateurs, auteurs, livres, revenus)
- Modération des demandes auteurs (approuver/rejeter)
- Modération des livres (approuver/rejeter/suspendre)
- Gestion des utilisateurs (suspendre/bannir/réactiver)
- Gestion des catégories (CRUD)
- Suivi des transactions et retraits

## Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les détails d'hébergement et CI/CD.
