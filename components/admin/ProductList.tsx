import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Search, Edit2, Save, X, ShoppingBag, Plus, Star } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export default function ProductList({ products, onUpdateProducts }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    
    const updated = products.map(p => 
      p.id === editingProduct ? { ...p, ...editForm } as Product : p
    );
    onUpdateProducts(updated);
    
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
            
           <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none shadow-sm"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
                <Link 
                    to="/admin/products/new"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo
                </Link>
           </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-all">
            {editingProduct === product.id ? (
               <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Editando</span>
                </div>
                
                {/* Name */}
                <div>
                    <label className="text-xs text-slate-500 font-bold">Nombre</label>
                    <input 
                        className="w-full text-sm border p-1 rounded focus:ring-1 focus:ring-emerald-500 outline-none" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))}
                    />
                </div>

                {/* Category & Price Row */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 font-bold">Categoría</label>
                        <select 
                            className="w-full text-sm border p-1 rounded focus:ring-1 focus:ring-emerald-500 outline-none" 
                            value={editForm.category || 'despensa'} 
                            onChange={e => setEditForm(prev => ({...prev, category: e.target.value}))}
                        >
                            <option value="despensa">Despensa</option>
                            <option value="aseo hogar">Aseo Hogar</option>
                            <option value="cuidado personal">Cuidado</option>
                            <option value="mecato">Mecato</option>
                        </select>
                    </div>
                     <div className="w-20">
                        <label className="text-xs text-slate-500 font-bold">Precio</label>
                        <input 
                            type="number"
                            className="w-full text-sm border p-1 rounded focus:ring-1 focus:ring-emerald-500 outline-none" 
                            value={editForm.price || 0} 
                            onChange={e => setEditForm(prev => ({...prev, price: Number(e.target.value)}))}
                        />
                    </div>
                </div>

                 {/* Stock & Golden Row */}
                 <div className="flex gap-2 items-center">
                    <div className="w-20">
                        <label className="text-xs text-slate-500 font-bold">Stock</label>
                         <input 
                            type="number"
                            className="w-full text-sm border p-1 rounded focus:ring-1 focus:ring-emerald-500 outline-none" 
                            value={editForm.stock || 0} 
                            onChange={e => setEditForm(prev => ({...prev, stock: Number(e.target.value)}))}
                        />
                    </div>
                     <div className="flex-1 flex items-center justify-end h-full">
                         <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-2 py-1.5 rounded border border-amber-100 w-full justify-center hover:bg-amber-100 transition-colors">
                             <input 
                                type="checkbox" 
                                className="accent-amber-500 w-4 h-4"
                                checked={editForm.isGolden || false}
                                onChange={e => setEditForm(prev => ({...prev, isGolden: e.target.checked}))}
                             />
                             <span className="text-xs font-bold text-amber-700 flex items-center"><Star size={12} className="mr-1 fill-amber-500"/> Golden</span>
                         </label>
                    </div>
                </div>

                 {/* Image */}
                 <div>
                    <label className="text-xs text-slate-500 font-bold">URL Imagen</label>
                    <input 
                        className="w-full text-xs border p-1 rounded focus:ring-1 focus:ring-emerald-500 outline-none" 
                        value={editForm.image || ''} 
                        placeholder="https://..."
                        onChange={e => setEditForm(prev => ({...prev, image: e.target.value}))}
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={handleSaveProduct}
                        className="flex-1 bg-emerald-600 text-white rounded p-1.5 text-xs font-bold flex justify-center items-center hover:bg-emerald-700"
                    >
                        <Save size={14} className="mr-1" /> Guardar
                    </button>
                    <button 
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-100 text-slate-600 rounded p-1.5 text-xs font-bold flex justify-center items-center hover:bg-slate-200"
                    >
                        <X size={14} className="mr-1" /> Cancelar
                    </button>
                </div>
              </div>
            ) : (
               <>
                <div className="h-40 bg-slate-100 relative group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
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
                  {product.isGolden && (
                    <div className="absolute top-0 left-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center z-10">
                        <Star size={10} className="mr-1 fill-white" /> GOLDEN
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between relative bg-white">
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
