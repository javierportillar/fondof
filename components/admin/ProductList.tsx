import React, { useState } from 'react';
import { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../constants';
import { Search, Edit2, Save, X, ShoppingBag } from 'lucide-react';

export default function ProductList() {
  const [localProducts, setLocalProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const filteredProducts = localProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    
    setLocalProducts(prev => prev.map(p => 
      p.id === editingProduct ? { ...p, ...editForm } as Product : p
    ));
    setEditingProduct(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <h2 className="text-xl font-bold text-slate-800 flex items-center">
               <ShoppingBag className="mr-2" size={24} />
               Catálogo de Productos
           </h2>
            <div className="relative w-full md:w-80">
                <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none shadow-sm"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-all">
            {editingProduct === product.id ? (
               <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Editando</span>
                </div>
                <div>
                    <label className="text-xs text-slate-500">Nombre</label>
                    <input 
                        className="w-full text-sm border p-1 rounded" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                    />
                </div>
                 <div>
                    <label className="text-xs text-slate-500">Categoría</label>
                    <input 
                        className="w-full text-sm border p-1 rounded" 
                        value={editForm.category || ''} 
                        onChange={e => setEditForm(prev => ({...prev, category: e.target.value}))}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">Precio</label>
                    <input 
                        type="number"
                        className="w-full text-sm border p-1 rounded" 
                        value={editForm.price || 0} 
                        onChange={e => setEditForm(prev => ({...prev, price: Number(e.target.value)}))}
                    />
                </div>
                <div className="flex gap-2 mt-auto">
                    <button 
                        onClick={handleSaveProduct}
                        className="flex-1 bg-emerald-600 text-white rounded p-2 text-sm flex justify-center items-center hover:bg-emerald-700"
                    >
                        <Save size={16} className="mr-1" /> Guardar
                    </button>
                    <button 
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-100 text-slate-600 rounded p-2 text-sm flex justify-center items-center hover:bg-slate-200"
                    >
                        <X size={16} className="mr-1" /> Cancelar
                    </button>
                </div>
              </div>
            ) : (
               <>
                <div className="h-40 bg-slate-100 relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                     <button 
                        onClick={() => handleEditProduct(product)}
                        className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:text-emerald-600 transition-colors"
                     >
                         <Edit2 size={16} />
                     </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm capitalize">
                        {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-1" title={product.name}>{product.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-lg font-bold text-emerald-600">${product.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
