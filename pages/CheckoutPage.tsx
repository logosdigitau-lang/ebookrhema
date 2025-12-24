import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Sale } from '../types';

type CheckoutStep = 'details' | 'payment' | 'success';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
}

export const CheckoutPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, addSale, settings } = useData();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<CheckoutStep>('details');
  // const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix'); // Removed, handled by MP
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingCEP, setIsFetchingCEP] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const checkoutItems = useMemo(() => {
    if (bookId && bookId !== 'cart') {
      const book = books.find(b => b.id === bookId);
      return book ? [{ ...book, quantity: 1 }] : [];
    }
    return items;
  }, [bookId, items, books]);

  const hasPhysicalItems = useMemo(() => {
    return checkoutItems.some(item => item.format === 'physical');
  }, [checkoutItems]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [checkoutItems]);

  const shippingCost = selectedShipping?.price || 0;
  // const discountAmount = paymentMethod === 'pix' ? (subtotal + shippingCost) * 0.05 : 0;
  const discountAmount = 0; // Removendo desconto fixo no front, pois MP gerencia isso
  const finalPrice = subtotal + shippingCost;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const calculateShippingOptions = (state: string) => {
    if (!hasPhysicalItems) {
      const digitalOption = { id: 'digital', name: 'Entrega Digital', price: 0, deliveryTime: 'Imediato' };
      setShippingOptions([digitalOption]);
      setSelectedShipping(digitalOption);
      return;
    }

    setIsCalculatingShipping(true);

    setTimeout(() => {
      const uf = state.toUpperCase();
      let basePrice = 22.90;

      const regions = {
        sudeste: ['SP', 'RJ', 'MG', 'ES'],
        sul: ['PR', 'SC', 'RS'],
        centro: ['MS', 'MT', 'GO', 'DF'],
        nordeste: ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'],
        norte: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO']
      };

      if (regions.sudeste.includes(uf)) basePrice = 14.50;
      else if (regions.sul.includes(uf)) basePrice = 24.90;
      else if (regions.centro.includes(uf)) basePrice = 28.00;
      else if (regions.nordeste.includes(uf)) basePrice = 38.50;
      else if (regions.norte.includes(uf)) basePrice = 45.90;

      const options: ShippingOption[] = [
        { id: 'pickup', name: 'Retirar na Igreja', price: 0, deliveryTime: 'Combinar horário' },
        { id: 'cerejeiras', name: 'Entrega em Cerejeiras', price: 6.00, deliveryTime: '1 dia útil' },
        { id: 'pac', name: 'Correios PAC', price: basePrice, deliveryTime: '8 a 15 dias úteis' },
        { id: 'sedex', name: 'Correios SEDEX', price: basePrice * 1.75, deliveryTime: '2 a 5 dias úteis' },
        { id: 'jadlog', name: 'Jadlog Econômico', price: basePrice * 0.9, deliveryTime: '10 a 18 dias úteis' }
      ];

      setShippingOptions(options);
      setSelectedShipping(options[0]);
      setIsCalculatingShipping(false);
    }, 1200);
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let zipValue = e.target.value.replace(/\D/g, '');
    if (zipValue.length > 5) zipValue = zipValue.substring(0, 5) + '-' + zipValue.substring(5, 8);

    setFormData(prev => ({ ...prev, zip: zipValue }));

    const rawZip = zipValue.replace(/\D/g, '');
    if (rawZip.length === 8) {
      setIsFetchingCEP(true);
      setShippingOptions([]);
      setSelectedShipping(null);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawZip}/json/`);
        const data = await response.json();

        if (data.erro) {
          alert('CEP não encontrado. Por favor, verifique os números digitados.');
        } else {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
          calculateShippingOptions(data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsFetchingCEP(false);
      }
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ['email', 'phone', 'firstName', 'lastName', 'zip', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      return alert('Por favor, preencha todos os campos obrigatórios para prosseguir.');
    }
    if (hasPhysicalItems && !selectedShipping) {
      return alert('Por favor, aguarde o cálculo ou selecione um método de entrega.');
    }
    setStep('payment');
  };

  const handleFinishPurchase = async () => {
    setIsProcessing(true);
    console.log("Iniciando checkout Mercado Pago...");

    const fullAddress = `${formData.street}, ${formData.number}${formData.complement ? ' - ' + formData.complement : ''}, ${formData.neighborhood}`;

    const newSale: Sale = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: fullAddress,
      customerCity: `${formData.city} / ${formData.state}`,
      customerZip: formData.zip,
      date: new Date().toLocaleDateString('pt-BR'),
      method: 'Mercado Pago',
      status: 'Aguardando',
      amount: finalPrice,
      shippingCost: shippingCost,
      shippingMethod: selectedShipping?.name,
      items: checkoutItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      await addSale(newSale, user?.id);

      console.log("Venda salva, chamando Edge Function...");

      // Use direct import if possible, or dynamic if keeping file structure
      const { supabase } = await import('../services/supabaseClient');

      const { data, error } = await supabase.functions.invoke('mp-checkout', {
        body: {
          order: newSale,
          returnUrl: window.location.origin
        }
      });

      console.log("Resposta Edge Function:", data, error);

      if (error) throw error;

      if (data && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não gerado.');
      }

    } catch (error: any) {
      console.error('Erro detalhado checkout:', error);
      alert(`Erro: ${error.message || JSON.stringify(error)}`);
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#f8f7f6] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
        <div className="size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white">
          <span className="material-symbols-outlined text-5xl font-black">verified</span>
        </div>
        <h1 className="text-4xl font-black text-stone-800 mb-4">Pedido Realizado!</h1>
        <p className="text-stone-500 max-w-md mb-8">
          Tudo certo, <b>{formData.firstName}</b>! Enviamos os detalhes para <b>{formData.email}</b>.
          {hasPhysicalItems ? ` Seu pedido será enviado via ${selectedShipping?.name}.` : ' Seus ebooks já estão disponíveis para download no seu e-mail.'}
        </p>
        <button onClick={() => navigate('/')} className="px-12 py-5 bg-rhema-dark text-white font-black rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-xl">
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f7f6] min-h-screen font-display text-[#1a150e]">
      <header className="sticky top-0 z-50 w-full border-b border-[#e6dcd1] bg-white/90 backdrop-blur-md">
        <div className="px-6 lg:px-40 py-4 mx-auto max-w-[1440px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rhema-primary text-3xl">menu_book</span>
            <h1 className="text-xl font-bold tracking-tight uppercase">Ebook Rhema</h1>
          </Link>
          <div className="flex items-center gap-2 text-rhema-primary bg-rhema-primary/10 px-4 py-1.5 rounded-full border border-rhema-primary/20">
            <span className="material-symbols-outlined text-[18px]">security</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Ambiente Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-40 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-7 space-y-12">
            {step === 'details' ? (
              <form onSubmit={handleNextStep} className="space-y-10 animate-in fade-in slide-in-from-left-4">
                <section className="space-y-6">
                  <h2 className="text-2xl font-black border-b border-[#e6dcd1] pb-2 flex items-center gap-3">
                    <span className="size-8 bg-rhema-primary text-white rounded-lg flex items-center justify-center text-sm">1</span>
                    Seus Dados
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input required className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none transition-all" placeholder="E-mail para recebimento" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <input required className="p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Nome" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    <input required className="p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Sobrenome" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    <input required className="p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="WhatsApp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#e6dcd1] pb-2">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <span className="size-8 bg-rhema-primary text-white rounded-lg flex items-center justify-center text-sm">2</span>
                      Entrega
                    </h2>
                    {isFetchingCEP && (
                      <div className="flex items-center gap-2 text-rhema-primary animate-pulse">
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Validando CEP...</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <input
                        required
                        className="w-full p-4 rounded-xl border-2 border-rhema-primary/20 focus:border-rhema-primary focus:ring-2 focus:ring-rhema-primary/10 outline-none bg-white font-bold text-stone-700"
                        placeholder="CEP"
                        value={formData.zip}
                        onChange={handleCEPChange}
                        maxLength={9}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <input
                        required
                        className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none"
                        placeholder="Endereço"
                        value={formData.street}
                        onChange={e => setFormData({ ...formData, street: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input required className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Número" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                    </div>
                    <div className="md:col-span-4">
                      <input className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Complemento" value={formData.complement} onChange={e => setFormData({ ...formData, complement: e.target.value })} />
                    </div>

                    <div className="md:col-span-2">
                      <input required className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Bairro" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <input required className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none" placeholder="Cidade" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="md:col-span-1">
                      <input required className="w-full p-4 rounded-xl border border-[#e6dcd1] focus:ring-2 focus:ring-rhema-primary/20 outline-none uppercase text-center font-bold" placeholder="UF" maxLength={2} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                  </div>
                </section>

                {(isCalculatingShipping || shippingOptions.length > 0) && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-2xl font-black border-b border-[#e6dcd1] pb-2 flex items-center gap-3">
                      <span className="size-8 bg-rhema-primary text-white rounded-lg flex items-center justify-center text-sm">3</span>
                      Opções de Envio
                    </h2>

                    {isCalculatingShipping ? (
                      <div className="p-12 bg-white rounded-[2rem] border border-dashed border-stone-200 flex flex-col items-center justify-center gap-4">
                        <div className="size-12 border-4 border-rhema-primary/20 border-t-rhema-primary rounded-full animate-spin"></div>
                        <p className="text-stone-400 font-black uppercase tracking-widest text-[10px]">Consultando transportadoras...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {shippingOptions.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => setSelectedShipping(option)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden group ${selectedShipping?.id === option.id
                              ? 'border-rhema-primary bg-rhema-primary/5 shadow-xl'
                              : 'border-[#e6dcd1] bg-white hover:border-stone-300'
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-black text-stone-800 uppercase tracking-tighter text-xs">{option.name}</span>
                              <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedShipping?.id === option.id ? 'border-rhema-primary bg-rhema-primary' : 'border-stone-200'
                                }`}>
                                {selectedShipping?.id === option.id && <span className="material-symbols-outlined text-white text-[12px] font-black">check</span>}
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-stone-400">R$</span>
                              <span className="text-2xl font-black text-stone-900">{option.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-stone-500">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span className="text-[10px] font-bold uppercase">{option.deliveryTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <button
                  type="submit"
                  disabled={isCalculatingShipping || !formData.zip || (hasPhysicalItems && !selectedShipping)}
                  className="w-full py-6 bg-rhema-primary text-white font-black rounded-2xl shadow-2xl shadow-rhema-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:grayscale text-xl flex items-center justify-center gap-3"
                >
                  Ir para Pagamento
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <section className="space-y-6">
                  <h2 className="text-2xl font-black border-b border-[#e6dcd1] pb-2 flex items-center gap-3">
                    <span className="size-8 bg-rhema-primary text-white rounded-lg flex items-center justify-center text-sm">4</span>
                    Pagamento
                  </h2>

                  {/* Aviso do Mercado Pago */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm mb-6 border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600">lock</span>
                    <p className="leading-tight">
                      Para sua segurança, o pagamento será processado inteiramente pelo ambiente protegido do <strong>Mercado Pago</strong>.
                    </p>
                    <img
                      src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.5/mercadopago/logo__small@2x.png"
                      alt="Mercado Pago"
                      className="h-6 ml-auto opacity-80"
                    />
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e6dcd1] overflow-hidden shadow-sm">
                    <div className="p-8 text-center space-y-4">
                      <div className="size-20 bg-rhema-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-rhema-primary text-4xl">payments</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-800">Pronto para finalizar?</h3>
                      <p className="text-stone-500 max-w-sm mx-auto">
                        Ao clicar no botão abaixo, você será redirecionado para o <b>Mercado Pago</b>, onde poderá escolher pagar com <b>Pix, Cartão de Crédito ou Boleto</b>.
                      </p>
                    </div>
                  </div>
                </section>
                <div className="flex gap-4">
                  <button onClick={() => setStep('details')} className="px-10 py-6 border-2 border-stone-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-50 transition-colors text-stone-500">Voltar</button>
                  <button
                    onClick={handleFinishPurchase}
                    disabled={isProcessing}
                    className="flex-1 py-6 bg-[#009EE3] text-white font-black rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-xl flex flex-row items-center justify-center gap-3 leading-tight uppercase tracking-wide"
                  >
                    Pagar com Mercado Pago
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-rhema-light/30 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-12 border border-white shadow-xl sticky top-32">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-rhema-primary">shopping_bag</span>
                Itens do Pedido
              </h3>
              <div className="space-y-6 max-h-[350px] overflow-y-auto p-4 custom-scrollbar">
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img src={item.coverUrl} className="h-20 w-14 object-cover rounded-md shadow-sm border border-white" alt="" />
                        <span className="absolute -top-2 -right-2 size-5 bg-rhema-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{item.quantity}</span>
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 line-clamp-1 text-sm leading-tight mb-0.5">{item.title}</p>
                        <p className="text-xs text-stone-500 font-medium mb-1.5">{item.author || 'Messias Tavares'}</p>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${item.format === 'digital' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {item.format === 'digital' ? 'devices' : 'local_shipping'}
                          </span>
                          {item.format === 'digital' ? 'Digital' : 'Físico'}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-stone-600 text-sm whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-stone-200/50 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-black text-stone-800">R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm animate-in slide-in-from-top-2">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                    Entrega {selectedShipping ? `(${selectedShipping.name})` : ''}
                  </span>
                  <span className="font-black text-stone-800">
                    {hasPhysicalItems ? (selectedShipping ? (selectedShipping.price === 0 ? 'GRÁTIS' : `R$ ${selectedShipping.price.toFixed(2)}`) : 'Frete a combinar') : 'Grátis'}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-black animate-in fade-in">
                    <span className="uppercase tracking-widest text-[10px]">Desconto Pix</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-stone-200 mt-6">
                  <span className="text-lg font-black text-stone-900 uppercase tracking-tighter">Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-rhema-primary tracking-tighter">R$ {finalPrice.toFixed(2)}</span>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Impostos inclusos</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3">
                <a href="https://curt.link/livro21DIE" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-xl border border-dashed border-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  Precisa de ajuda? Fale conosco
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
