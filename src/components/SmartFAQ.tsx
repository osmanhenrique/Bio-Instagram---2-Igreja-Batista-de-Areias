import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, Trash2, Edit2, X, MessageCircle, Lock, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const INITIAL_FAQ: FAQItem[] = [
  {
    id: '1',
    question: 'qual horarios dos cultos',
    answer: 'Cultos - Domingo: 09h | 18h | EBD 10h30. Terça (Missões): 19h30. Quarta (Oração): 19h30. Sábado: 18h | Jovens e adolesc.'
  }
];

const ADMIN_PASSWORD = '2ib@chat2026';

export const SmartFAQ: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load FAQs from LocalStorage
  useEffect(() => {
    const savedFaqs = localStorage.getItem('2iba_faqs');
    if (savedFaqs) {
      setFaqs(JSON.parse(savedFaqs));
    } else {
      setFaqs(INITIAL_FAQ);
      localStorage.setItem('2iba_faqs', JSON.stringify(INITIAL_FAQ));
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Bot Logic
    setTimeout(() => {
      const searchStr = userMsg.text.toLowerCase();
      const found = faqs.find(faq => 
        searchStr.includes(faq.question.toLowerCase()) || 
        faq.question.toLowerCase().includes(searchStr)
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: found ? found.answer : 'No momento não temos essa resposta!',
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const saveFaqs = (updatedFaqs: FAQItem[]) => {
    setFaqs(updatedFaqs);
    localStorage.setItem('2iba_faqs', JSON.stringify(updatedFaqs));
  };

  const addFaq = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: newQ,
      answer: newA
    };
    saveFaqs([...faqs, newItem]);
    setNewQ('');
    setNewA('');
  };

  const deleteFaq = (id: string) => {
    saveFaqs(faqs.filter(f => f.id !== id));
  };

  const startEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setNewQ(faq.question);
    setNewA(faq.answer);
  };

  const updateFaq = () => {
    saveFaqs(faqs.map(f => f.id === editingId ? { ...f, question: newQ, answer: newA } : f));
    setEditingId(null);
    setNewQ('');
    setNewA('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#527F46] rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-[#456b3b] transition-colors"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#527F46] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <span className="font-bold tracking-tight">Chat 2IBA</span>
              </div>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">Olá! Como podemos ajudar hoje?</p>
                </div>
              )}
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#527F46] text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-gray-100 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#527F46] outline-none"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-[#527F46] text-white rounded-full flex items-center justify-center hover:bg-[#456b3b] transition-colors shadow-lg"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-900 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Lock size={20} className="text-[#527F46]" />
                  <span className="font-bold">Painel Administrativo</span>
                </div>
                <button onClick={() => { setIsAdminOpen(false); setIsAuthorized(false); }} className="hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {!isAuthorized ? (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <p className="text-sm text-gray-500">Acesso restrito. Insira a senha para gerenciar o FAQ.</p>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha de acesso"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-[#527F46] outline-none transition-colors"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="w-full bg-[#527F46] text-white py-3 rounded-xl font-bold hover:bg-[#456b3b] transition-colors"
                    >
                      Entrar
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Add/Edit Form */}
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
                      </h3>
                      <input
                        type="text"
                        value={newQ}
                        onChange={(e) => setNewQ(e.target.value)}
                        placeholder="Pergunta (ex: horario cultos)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#527F46]"
                      />
                      <textarea
                        value={newA}
                        onChange={(e) => setNewA(e.target.value)}
                        placeholder="Resposta"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#527F46] h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        {editingId ? (
                          <>
                            <button 
                              onClick={updateFaq}
                              className="flex-1 bg-[#527F46] text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                            >
                              <Save size={16} /> Salvar Alterações
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setNewQ(''); setNewA(''); }}
                              className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg text-sm font-bold"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={addFaq}
                            className="w-full bg-[#527F46] text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <Plus size={16} /> Adicionar ao FAQ
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Perguntas Cadastradas</h3>
                      {faqs.length === 0 && <p className="text-center py-4 text-gray-400 text-xs italic">Nenhuma pergunta cadastrada.</p>}
                      {faqs.map(faq => (
                        <div key={faq.id} className="p-3 border border-gray-100 rounded-xl flex items-start justify-between group hover:border-gray-200 transition-colors">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-bold text-gray-800 truncate">{faq.question}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{faq.answer}</p>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => startEdit(faq)}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteFaq(faq.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartFAQ;
