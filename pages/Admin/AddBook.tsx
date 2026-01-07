
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { supabase } from '../../services/supabaseClient';
import { Book } from '../../types';

// Dynamic import for ReactQuill to avoid build issues


export const AddBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addBook, updateBook, books } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [uploadingEbook, setUploadingEbook] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: 'Messias Tavares',
    isbn: '',
    description: '',
    price: '',
    category: 'Vida Cristã',
    status: 'active' as const,
    format: 'physical' as 'physical' | 'digital',
    stock: '50',
    isPurchaseBlocked: false,
    pdfUrl: '' // PDF URL State
  });

  // Edit Mode: Populate form if ID is present
  useEffect(() => {
    if (id && books.length > 0) {
      const bookToEdit = books.find(b => b.id === id);
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title,
          author: bookToEdit.author,
          isbn: bookToEdit.isbn,
          description: bookToEdit.description,
          price: bookToEdit.price.toString().replace('.', ','),
          category: bookToEdit.category,
          status: bookToEdit.status as 'active',
          format: bookToEdit.format as 'physical' | 'digital',
          stock: bookToEdit.stock?.toString() || '0',
          isPurchaseBlocked: bookToEdit.isPurchaseBlocked || false,
          pdfUrl: bookToEdit.pdfUrl || ''
        });
        setImagePreview(bookToEdit.coverUrl);
      }
    }
  }, [id, books]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEbook(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('ebooks')
        .upload(filePath, file);

      if (error) throw error;

      // For private buckets, we store the path to generate signed URLs later
      const pdfPath = data.path;
      setFormData({ ...formData, pdfUrl: pdfPath });
      alert('PDF enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading ebook:', error);
      alert('Erro ao enviar PDF.');
    } finally {
      setUploadingEbook(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return alert('Preencha os campos obrigatórios.');

    setIsLoading(true);

    // Prepare Book Object (Common fields)
    const bookData: Partial<Book> = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      format: formData.format,
      stock: formData.format === 'physical' ? parseInt(formData.stock) : undefined,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')),
      isbn: formData.isbn || 'N/A',
      coverUrl: imagePreview || 'https://picsum.photos/seed/newbook/400/600',
      isPurchaseBlocked: formData.isPurchaseBlocked,
      pdfUrl: formData.pdfUrl
    };

    try {
      if (id) {
        // Update Existing
        await updateBook(id, bookData);
      } else {
        // Create New
        const newBook = { ...bookData, id: Date.now().toString() } as Book; // ID is ignored by DB usually or handled in context
        await addBook(newBook);
      }

      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin/livros');
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert('Erro ao salvar.');
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">{id ? 'Editar Livro' : 'Adicionar Novo Livro'}</h1>
          <p className="text-stone-500">Configure se o item é físico ou digital.</p>
        </div>
        <button type="submit" disabled={isLoading} className="px-8 py-4 bg-rhema-primary text-white font-bold rounded-xl shadow-lg">
          {isLoading ? 'Salvando...' : 'Salvar Livro'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Formato do Livro</label>
                <div className="flex gap-4">
                  {['physical', 'digital'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormData({ ...formData, format: f as any })}
                      className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${formData.format === f ? 'border-rhema-primary bg-rhema-primary/5 text-rhema-primary' : 'border-stone-100 text-stone-400'
                        }`}
                    >
                      {f === 'physical' ? 'Livro Físico' : 'Ebook'}
                    </button>
                  ))}
                </div>
              </div>
              {formData.format === 'physical' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-sm font-bold text-stone-700">Estoque Inicial</label>
                  <input className="w-full p-4 bg-stone-50 border-none rounded-xl" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              )}

              {formData.format === 'digital' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-sm font-bold text-stone-700">Arquivo do Ebook (PDF)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 p-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 text-stone-500 font-bold text-sm">
                      <span className="material-symbols-outlined">upload_file</span>
                      {uploadingEbook ? 'Enviando...' : (formData.pdfUrl ? 'Alterar PDF' : 'Enviar PDF')}
                      <input type="file" className="hidden" accept="application/pdf" onChange={handleEbookUpload} disabled={uploadingEbook} />
                    </label>
                    {formData.pdfUrl && (
                      <div className="size-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                    )}
                  </div>
                  {formData.pdfUrl && <p className="text-xs text-green-600 font-bold">Arquivo pronto para entrega.</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Título</label>
              <input required className="w-full p-4 bg-stone-50 border-none rounded-xl" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Descrição (Sinopse)</label>
              <textarea
                required
                className="w-full p-4 bg-stone-50 border-none rounded-xl min-h-[150px] resize-y"
                placeholder="Escreva uma descrição detalhada sobre o livro..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl">
              <div>
                <p className="font-bold text-stone-700">Bloquear Compra (Em Breve)</p>
                <p className="text-xs text-stone-400">Impede a compra e exibe botão de lista de espera.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isPurchaseBlocked} onChange={(e) => setFormData({ ...formData, isPurchaseBlocked: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rhema-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rhema-primary"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">ISBN</label>
              <input className="w-full p-4 bg-stone-50 border-none rounded-xl" placeholder="978-3-16-148410-0" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Preço</label>
                <input required className="w-full p-4 bg-stone-50 border-none rounded-xl" placeholder="29,90" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Categoria</label>
                <input
                  list="categories"
                  className="w-full p-4 bg-stone-50 border-none rounded-xl"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Selecione ou digite..."
                />
                <datalist id="categories">
                  <option value="Vida Cristã" />
                  <option value="Teologia" />
                  <option value="Saúde Emocional" />
                  <option value="Devocional" />
                  <option value="Bíblia" />
                </datalist>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
            <h3 className="font-bold mb-6">Capa</h3>
            <label className="aspect-[2/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden relative group">
              {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-stone-300">add_photo_alternate</span>}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
