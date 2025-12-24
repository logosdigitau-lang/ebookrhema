
import React from 'react';
import { Link } from 'react-router-dom';

export const AuthorPage: React.FC = () => {
  return (
    <div className="bg-rhema-light/30 min-h-screen">
      <section className="py-20 max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-rhema-primary/10 text-rhema-primary rounded-full text-xs font-bold uppercase">Pastor</span>
            <span className="px-3 py-1 bg-rhema-primary/10 text-rhema-primary rounded-full text-xs font-bold uppercase">Escritor</span>
            <span className="px-3 py-1 bg-rhema-primary/10 text-rhema-primary rounded-full text-xs font-bold uppercase">Psicanalista</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-rhema-dark">Messias Tavares</h1>
          <p className="text-xl text-stone-600 leading-relaxed">
            Pastor sênior e fundador do ministério Vida na Palavra, em Cerejeiras–RO. Teólogo, psicanalista e autor de livros que promovem transformação interior, integrando fé cristã e saúde emocional por meio da Palavra. Casado há 32 anos com a Pra. Angela, pai de Wender e Paulo, dedica sua vida ao cuidado de pessoas e à formação de vidas com propósito.
          </p>
          <div className="flex gap-4">
            <Link to="/livros" className="px-8 py-3 bg-rhema-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center">Ver Obras</Link>
            <a
              href="https://wa.me/5569992821283?text=Ol%C3%A1%20vi%20seu%20contato%20pelo%20site%20Ebook%20Rhema."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-green-600">call</span>
              Contato
            </a>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="absolute inset-0 bg-rhema-primary rounded-3xl rotate-3 transform"></div>
          <img src="/author.png" className="relative z-10 rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full object-cover" alt="Author" />
        </div>
      </section>

      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="bg-rhema-content p-10 lg:p-20 rounded-[3rem] shadow-xl border border-white/50 space-y-8">
          <div className="border-l-4 border-rhema-primary pl-8">
            <h2 className="text-3xl font-bold">Minha Jornada</h2>
            <p className="text-stone-500 italic mt-1">Do púlpito à clínica, uma vida dedicada ao cuidado integral.</p>
          </div>
          <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-lg">
            <p>Com uma trajetória de mais de duas décadas dedicada ao ministério pastoral, sempre senti que o cuidado com o ser humano precisava ir além das palavras de domingo.</p>
            <p>Hoje, combino teologia e ciência da mente para oferecer uma visão integrada do ser humano. Minha paixão pela escrita nasceu do desejo de levar esse conforto e sabedoria prática para o dia a dia das pessoas.</p>
            <div className="bg-white p-10 rounded-3xl border-l-8 border-rhema-primary shadow-sm">
              <p className="text-2xl font-bold text-rhema-dark italic">"A verdadeira cura da alma começa quando entendemos quem somos em Deus e abraçamos nossa humanidade com compaixão."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
