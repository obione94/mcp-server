import { useState, useRef, useEffect, FormEvent } from "react";
import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type RoleType = "user" | "comptable" | "PDG";
interface Message {
  role: 'user' | 'assistant';
  content: string;
  senderRole?: RoleType;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("user");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ TOUT DYNAMIQUE
  const roleLabels: Record<RoleType, string> = {
    user: "👤 User",
    comptable: "📊 Comptable", 
    PDG: "👔 PDG"
  };

  const roleColors: Record<RoleType, string> = {
    user: "#3b82f6",
    comptable: "#10b981",
    PDG: "#f59e0b"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user' as const, 
      content: inputValue,
      senderRole: selectedRole 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chatmoi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: selectedRole,  // ✅ EXACT du select
            content: inputValue
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant' as const, 
        content: data.content || "Réponse sans contenu" 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: Message = { 
        role: 'assistant' as const, 
        content: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MCP Chat Proxy</title>
        <meta name="description" content="Interface chat pour proxy MCP + Ollama" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.logoContainer}>
                  <Image src="/next.svg" alt="Next.js" width={24} height={24} priority />
                  <span>MCP Chat Proxy</span>
                </div>
                
                {/* ✅ SELECT 100% DYNAMIQUE */}
                <div className={styles.roleSelector}>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    disabled={isLoading}
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.status}>
                {isLoading ? '🤔 Réponse en cours...' : '✅ Prêt'}
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.welcomeMessage}>
                  <div className={styles.welcomeEmoji}>👋</div>
                  <h2>Bonjour !</h2>
                  <p>Sélectionnez un rôle et envoyez un message</p>
                  {/* ✅ EXEMPLES 100% DYNAMIQUES */}
                  <div className={styles.exampleRequests}>
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <div key={role}>
                        {label}: "{role === 'user' ? 'bonjour' : 'greet David'}"
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`${styles.message} ${styles[message.role]}`}>
                    <div className={styles.messageBubble}>
                      <span 
                        className={styles.roleBadge}
                        style={message.senderRole ? {
                          backgroundColor: roleColors[message.senderRole]
                        } : {
                          backgroundColor: '#6b7280'
                        }}
                      >
                        {message.senderRole 
                          ? roleLabels[message.senderRole] 
                          : 'Assistant'
                        }
                      </span>
                      <div className={styles.messageContent}>{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className={styles.inputContainer}>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message... (${roleLabels[selectedRole]})`}
                className={styles.inputField}
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={styles.sendButton}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
