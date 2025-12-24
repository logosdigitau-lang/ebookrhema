
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getInitialGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Bom dia! Seja bem-vindo(a) ao Ebook Rhema. É um prazer atender você e ajudar no que for necessário.";
    } else if (hour >= 12 && hour < 18) {
      return "Boa tarde! Seja bem-vindo(a) ao Ebook Rhema. Estou à disposição para esclarecer suas dúvidas e orientar sua compra.";
    } else {
      return "Boa noite! Seja bem-vindo(a) ao Ebook Rhema. Será um prazer auxiliar você com informações sobre nossos livros.";
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define a saudação inicial apenas uma vez ao montar
    setMessages([{ role: 'model', text: getInitialGreeting() }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithGemini(newHistory);
      setMessages([...newHistory, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'model', text: 'Sinto muito, ocorreu um erro em minha comunicação. Por favor, tente novamente em instantes.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="bg-white dark:bg-rhema-dark border border-rhema-primary/20 shadow-2xl rounded-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-rhema-dark text-white p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-rhema-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">support_agent</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">Secretaria Virtual</h4>
                <p className="text-[10px] text-rhema-primary uppercase font-bold tracking-widest">Atendimento Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-rhema-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-rhema-light/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-rhema-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-white shadow-sm border border-stone-100 dark:border-stone-700 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-stone-800 p-3 rounded-2xl shadow-sm border border-stone-100 rounded-bl-none flex gap-1">
                  <div className="size-2 bg-rhema-primary rounded-full animate-bounce"></div>
                  <div className="size-2 bg-rhema-primary rounded-full animate-bounce delay-75"></div>
                  <div className="size-2 bg-rhema-primary rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-rhema-primary/10 bg-white dark:bg-rhema-dark">
            <div className="flex items-center gap-2 bg-rhema-light/30 dark:bg-white/5 rounded-full px-4 py-1">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Como posso ajudar você hoje?" 
                className="bg-transparent border-none focus:ring-0 text-sm flex-1 text-stone-800 dark:text-white"
              />
              <button onClick={handleSend} className="text-rhema-primary hover:text-rhema-primary/80">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="size-16 bg-rhema-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-rhema-primary"
        >
          <span className="material-symbols-outlined text-3xl">support_agent</span>
          <div className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full border-2 border-rhema-dark flex items-center justify-center">
            <span className="text-[10px] font-bold">1</span>
          </div>
        </button>
      )}
    </div>
  );
};
