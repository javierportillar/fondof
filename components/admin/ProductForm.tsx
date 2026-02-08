import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product } from '../../types';
import { ArrowLeft, Save, ShoppingBag, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
}

export default function ProductForm({ onAddProduct }: ProductFormProps) {
  const navigate = useNavigate();
  const [useUrl, setUseUrl] = useState(true);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Default image if empty
    let imageUrl = formData.get('image') as string;
    if (!imageUrl || imageUrl.trim() === '') {
        imageUrl = 'https://via.placeholder.com/200x200?text=No+Image';
    }

    const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        description: formData.get('description') as string,
        image: imageUrl,
        rating: 5.0, // Default for new products
        isGolden: formData.get('isGolden') === 'on'
    };

    onAddProduct(newProduct);
    navigate('/admin/products');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Link to="/admin/products" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Agregar Nuevo Producto</h2>
                <p className="text-sm text-slate-500">Añade un artículo a la Tienda Solidaria</p>
            </div>
         </div>

         <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Producto</label>
                    <input name="name" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: Arroz Diana 500g" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">Categoría</label>
                            <button 
                                type="button" 
                                onClick={() => setIsNewCategory(!isNewCategory)}
                                className="text-xs text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
                            >
                                {isNewCategory ? 'Seleccionar existente' : '+ Nueva categoría'}
                            </button>
                        </div>
                        {isNewCategory ? (
                            <input 
                                name="category" 
                                type="text" 
                                required 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                placeholder="Nombre de la nueva categoría" 
                                autoFocus
                            />
                        ) : (
                            <select name="category" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                <option value="despensa">Despensa</option>
                                <option value="aseo hogar">Aseo Hogar</option>
                                <option value="cuidado personal">Cuidado Personal</option>
                                <option value="mecato">Mecato</option>
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Precio ($)</label>
                        <input name="price" type="number" required min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Imagen del Producto</label>
                    
                    <div className="flex gap-4 mb-4 text-sm">
                        <button type="button" onClick={() => setUseUrl(true)} className={`pb-1 border-b-2 transition-colors ${useUrl ? 'border-emerald-500 font-bold text-emerald-600' : 'border-transparent text-slate-400'}`}>URL de Imagen / Ruta</button>
                    </div>

                    {useUrl ? (
                         <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input 
                                name="image" 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                placeholder="https://ejemplo.com/imagen.jpg o assets/producto.jpg" 
                            />
                            <p className="text-xs text-slate-400 mt-2">Puedes usar una URL de internet o una ruta local relativa (ej: /assets/arroz.png).</p>
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <ImageIcon size={48} className="mb-2" />
                            <p>Subida de archivos no disponible en esta demo.</p>
                        </div>
                    )}
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Stock Inicial</label>
                         <input name="stock" type="number" required min="0" defaultValue="50" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 w-full">
                            <input name="isGolden" type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600" />
                            <div>
                                <span className="block font-bold text-slate-700">Producto Golden</span>
                                <span className="text-xs text-slate-500">Aparecerá destacado en la tienda</span>
                            </div>
                        </label>
                    </div>
                 </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                    <textarea name="description" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="Detalles del producto..."></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                     <Link 
                        to="/admin/products"
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center"
                     >
                        Cancelar
                     </Link>
                     <button 
                        type="submit" 
                        className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center"
                     >
                        <Save size={20} className="mr-2" />
                        Guardar Producto
                     </button>
                </div>
            </form>
         </div>
      </div>
    </div>
  );
}
