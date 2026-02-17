import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductSuggestion } from '../../types';
import { Image, Lightbulb, X, User } from 'lucide-react';

interface SuggestionRow extends ProductSuggestion {
  user?: {
    name?: string;
    email?: string;
    phone_number?: string;
  } | null;
}

export default function Suggestions() {
  const [items, setItems] = useState<SuggestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SuggestionRow | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('product_suggestions')
          .select('*, users(name,email,phone_number)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          userId: s.user_id ?? null,
          productName: s.product_name,
          imageBase64: s.image_base64,
          createdAt: s.created_at,
          user: s.users ?? null
        })) as SuggestionRow[];
        setItems(mapped);
      } catch (e: any) {
        setError(e.message || 'No se pudieron cargar las sugerencias');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <Lightbulb size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sugerencias</h2>
          <p className="text-sm text-slate-500">Productos sugeridos por los usuarios.</p>
        </div>
      </div>

      {loading && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
          Cargando sugerencias...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-500">
          Aún no hay sugerencias.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setSelected(item as SuggestionRow)}
            className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-slate-50 flex items-center justify-center">
              {item.imageBase64 ? (
                <img src={item.imageBase64} alt={item.productName} className="w-full h-full object-contain" />
              ) : (
                <Image className="text-slate-300" size={32} />
              )}
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-500">Producto sugerido</p>
              <h3 className="font-bold text-slate-800">{item.productName}</h3>
              <p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-emerald-600" />
                <span className="font-semibold text-slate-800">Detalle de sugerencia</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
                {selected.imageBase64 ? (
                  <img
                    src={selected.imageBase64}
                    alt={selected.productName}
                    className="w-full h-64 object-contain cursor-zoom-in"
                    onClick={() => setImagePreview(selected.imageBase64)}
                  />
                ) : (
                  <Image className="text-slate-300" size={32} />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Producto</p>
                  <p className="text-lg font-semibold text-slate-800">{selected.productName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Fecha</p>
                  <p className="text-sm text-slate-700">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><User size={14} /> Usuario</p>
                  {selected.user ? (
                    <div className="text-sm text-slate-700">
                      <p className="font-medium">{selected.user.name || 'Usuario'}</p>
                      {selected.user.email && <p className="text-slate-500">{selected.user.email}</p>}
                      {selected.user.phone_number && <p className="text-slate-500">{selected.user.phone_number}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No identificado</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow"
            aria-label="Cerrar imagen"
          >
            <X size={18} />
          </button>
          <img
            src={imagePreview}
            alt="Vista ampliada"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
