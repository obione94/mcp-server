# 🚀 MCP Server - Tools, Resources & Prompts

## Différence conceptuelle

| Type | server.method | Usage | Exemples |
|------|---------------|-------|----------|
| **🛠️ Tools** | `server.tool()` | Actions exécutables avec logique métier | `getWeather()`, `createIssue()`, `searchEmployees()` |
| **📄 Resources** | `server.resource()` | Données en lecture seule via URI | `file:///rapport.pdf`, `db://employees/{id}` |
| **✨ Prompts** | `server.prompt()` | Modèles de prompts paramétrables | `summary_prompt()`, `code_review_prompt()` |

### 🛠️ Tools (`server.tool`)

✅ Action exécutable avec effets possibles
✅ Arguments typés (Zod) → résultat structuré
✅ Logique métier : DB, API, calculs

**Quand ?** Tu veux exécuter du code qui produit un résultat opérationnel.

### 📄 Resources (`server.resource`)

✅ Données consultables en lecture seule
✅ Accès via URI (style système de fichiers)
✅ Pas d'action métier complexe

**Quand ?** Tu exposes des documents/fichiers statiques ou pré-calculés.

### ✨ Prompts (`server.prompt`)

✅ Génère des messages pour le modèle
✅ Paramétrable et réutilisable
✅ Workflow de prompting standardisé

**Quand ?** Tu veux standardiser comment parler au LLM.

## 🎯 Guide d'utilisation rapide

```typescript
// TOOL - Action métier
server.tool('getEmployeeCount', schema, handler);

// RESOURCE - Données statiques
server.resource('company://google/employees', data);

// PROMPT - Template de messages
server.prompt('employeeReport', params, messages);

Exemple concret
getEmployeeCount("Google") → 180000 employés (TOOL)
company://google/employees → "Google emploie..." (RESOURCE)  
employeeReport("Google") → ["system:...", "user:..."] (PROMPT)

Basé sur Model Context Protocol (MCP) v2025-06-18
```

