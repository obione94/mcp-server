# 🤖 AI PostgreSQL Autonomous Data Assistant

> Assistant IA autonome basé sur **Ollama** (`llama3.1:8b`), utilisant un serveur **MCP** (Model Context Protocol) et un ensemble de tools pour interagir dynamiquement avec une base **PostgreSQL**.

---

## 🔍 Présentation

Ce projet démontre l'exploitation complète du **tool calling multi-étapes**, incluant :

- 🔄 Multi-tool chaining
- 🧠 Raisonnement conditionnel
- 🗃️ Lecture & écriture SQL
- 📊 Génération de rapports
- 📧 Déclenchement d'actions externes
- 🔁 Boucle automatique jusqu'à réponse finale

---

## 🚀 Objectif

Créer un assistant capable de :

- Interroger PostgreSQL en langage naturel
- Générer et exécuter du SQL dynamiquement
- Analyser les résultats
- Déclencher des actions externes (email, rapport, index, etc.)
- Synthétiser une réponse finale fiable

---

## 🏗️ Architecture

```text
User
  ↓
Proxy (Express / TypeScript)
  ↓
Ollama (llama3.1:8b)
  ↓
Tool Calls
  ↓
Serveur MCP
  ↓
PostgreSQL
```

---

## 🧩 Composants

### 1️⃣ Ollama

Modèle recommandé : `llama3.1:8b`

Rôle :
- Décide quels tools appeler
- Génère les paramètres
- Synthétise la réponse finale

### 2️⃣ Proxy (TypeScript)

Rôle :
- Envoie les messages à Ollama
- Détecte les `tool_calls`
- Exécute les tools via MCP
- Réinjecte les résultats
- Boucle jusqu'à réponse finale

### 3️⃣ Serveur MCP

Expose des tools structurés :

| Tool               | Description                        |
|--------------------|------------------------------------|
| `pg_query`         | Exécute une requête SELECT         |
| `pg_execute`       | Permet INSERT, UPDATE, DELETE      |
| `pg_schema_inspect`| Retourne la structure des tables   |
| `generate_report`  | Transforme un JSON en rapport      |
| `send_email`       | Simule ou envoie une notification  |
| `create_chart`     | Données formatées pour graphique   |

### 4️⃣ PostgreSQL

Utilisé pour :
- Données métier
- Analytics
- Audit
- Reporting

---

## 🔧 Tools disponibles

### 📖 `pg_query` — Lecture

Exécute une requête `SELECT`.

```json
{
  "name": "pg_query",
  "description": "Exécute une requête SELECT sur PostgreSQL",
  "parameters": {
    "type": "object",
    "properties": {
      "sql": { "type": "string" }
    },
    "required": ["sql"]
  }
}
```

### ✏️ `pg_execute` — Écriture

Permet `INSERT`, `UPDATE`, `DELETE`.

### 🔍 `pg_schema_inspect` — Schéma

Retourne la structure des tables.

### 📊 `generate_report` — Rapport

Transforme un JSON en rapport structuré.

### 📧 `send_email` — Notification

Simule ou envoie une notification.

### 📈 `create_chart` — Graphique

Retourne des données formatées pour affichage graphique.

---

## 🔁 Boucle Tool-Calling

Le proxy implémente une boucle de tool-calling jusqu'à obtention d'une réponse finale :

```ts
async function runWithTools(messages) {
  while (true) {
    const res = await ollama.chat({ model, messages, tools });

    if (!res.message.tool_calls?.length) {
      return res.message;
    }

    messages.push(res.message);

    for (const toolCall of res.message.tool_calls) {
      const result = await executeTool(toolCall);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result
      });
    }
  }
}
```

---

## 🧠 Exemple d'utilisation

**Question utilisateur :**

> Quels sont les 5 clients les plus rentables ce mois-ci et envoie un email si l'un d'eux a chuté de plus de 20% ?

**Ce que fait l'IA :**

1. Appelle `pg_query` → données du mois courant
2. Appelle `pg_query` → données du mois précédent
3. Compare les résultats
4. Si condition remplie → `send_email`
5. Génère une synthèse finale

---

## 🛡️ Bonnes pratiques

> ✅ **System Prompt strict**
>
> *"Tu dois utiliser STRICTEMENT les réponses des tools. Ne pas inventer ni ignorer les résultats."*

- ✅ Toujours renvoyer les tools au 2e appel : `tools: mcpTools`
- ✅ Conserver le même modèle entre les appels

---

## 📂 Structure du projet

```text
/proxy
  ├── server.ts
  ├── ollama.ts
  └── tool-loop.ts

/mcp-server
  ├── tools/
  │     ├── pgQuery.ts
  │     ├── pgExecute.ts
  │     └── ...
  └── index.ts

/database
  └── schema.sql
```

---

## 🧪 Cas d'usage avancés

| Cas d'usage              | Description                                                        |
|--------------------------|--------------------------------------------------------------------|
| 🧠 Database Copilot      | Optimisation d'index, analyse de lenteur, vérification permissions |
| 📊 AI DataOps Assistant  | Reporting automatique, détection d'anomalies, alerting conditionnel|
| 🔐 AI Security Auditor   | Audit des rôles, détection de données sensibles, analyse EXPLAIN   |

---

## 🔥 Pourquoi ce projet est puissant

| Capacité                  | Support |
|---------------------------|---------|
| Multi-tools               | ✅      |
| Tool chaining             | ✅      |
| Raisonnement conditionnel | ✅      |
| SQL dynamique             | ✅      |
| Synthèse multi-source     | ✅      |
| Architecture scalable     | ✅      |

---

## 🧩 Améliorations futures

- Streaming support
- Gestion avancée des erreurs
- Retry automatique de tools
- Logging structuré
- RBAC sur tools sensibles
- Ajout de `pgvector` + RAG hybride

---

## 📌 Prérequis

- Node.js 20+
- PostgreSQL 14+
- Ollama installé
- Docker (optionnel)

---

## 🚀 Lancement

```bash
# 1️⃣ Lancer PostgreSQL
docker compose up -d postgres

# 2️⃣ Lancer Ollama
ollama run llama3.1:8b

# 3️⃣ Démarrer MCP
npm run dev:mcp

# 4️⃣ Démarrer le Proxy
npm run dev
```

---

## 🎯 Conclusion

Ce projet démontre une architecture complète d'**agent IA autonome local** capable de :

- Comprendre
- Planifier
- Interagir avec une base de données
- Exécuter des actions
- Produire une réponse fiable

Il exploite pleinement la puissance du **tool-calling multi-étapes** avec **Ollama + MCP + PostgreSQL**.