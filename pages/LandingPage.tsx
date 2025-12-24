
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { MOCK_TESTIMONIALS } from '../constants';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // [NEW] Get books and settings from context
  const { books, settings } = useData();

  // SEO e Meta Tags
  useEffect(() => {
    // ... (existing SEO logic)
    document.title = "Ebook Rhema | Livros Cristãos e Inteligência Emocional por Messias Tavares";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Encontre livros físicos e digitais que unem fé cristã e inteligência emocional. Curadoria exclusiva do Autor Messias Tavares.");
    }

    // Injeção de Schema Markup (JSON-LD)
    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ebook Rhema",
      "url": "https://ebookrhema.com",
      "logo": "https://ebookrhema.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-11-90000-0000",
        "contactType": "customer service",
        "email": "msig12@gmail.com"
      }
    };

    const schemaProduct = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": books.slice(0, 4).map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://ebookrhema.com/#/livro/${book.id}`,
        "name": book.title,
        "image": book.coverUrl
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify([schemaOrg, schemaProduct]);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [books]);

  // [NEW] Use settings from context
  const { launchDate, isPreLaunch, launchBookId, launchPrice } = settings;

  const launchBook = books.find(b => b.id === launchBookId);

  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!launchDate) return;
    const timer = setInterval(() => {
      const difference = +new Date(launchDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
          seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="overflow-x-hidden font-display">
      {/* Banner de Lançamento */}
      {isPreLaunch && (
        <section className="bg-rhema-primary text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse"></div>
          <div className="max-w-[1200px] mx-auto px-4 relative z-10">
            {launchBook ? (
              <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-1 text-center md:text-left">
                  <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Evento Exclusivo</span>
                  <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter leading-tight">
                    O Grande Lançamento: <br />
                    <span className="text-white/90">{launchBook.title}</span>
                  </h2>
                  {launchPrice && (
                    <p className="text-2xl font-bold mb-8 opacity-90">
                      Oferta de Lançamento: <span className="bg-white text-rhema-primary px-3 py-1 rounded-lg">R$ {launchPrice}</span>
                    </p>
                  )}

                  <div className="flex justify-center md:justify-start gap-4 mb-10">
                    {[
                      { label: 'Dias', val: timeLeft.days },
                      { label: 'Horas', val: timeLeft.hours },
                      { label: 'Minutos', val: timeLeft.minutes },
                      { label: 'Segundos', val: timeLeft.seconds }
                    ].map((unit, idx) => (
                      <div key={idx} className="bg-white text-rhema-dark p-4 rounded-2xl min-w-[70px] shadow-lg flex flex-col items-center">
                        <span className="text-2xl font-black text-rhema-primary">{unit.val}</span>
                        <span className="text-[8px] font-bold uppercase text-stone-400 mt-1">{unit.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="max-w-md mx-auto md:mx-0">
                    <form className="flex bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner" onSubmit={e => e.preventDefault()}>
                      <input className="bg-transparent border-none flex-1 px-4 text-white placeholder:text-white/60 focus:ring-0 text-sm" placeholder="Seu melhor e-mail" type="email" required />
                      <button type="submit" className="bg-white text-rhema-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-rhema-light transition-colors whitespace-nowrap">Entrar na Lista</button>
                    </form>
                    <p className="text-white/60 text-[9px] mt-4 font-bold uppercase tracking-widest text-center md:text-left">Receba o link com desconto de pré-venda</p>
                  </div>
                </div>

                <div className="flex-1 flex justify-center relative">
                  <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full transform scale-75 animate-pulse"></div>
                  <img
                    src={launchBook.coverUrl}
                    alt={launchBook.title}
                    className="relative w-64 lg:w-96 rounded-xl shadow-2xl rotate-6 border-4 border-white/20 transform hover:rotate-0 transition-all duration-700"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Evento Exclusivo</span>
                <h2 className="text-4xl lg:text-6xl font-black mb-10 tracking-tighter">O Grande Lançamento está Próximo!</h2>

                <div className="flex justify-center gap-3 lg:gap-8 mb-12">
                  {[
                    { label: 'Dias', val: timeLeft.days },
                    { label: 'Horas', val: timeLeft.hours },
                    { label: 'Minutos', val: timeLeft.minutes },
                    { label: 'Segundos', val: timeLeft.seconds }
                  ].map((unit, idx) => (
                    <div key={idx} className="bg-white text-rhema-dark p-6 rounded-[2rem] min-w-[80px] lg:min-w-[120px] shadow-2xl flex flex-col items-center transform transition-transform hover:scale-105">
                      <span className="text-3xl lg:text-5xl font-black text-rhema-primary">{unit.val}</span>
                      <span className="text-[10px] font-bold uppercase text-stone-400 mt-2 tracking-widest">{unit.label}</span>
                    </div>
                  ))}
                </div>

                <div className="max-w-md mx-auto">
                  <form className="flex bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner" onSubmit={e => e.preventDefault()}>
                    <input className="bg-transparent border-none flex-1 px-4 text-white placeholder:text-white/60 focus:ring-0 text-sm" placeholder="Seu melhor e-mail" type="email" required />
                    <button type="submit" className="bg-white text-rhema-primary px-8 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-rhema-light transition-colors">Garantir Acesso</button>
                  </form>
                  <p className="text-white/60 text-[9px] mt-4 font-bold uppercase tracking-widest">Receba o link com desconto de pré-venda</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-rhema-dark overflow-hidden py-24 lg:py-48 flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="w-full h-full bg-cover bg-fixed bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&q=80&w=1920')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-rhema-dark via-rhema-dark/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 w-full">
          <div className="lg:w-3/4 space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-rhema-primary/10 border border-rhema-primary/20 rounded-full">
              <span className="size-2 bg-rhema-primary rounded-full animate-ping"></span>
              <span className="text-rhema-primary text-[10px] font-black uppercase tracking-widest">Literatura de Propósito</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter">
              Alimento sólido para a <span className="text-rhema-primary italic">Mente</span> e o <span className="text-rhema-primary underline decoration-rhema-primary/30">Espírito</span>.
            </h1>

            <p className="text-gray-300 text-xl lg:text-2xl max-w-2xl leading-relaxed font-light">
              Descubra obras selecionadas do <span className="text-white font-bold">Autor Messias Tavares</span> que unem saúde emocional, teologia prática e crescimento pessoal.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Link to="/livros" className="group px-12 py-5 bg-rhema-primary text-white font-black rounded-2xl shadow-2xl shadow-rhema-primary/40 hover:-translate-y-1 transition-all text-lg flex items-center gap-3">
                Explorar Catálogo
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link to="/autor" className="px-12 py-5 bg-white/5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all text-lg">
                Sobre o Autor
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-10 border-t border-white/10 max-w-lg">
              <div>
                <p className="text-3xl font-black text-white">10k+</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Leitores Impactados</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <p className="text-3xl font-black text-white">4.9/5</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Avaliação Média</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-24 bg-white border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4 group">
            <div className="size-16 bg-rhema-light text-rhema-primary rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <h3 className="text-xl font-black text-stone-800">Ebooks: Envio Imediato</h3>
            <p className="text-stone-500 text-sm leading-relaxed">Receba o acesso direto no seu e-mail logo após a confirmação do pagamento, sem esperas.</p>
          </div>
          <div className="space-y-4 group">
            <div className="size-16 bg-rhema-light text-rhema-primary rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:-rotate-6 transition-transform">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <h3 className="text-xl font-black text-stone-800">Físicos: Frete a Combinar</h3>
            <p className="text-stone-500 text-sm leading-relaxed">Enviamos para todo o Brasil. O valor e o prazo são calculados dinamicamente no checkout.</p>
          </div>
          <div className="space-y-4 group">
            <div className="size-16 bg-rhema-light text-rhema-primary rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h3 className="text-xl font-black text-stone-800">Suporte Dedicado</h3>
            <p className="text-stone-500 text-sm leading-relaxed">Dúvidas? Fale conosco via WhatsApp ou e-mail: <br /><b className="text-rhema-primary">msig12@gmail.com</b></p>
          </div>
        </div>
      </section>

      {/* Livros em Destaque */}
      <section className="py-32 bg-[#fdfcfb]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 gap-8">
            <div className="text-center md:text-left">
              <p className="text-rhema-primary font-black uppercase text-[10px] tracking-[0.4em] mb-4">Seleção Especial</p>
              <h2 className="text-4xl lg:text-6xl font-black text-stone-900 tracking-tighter">Obras em Destaque</h2>
            </div>
            <Link to="/livros" className="group flex items-center gap-3 px-8 py-4 bg-white border border-stone-200 rounded-2xl font-bold text-stone-600 hover:border-rhema-primary hover:text-rhema-primary transition-all">
              Ver Catálogo Completo
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {books.slice(0, 4).map(book => (
              <div
                key={book.id}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100 flex flex-col h-full cursor-pointer relative"
                onClick={() => navigate(`/livro/${book.id}`)}
              >
                <div className="aspect-[3/4.5] overflow-hidden bg-stone-100 relative">
                  <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={book.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">Ver Detalhes</p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black shadow-xl uppercase tracking-widest backdrop-blur-md ${book.format === 'digital' ? 'bg-white/90 text-rhema-primary' : 'bg-rhema-dark text-white'
                      }`}>
                      {book.format === 'digital' ? 'Ebook' : 'Físico'}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow text-center">
                  <p className="text-[10px] text-rhema-primary font-black uppercase tracking-widest mb-3">{book.category}</p>
                  <h4 className="font-black text-xl leading-tight mb-6 text-stone-800 line-clamp-2 min-h-[3.5rem] group-hover:text-rhema-primary transition-colors">{book.title}</h4>
                  <div className="mt-auto pt-6 border-t border-stone-50 flex flex-col items-center">
                    <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">{book.format === 'digital' ? 'Envio Imediato' : 'Frete a combinar'}</p>
                    <span className="font-black text-stone-900 text-3xl tracking-tighter">R$ {book.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testemunhos Section */}
      <section className="py-32 bg-rhema-dark text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 p-40 bg-rhema-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <span className="text-rhema-primary font-black uppercase tracking-[0.4em] text-[10px]">Depoimentos</span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Quem leu, recomenda.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {MOCK_TESTIMONIALS.map(t => (
              <div key={t.id} className="bg-white/5 backdrop-blur-md p-10 lg:p-14 rounded-[3rem] border border-white/10 space-y-8 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-5xl text-rhema-primary opacity-50">format_quote</span>
                <p className="text-xl lg:text-2xl font-medium leading-relaxed italic text-gray-200">"{t.content}"</p>
                <div className="flex items-center gap-5 pt-4">
                  <img src={t.avatarUrl} className="size-16 rounded-2xl object-cover ring-4 ring-rhema-primary/20" alt={t.name} />
                  <div>
                    <p className="text-lg font-black">{t.name}</p>
                    <p className="text-xs font-bold text-rhema-primary uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 bg-rhema-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10 space-y-10">
          <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter leading-none">
            Pronto para começar <br /> sua jornada de transformação?
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/livros" className="px-12 py-6 bg-white text-rhema-primary font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform text-xl">
              Quero Conhecer os Livros
            </Link>
            <a href="https://curt.link/livro21DIE" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-rhema-dark text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-transform text-xl flex items-center gap-3">
              <span className="material-symbols-outlined">whatsapp</span>
              Falar no WhatsApp
            </a>
          </div>
          <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px]">Qualidade Rhema & Curadoria Messias Tavares</p>
        </div>
      </section>
    </div>
  );
};
