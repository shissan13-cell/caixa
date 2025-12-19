// src/pages/ProductManagementPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Edit, Trash2, Save, X, Loader2, Plus, Coffee, Utensils } from 'lucide-react'; 

export const NON_KITCHEN_CATEGORIES = ['bebidas', 'sobremesas', 'outros'];

const FOOD_EMOJIS = [
    { value: '🍔', label: 'Hambúrguer (🍔)' },
    { value: '🌭', label: 'Cachorro Quente (🌭)' }, 
    { value: '🍗', label: 'Coxinha/Frango (🍗)' }, 
    { value: '🍟', label: 'Batata Frita (🍟)' }, 
    { value: '🥣', label: 'Sopa/Caldo (🥣)' }, 
    { value: '🍕', label: 'Pizza (🍕)' },
    { value: '💧', label: 'Água Gota (💧)' },
    { value: '🍺', label: 'Cerveja (🍺)' },
    { value: '🥫', label: 'Lata Coca-Cola (🥫)' },
    { value: '🧃', label: 'Guaravita/Suco (🧃)' },
    { value: '🍦', label: 'Sorvete (🍦)' },
    { value: '🍰', label: 'Bolo/Torta (🍰)' },
    { value: '🥛', label: 'Leite (🥛)' },
    { value: '🍩', label: 'Doce (🍩)' },
    { value: '🧀', label: 'Queijo (🧀)' },
    { value: '🥓', label: 'Bacon (🥓)' },
    { value: '🥚', label: 'Ovo (🥚)' },
    { value: '🥗', label: 'Salada (🥗)' }
];

const ProductManagementPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [productName, setProductName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('comidas');
    const [emoji, setEmoji] = useState('🍔');

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('produtos').select('*').order('nome', { ascending: true });
        if (error) toast.error("Erro ao carregar");
        else setProducts(data || []);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleRegisterProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !salePrice) return toast.error("Preencha Nome e Preço!");

        const { error } = await supabase.from('produtos').insert([{
            nome: productName,
            preco_custo: parseFloat(costPrice) || 0,
            preco: parseFloat(salePrice),
            estoque: parseInt(quantity) || 0,
            categoria: category,
            emoji: emoji
            // Removido tempo_preparo
        }]);

        if (error) toast.error("Erro: " + error.message);
        else {
            toast.success("Produto cadastrado!");
            setProductName(''); setCostPrice(''); setSalePrice(''); setQuantity('');
            fetchProducts();
        }
    };

    const handleSaveEdit = async () => {
        const { error } = await supabase.from('produtos').update({
            nome: editForm.nome,
            preco: parseFloat(editForm.preco),
            estoque: parseInt(editForm.estoque)
            // Removido tempo_preparo da edição
        }).eq('id', isEditing);

        if (error) toast.error("Erro ao atualizar");
        else {
            toast.success("Atualizado com sucesso!");
            setIsEditing(null);
            fetchProducts();
        }
    };

    const handleRemoveProduct = async (id: number) => {
        if (!confirm("Remover este produto?")) return;
        await supabase.from('produtos').delete().eq('id', id);
        fetchProducts();
    };

    const foodItems = products.filter(p => !NON_KITCHEN_CATEGORIES.includes(p.categoria));
    const beverages = products.filter(p => NON_KITCHEN_CATEGORIES.includes(p.categoria));

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900">Gestão de Catálogo</h1>
                    <p className="text-slate-500 text-lg">Administre seus produtos e estoque.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 h-fit">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 sticky top-8">
                            <div className="flex items-center gap-3 mb-6 text-blue-600 font-bold text-2xl">
                                <Plus size={28} strokeWidth={3} /> 
                                <span>Novo Produto</span>
                            </div>
                            
                            <form onSubmit={handleRegisterProduct} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Item</label>
                                    <input 
                                        value={productName} 
                                        onChange={e => setProductName(e.target.value)} 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
                                        placeholder="Ex: X-Salada Especial" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Custo (R$)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={costPrice} 
                                            onChange={e => setCostPrice(e.target.value)} 
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-blue-500 transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Venda (R$)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={salePrice} 
                                            onChange={e => setSalePrice(e.target.value)} 
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-blue-600 outline-none focus:border-blue-500 transition-all" 
                                        />
                                    </div>
                                </div>

                                {/* Campo de Preparo removido daqui */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Estoque</label>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        onChange={e => setQuantity(e.target.value)} 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-blue-500 transition-all" 
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Categoria e Ícone</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        <select 
                                            value={emoji} 
                                            onChange={e => setEmoji(e.target.value)} 
                                            className="col-span-2 px-2 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl text-center outline-none focus:border-blue-500 transition-all"
                                        >
                                            {FOOD_EMOJIS.map(item => <option key={item.value} value={item.value}>{item.value}</option>)}
                                        </select>
                                        <select 
                                            value={category} 
                                            onChange={e => setCategory(e.target.value)} 
                                            className="col-span-3 px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all uppercase"
                                        >
                                            <option value="comidas">Comidas</option>
                                            <option value="bebidas">Bebidas</option>
                                            <option value="sobremesas">Doces</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl text-lg mt-2 uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Save size={22} />
                                    <span>Salvar Produto</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                        {isLoading ? <Loader2 className="animate-spin mx-auto mt-20 text-slate-300" size={48} /> : (
                            <>
                                <SectionTable 
                                    title="Menu de Comidas" icon={<Utensils size={20} className="text-orange-500" />}
                                    products={foodItems} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm}
                                    onEdit={(id:any, p:any) => {setIsEditing(id); setEditForm(p);}}
                                    onSave={handleSaveEdit} onCancel={() => setIsEditing(null)} onDelete={handleRemoveProduct}
                                />
                                <SectionTable 
                                    title="Bebidas e Diversos" icon={<Coffee size={20} className="text-blue-500" />}
                                    products={beverages} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm}
                                    onEdit={(id:any, p:any) => {setIsEditing(id); setEditForm(p);}}
                                    onSave={handleSaveEdit} onCancel={() => setIsEditing(null)} onDelete={handleRemoveProduct}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTable = ({ title, icon, products, isEditing, editForm, setEditForm, onEdit, onSave, onCancel, onDelete }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            {icon} <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm">{title}</h3>
        </div>
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/30">
                    <TableHead className="px-8 font-bold text-slate-500">PRODUTO</TableHead>
                    <TableHead className="font-bold text-slate-500 text-center">ESTOQUE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-center">CUSTO</TableHead>
                    <TableHead className="font-bold text-slate-500 text-center">VENDA</TableHead>
                    {/* Cabeçalho Preparo removido */}
                    <TableHead className="px-8 font-bold text-slate-500 text-right">AÇÕES</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((p: any) => (
                    <TableRow key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{p.emoji}</span>
                                {isEditing === p.id ? (
                                    <input 
                                        value={editForm.nome} 
                                        onChange={e => setEditForm({...editForm, nome: e.target.value})} 
                                        className="border-2 border-blue-500 rounded-lg px-2 py-1 text-lg font-bold w-full text-black" 
                                    />
                                ) : (
                                    <span className="font-bold text-slate-800 text-lg">{p.nome}</span>
                                )}
                            </div>
                        </TableCell>

                        <TableCell className="text-center">
                            {isEditing === p.id ? (
                                <input 
                                    type="number" 
                                    value={editForm.estoque} 
                                    onChange={e => setEditForm({...editForm, estoque: e.target.value})} 
                                    className="border-2 border-blue-500 rounded-lg px-2 py-1 w-16 text-black font-bold text-center" 
                                />
                            ) : (
                                <span className="font-black px-3 py-1.5 bg-slate-100 rounded-lg text-sm">{p.estoque}</span>
                            )}
                        </TableCell>
                        
                        <TableCell className="text-center font-medium">
                            {isEditing === p.id ? (
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editForm.preco_custo} 
                                    onChange={e => setEditForm({...editForm, preco_custo: e.target.value})} 
                                    className="border-2 border-blue-500 rounded-lg px-2 py-1 w-24 text-black font-bold text-center" 
                                />
                            ) : (
                                <span className="text-slate-500">R$ {Number(p.preco_custo || 0).toFixed(2)}</span>
                            )}
                        </TableCell>

                        <TableCell className="text-center font-black text-slate-900 text-lg">
                            {isEditing === p.id ? (
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editForm.preco} 
                                    onChange={e => setEditForm({...editForm, preco: e.target.value})} 
                                    className="border-2 border-blue-500 rounded-lg px-2 py-1 w-24 text-black font-bold text-center" 
                                />
                            ) : `R$ ${Number(p.preco || 0).toFixed(2)}`}
                        </TableCell>

                        {/* Coluna de Preparo removida */}

                        <TableCell className="px-8 text-right">
                            <div className="flex justify-end gap-2">
                                {isEditing === p.id ? (
                                    <>
                                        <button onClick={onSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={24}/></button>
                                        <button onClick={onCancel} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={24}/></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => onEdit(p.id, p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={22}/></button>
                                        <button onClick={() => onDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={22}/></button>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
export default ProductManagementPage;