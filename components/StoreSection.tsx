import React, { useEffect, useState } from 'react';
import { Product, UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Star, Plus, Minus, Trash2, X, MessageCircle, ShoppingBag, Sparkles, Heart, Cookie, LayoutGrid } from 'lucide-react';
import { Drawer } from 'vaul';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';

interface StoreSectionProps {
  userId?: string;
  profile?: UserProfile;
  onLogout?: () => Promise<void> | void;
}

export default function StoreSection({ userId, profile, onLogout }: StoreSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestName, setSuggestName] = useState('');
  const [suggestImage, setSuggestImage] = useState<string | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState<string | null>(null);
  const [isHuman, setIsHuman] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Configuración del número de WhatsApp (Reemplazar con el número real de la cooperativa)
  const WHATSAPP_NUMBER = "573105830555"; 
  const categories = [
    { id: 'all', name: 'Todo', icon: LayoutGrid },
    { id: 'golden', name: 'Golden', icon: Star, isGolden: true },
    { id: 'despensa', name: 'Despensa', icon: ShoppingBag },
    { id: 'aseo hogar', name: 'Aseo Hogar', icon: Sparkles },
    { id: 'cuidado personal', name: 'Cuidado Personal', icon: Heart },
    { id: 'mecato', name: 'Mecato', icon: Cookie },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'golden') return matchesSearch && p.isGolden;
    return matchesSearch && p.category.toLowerCase() === selectedCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const gridVariants = {
    show: { transition: { staggerChildren: 0.06 } },
    hidden: {}
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
  };

  const sendOrderToWhatsApp = async () => {
    if (cart.length === 0) return;

    let message = `Hola *Fondo Fortuna*, quisiera realizar el siguiente pedido de la Tienda Fondo Fortuna:%0A%0A`;

    cart.forEach(item => {
      const subtotal = item.product.price * item.qty;
      message += `▪️ ${item.qty}x ${item.product.name} - $${subtotal.toLocaleString()}%0A`;
    });

    message += `%0A*TOTAL A PAGAR: $${cartTotal.toLocaleString()}*`;
    message += `%0A%0AMuchas gracias.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    const itemsPayload = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.qty,
      price: item.product.price
    }));

    // Abrir WhatsApp inmediatamente para evitar bloqueo de popups en móvil
    window.location.href = url;

    // Registrar el pedido en segundo plano
    supabase
      .from('orders')
      .insert([{
        user_id: userId ?? null,
        customer_name: profile?.name || 'Cliente WhatsApp',
        customer_phone: profile?.phoneNumber || null,
        channel: 'whatsapp',
        status: 'pending',
        items: itemsPayload
      }])
      .then(({ error }) => {
        if (error) {
          console.error('Error creando pedido', error);
        } else {
          setCart([]);
        }
      })
      .catch(err => {
        console.error('Error creando pedido', err);
      });
  };

  const handleSuggestionImage = (file: File | null) => {
    if (!file) {
      setSuggestImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSuggestImage(String(reader.result));
      setSuggestError(null);
    };
    reader.onerror = () => setSuggestError('No se pudo leer la imagen.');
    reader.readAsDataURL(file);
  };

  const submitSuggestion = async () => {
    if (!suggestName.trim() || !suggestImage) {
      setSuggestError('Debes escribir el nombre y subir una imagen.');
      return;
    }
    if (!isHuman) {
      setSuggestError('Confirma que eres humano.');
      return;
    }
    try {
      setSuggesting(true);
      setSuggestError(null);
      setSuggestSuccess(null);
      const { error } = await supabase
        .from('product_suggestions')
        .insert([{
          user_id: userId ?? null,
          product_name: suggestName.trim(),
          image_base64: suggestImage
        }]);
      if (error) throw error;
      setSuggestName('');
      setSuggestImage(null);
      setIsHuman(false);
      setSuggestSuccess('Gracias por tu sugerencia. La revisaremos pronto.');
    } catch (e: any) {
      setSuggestError(e.message || 'No se pudo enviar la sugerencia.');
    } finally {
      setSuggesting(false);
    }
  };

  const registerPurchase = async () => {
    if (!userId) {
      alert('Debes iniciar sesión para registrar la compra.');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    const total = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    try {
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert([{ user_id: userId, total_amount: total }])
        .select()
        .single();
      if (error) throw error;

      const itemsPayload = cart.map(c => ({
        purchase_id: purchase.id,
        product_id: c.product.id,
        quantity: c.qty,
        unit_price: c.product.price,
        subtotal: c.product.price * c.qty
      }));
      const { error: itemsError } = await supabase.from('purchase_items').insert(itemsPayload);
      if (itemsError) throw itemsError;
      alert('Compra registrada con éxito');
      setCart([]);
    } catch (err: any) {
      console.error('Error registrando compra', err);
      alert('No se pudo registrar la compra.');
    }
  };

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          image: p.image,
          stock: p.stock,
          rating: Number(p.rating ?? 0),
          description: p.description,
          isGolden: p.is_golden
        })) as Product[];
        setProducts(mapped);
      } catch (e: any) {
        setError(e.message || 'No se pudieron cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tienda Fondo Fortuna</h1>
          <p className="text-slate-500">Productos de la canasta familiar a precios justos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Drawer.Root open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
            <Drawer.Trigger asChild>
              <button 
                className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-6 py-3 rounded-xl items-center shadow-md group"
              >
                  <div className="relative">
                    <ShoppingCart size={22} className="mr-3 group-hover:scale-110 transition-transform" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-emerald-600">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium opacity-90">Tu Carrito</span>
                    <span className="font-bold text-lg leading-none">${cartTotal.toLocaleString()}</span>
                  </div>
              </button>
            </Drawer.Trigger>

          {!profile && (
            <Link to="/login" className="px-4 py-2 border border-emerald-600 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50">
              Ingresar
            </Link>
          )}
          {profile && (
            <>
              {profile.role === 'ADMIN' ? (
                <Link to="/admin" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Panel Admin</Link>
              ) : (
                <Link to="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Mi Cuenta</Link>
              )}
              <button onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-700">Cerrar sesión</button>
            </>
          )}
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" />
            <Drawer.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl">
              <div className="relative w-full h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <ShoppingCart className="mr-2 text-emerald-600" size={24} /> 
                    Tu Pedido
                  </h2>
                  <Drawer.Close asChild>
                    <button 
                      className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                      <X size={24} />
                    </button>
                  </Drawer.Close>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <ShoppingCart size={28} />
                      </div>
                      <p className="text-slate-500 font-medium">Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {cart.map(item => (
                        <motion.div
                          key={item.product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          className="flex gap-4 items-center bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
                        >
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-20 h-20 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-800">{item.product.name}</h4>
                              <button 
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-emerald-600 font-bold mb-2">${item.product.price.toLocaleString()}</p>
                            
                            <div className="flex items-center bg-slate-100 rounded-lg w-fit">
                              <button 
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="p-1.5 hover:text-emerald-600 disabled:opacity-50"
                                disabled={item.qty <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="p-1.5 hover:text-emerald-600"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-2 text-slate-500 text-sm">
                      <span>Subtotal ({cartItemCount} items)</span>
                      <span>${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-lg text-slate-800">Total a Pagar</span>
                      <span className="font-bold text-2xl text-emerald-600">${cartTotal.toLocaleString()}</span>
                    </div>
                    
                    <button 
                      onClick={sendOrderToWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={24} />
                      Enviar Pedido por WhatsApp
                    </button>
                    <button 
                      onClick={registerPurchase}
                      className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      Registrar compra
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">
                      Serás redirigido a WhatsApp para confirmar tu pedido con un asesor.
                    </p>
                  </div>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
          </Drawer.Root>
        </div>
      </header>

      {/* Mobile fixed cart bar */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30">
        <Drawer.Root open={isCartOpen} onOpenChange={setIsCartOpen} direction="bottom">
          <Drawer.Trigger asChild>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-emerald-600">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="font-semibold">Ver carrito</span>
              </div>
              <span className="font-bold">${cartTotal.toLocaleString()}</span>
            </button>
          </Drawer.Trigger>
        </Drawer.Root>
      </div>

      {/* Search Bar */}
      <section aria-labelledby="search-products" className="relative max-w-md">
        <h2 id="search-products" className="sr-only">Buscar productos</h2>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar arroz, aceite, leche..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      {/* Category Filters */}
      <section aria-labelledby="category-filters">
      <h2 id="category-filters" className="sr-only">Filtrar por categoría</h2>
      <LayoutGroup>
        <div className="grid grid-cols-3 gap-2 pb-2 sm:flex sm:flex-wrap sm:gap-3 sm:overflow-x-auto scrollbar-hide">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="relative w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap border border-slate-200 overflow-hidden transition-all bg-white text-[11px] sm:text-sm"
              >
                {isSelected && (
                  <motion.span
                    layoutId="pill"
                    className={`absolute inset-0 rounded-full ${category.isGolden ? 'bg-amber-400' : 'bg-emerald-600'}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className={isSelected ? 'text-white' : category.isGolden ? 'text-amber-500' : 'text-slate-600'} />
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-600'}`}>{category.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      </section>

      {/* Product Grid */}
      <section aria-labelledby="products-grid">
      <h2 id="products-grid" className="sr-only">Productos</h2>
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {loading && (
        <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold uppercase tracking-wide text-[11px]">CARGANDO</span>
          <span className="text-slate-400">productos...</span>
        </div>
      )}

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
      >
        {filteredProducts.map(product => {
          const inCart = cart.find(c => c.product.id === product.id);
          return (
            <motion.div 
              key={product.id} 
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group relative ${
                product.isGolden ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'
              }`}
            >
              {product.isGolden && (
                <div className="absolute top-0 left-0 z-10 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm flex items-center">
                  <Star size={10} className="mr-1 fill-white" /> GOLDEN
                </div>
              )}

              <div className="relative h-40 sm:h-48 overflow-hidden bg-slate-100">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm text-slate-700 flex items-center">
                  <Star size={12} className="text-yellow-400 mr-1" fill="currentColor" />
                  {product.rating}
                </div>
                {inCart && (
                  <div className="absolute bottom-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    En carrito: {inCart.qty}
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <span className="text-[10px] sm:text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wide">{product.category}</span>
                <h3 className="font-bold text-slate-800 text-lg sm:text-xl mb-1 leading-tight">{product.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-2 flex-1">{product.description || `Stock: ${product.stock}`}</p>
                <div className="h-px w-full bg-slate-200/70 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">${product.price.toLocaleString()}</span>
                  <motion.button 
                    onClick={() => addToCart(product)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.03 }}
                    className={`p-2.5 rounded-xl transition-colors shadow-sm active:scale-95 transform text-white ${
                      product.isGolden ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-emerald-600'
                    }`}
                  >
                    <Plus size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg font-medium">No encontramos productos</p>
            <p className="text-slate-400 text-sm">Intenta con otro término de búsqueda o categoría</p>
        </div>
      )}
      </section>

      {/* Product Suggestions */}
      <section aria-labelledby="product-suggestions" className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 id="product-suggestions" className="text-lg font-bold text-slate-800">¿No encuentras un producto?</h2>
        <p className="text-slate-500 text-sm mt-1">Sugiere un producto con su nombre e imagen.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del producto</label>
            <input
              type="text"
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ej: Leche descremada 1L"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Imagen</label>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {isMobile && (
                <label className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600">📷</span>
                  Tomar foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleSuggestionImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
              <label className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600">🖼️</span>
                {isMobile ? 'Elegir de galería' : 'Elegir archivo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSuggestionImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {suggestImage && (
          <div className="mt-3 flex items-center gap-3">
            <img src={suggestImage} alt="Vista previa" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
            <span className="text-xs text-slate-500">Vista previa</span>
          </div>
        )}

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isHuman}
            onChange={(e) => setIsHuman(e.target.checked)}
            className="accent-emerald-600 w-4 h-4"
          />
          No soy un robot
        </label>

        {suggestError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{suggestError}</div>
        )}
        {suggestSuccess && (
          <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2">{suggestSuccess}</div>
        )}

        <div className="mt-4">
          <button
            onClick={submitSuggestion}
            disabled={suggesting}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-60"
          >
            Enviar sugerencia
          </button>
        </div>
      </section>

      {/* Cart Sidebar / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>

          {/* Sidebar Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <ShoppingCart className="mr-2 text-emerald-600" size={24} /> 
                Tu Pedido
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag size={64} className="text-slate-300" />
                  <p className="text-slate-500 font-medium">Tu carrito está vacío</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Ir a comprar
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-20 h-20 rounded-lg object-cover bg-slate-100 border border-slate-200"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-800 line-clamp-2">{item.product.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-emerald-600 font-bold mb-2">${item.product.price.toLocaleString()}</p>
                      
                      <div className="flex items-center bg-slate-100 rounded-lg w-fit">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1.5 hover:text-emerald-600 disabled:opacity-50"
                          disabled={item.qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1.5 hover:text-emerald-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center mb-2 text-slate-500 text-sm">
                  <span>Subtotal ({cartItemCount} items)</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-slate-800">Total a Pagar</span>
                  <span className="font-bold text-2xl text-emerald-600">${cartTotal.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={sendOrderToWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle size={24} />
                  Enviar Pedido por WhatsApp
                </button>
                <button 
                  onClick={registerPurchase}
                  className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Registrar compra
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Serás redirigido a WhatsApp para confirmar tu pedido con un asesor.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">Fondo Fortuna</p>
              <p className="text-slate-500">Tienda Fondo Fortuna· Precios justos para la canasta familiar.</p>
            </div>
            <div className="flex gap-6">
              <span>Contacto: 3104100513
              </span>
              <span>Horario: Lun–Sáb</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
