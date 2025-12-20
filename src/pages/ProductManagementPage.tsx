import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Package,
  ArrowLeft,
  Plus
} from 'lucide-react';

export const NON_KITCHEN_CATEGORIES = ['bebidas', 'sobremesas', 'outros'];

const EMOJIS = ['🍔','🌭','🍗','🍟','🍕','🧃','🍺','🍦','🍰','🥤','🥪','🍩'];

export default function ProductManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ➕ novo produto
  const [newProduct, setNewProduct] = useState<any>({
    nome: '',
    preco: '',
    preco_custo: '',
    estoque: '',
    categoria: 'comidas',
    emoji: '🍔'
  });

  // ✏ edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');

    if (error) toast.error('Erro ao carregar produtos');
    else setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ➕ salvar novo produto
  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.nome || !newProduct.preco) {
      toast.error('Nome e preço de venda são obrigatórios');
      return;
    }

    const { error } = await supabase.from('produtos').insert([{
      ...newProduct,
      preco: Number(newProduct.preco),
      preco_custo: Number(newProduct.preco_custo || 0),
      estoque: Number(newProduct.estoque || 0)
    }]);

    if (error) toast.error('Erro ao cadastrar');
    else {
      toast.success('Produto cadastrado');
      setNewProduct({
        nome: '',
        preco: '',
        preco_custo: '',
        estoque: '',
        categoria: 'comidas',
        emoji: '🍔'
      });
      fetchProducts();
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('produtos')
      .update({
        nome: editForm.nome,
        preco: Number(editForm.preco),
        preco_custo: Number(editForm.preco_custo),
        estoque: Number(editForm.estoque),
        categoria: editForm.categoria,
        emoji: editForm.emoji
      })
      .eq('id', editingId);

    if (error) toast.error('Erro ao salvar');
    else {
      toast.success('Produto atualizado');
      cancelEdit();
      fetchProducts();
    }
  };

  const removeProduct = async (id: number) => {
    if (!confirm('Remover este produto?')) return;
    await supabase.from('produtos').delete().eq('id', id);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900">

      {/* 🔹 TOPO PADRÃO CAIXA */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="p-2 rounded-full border border-slate-300 hover:bg-slate-100"
        >
          <ArrowLeft />
        </Link>

        <div className="flex items-center gap-3 border-l pl-4 border-slate-300">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Package className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Catálogo de Produtos
            </h1>
            <p className="text-sm text-slate-600">
              Gerencie produtos, preços e estoque
            </p>
          </div>
        </div>
      </div>

      {/* ➕ FORMULÁRIO - Reorganizado e Proporcional */}
      <form
        onSubmit={createProduct}
        className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-10 gap-4 items-end"
      >
        {/* Nome - Aumentado */}
        <div className="flex flex-col gap-1 md:col-span-3">
          <label className="text-xs font-semibold text-slate-500 ml-1">Nome</label>
          <input
            placeholder="Nome do produto"
            value={newProduct.nome}
            onChange={e => setNewProduct({ ...newProduct, nome: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 w-full"
          />
        </div>

        {/* Estoque - Logo após o nome */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Estoque</label>
          <input
            type="number"
            placeholder="0"
            value={newProduct.estoque}
            onChange={e => setNewProduct({ ...newProduct, estoque: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 w-full"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Custo</label>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={newProduct.preco_custo}
            onChange={e => setNewProduct({ ...newProduct, preco_custo: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 w-full"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Venda</label>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={newProduct.preco}
            onChange={e => setNewProduct({ ...newProduct, preco: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 w-full"
          />
        </div>

        {/* Ícone - Diminuído */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Ícone</label>
          <select
            value={newProduct.emoji}
            onChange={e => setNewProduct({ ...newProduct, emoji: e.target.value })}
            className="px-2 py-2 border border-slate-300 rounded-lg text-xl text-center w-full appearance-none"
          >
            {EMOJIS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 ml-1">Categoria</label>
          <select
            value={newProduct.categoria}
            onChange={e => setNewProduct({ ...newProduct, categoria: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 w-full"
          >
            <option value="comidas">Comidas</option>
            <option value="bebidas">Bebidas</option>
            <option value="sobremesas">Sobremesas</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <button
          type="submit"
          className="md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white h-[42px] rounded-xl font-semibold flex items-center justify-center"
          title="Cadastrar"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* 📋 TABELA */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {['Produto','Estoque','Custo','Venda','Categoria','Ícone','Ações'].map(h => (
                  <TableHead key={h} className="text-slate-700 font-semibold">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map(p => (
                <TableRow key={p.id} className="text-slate-900">
                  <TableCell className="font-medium text-slate-800">
                    {editingId === p.id ? (
                      <input
                        value={editForm.nome}
                        onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                        className="border border-slate-300 rounded-lg px-2 py-1 w-full text-slate-900"
                      />
                    ) : (
                      p.nome
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={editForm.estoque}
                        onChange={e => setEditForm({ ...editForm, estoque: e.target.value })}
                        className="w-20 border border-slate-300 rounded-lg text-center text-slate-900"
                      />
                    ) : (
                      <span className="text-slate-700">{p.estoque}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-slate-600">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.preco_custo}
                        onChange={e => setEditForm({ ...editForm, preco_custo: e.target.value })}
                        className="w-24 border border-slate-300 rounded-lg text-center text-slate-900"
                      />
                    ) : (
                      `R$ ${Number(p.preco_custo || 0).toFixed(2)}`
                    )}
                  </TableCell>

                  <TableCell className="text-center font-semibold text-slate-900">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.preco}
                        onChange={e => setEditForm({ ...editForm, preco: e.target.value })}
                        className="w-24 border border-slate-300 rounded-lg text-center text-slate-900"
                      />
                    ) : (
                      `R$ ${Number(p.preco).toFixed(2)}`
                    )}
                  </TableCell>

                  <TableCell className="text-center text-slate-700">
                    {editingId === p.id ? (
                      <select
                        value={editForm.categoria}
                        onChange={e => setEditForm({ ...editForm, categoria: e.target.value })}
                        className="border border-slate-300 rounded-lg px-2 py-1 text-slate-900"
                      >
                        <option value="comidas">Comidas</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="sobremesas">Sobremesas</option>
                        <option value="outros">Outros</option>
                      </select>
                    ) : (
                      p.categoria
                    )}
                  </TableCell>

                  <TableCell className="text-center text-xl">
                    {editingId === p.id ? (
                      <select
                        value={editForm.emoji}
                        onChange={e => setEditForm({ ...editForm, emoji: e.target.value })}
                        className="border border-slate-300 rounded-lg px-2 py-1"
                      >
                        {EMOJIS.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    ) : (
                      p.emoji
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {editingId === p.id ? (
                      <>
                        <button onClick={saveEdit} className="p-2 text-green-600">
                          <Save size={18} />
                        </button>
                        <button onClick={cancelEdit} className="p-2 text-red-600">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 text-slate-500 hover:text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="p-2 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}