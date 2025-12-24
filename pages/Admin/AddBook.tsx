
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Book } from '../../types';

export const AddBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addBook, updateBook, books } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: 'Messias Tavares',
    isbn: '',
    description: '',
    price: '',
    category: 'Vida Cristã',
    status: 'active' as const,
    format: 'physical' as 'physical' | 'digital',
    stock: '50'
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
          stock: bookToEdit.stock?.toString() || '0'
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
      status: formData.status,
      coverUrl: imagePreview || 'https://picsum.photos/seed/newbook/400/600',
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Título</label>
              <input required className="w-full p-4 bg-stone-50 border-none rounded-xl" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
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
