
import { useProducts } from '@/contexts/products';
import { useTeam } from '@/contexts/team';
import { addToast, Button, Card, CardBody, CardFooter, Image, Input, Tab, Tabs, Textarea } from '@heroui/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
const ProductTable = dynamic(() => import('./table'), { ssr: false });

export default function Products() {
    const { selectedProduct, setSelectedProduct, updateProduct, loading, fetchProduct } = useProducts();
    const { stores } = useTeam();
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        store_products: { store_id: string; price: number; stock: number }[];
    } | null>(null);
    const [showSaveButton, setShowSaveButton] = useState(false);

    // Inicializar formData quando selectedProduct ou stores mudar
    useEffect(() => {
        if (selectedProduct && stores) {
            const storeProducts = stores.map((store) => {
                const existing = selectedProduct.store_products.find((sp) => sp.store_id === store.id);
                return {
                    store_id: store.id,
                    price: existing?.price || 0,
                    stock: existing?.stock || 0,
                };
            });
            setFormData({
                name: selectedProduct.name,
                description: selectedProduct.description,
                store_products: storeProducts,
            });
        } else {
            setFormData(null);
            setShowSaveButton(false);
        }
    }, [selectedProduct, stores]);

    // Verificar alterações em formData para mostrar o botão Salvar
    useEffect(() => {
        if (!selectedProduct || !formData) {
            setShowSaveButton(false);
            return;
        }

        const hasChanges =
            formData.name !== selectedProduct.name ||
            formData.description !== selectedProduct.description ||
            formData.store_products.some((sp) => {
                const original = selectedProduct.store_products.find((osp) => osp.store_id === sp.store_id) || {
                    price: 0,
                    stock: 0,
                };
                return sp.price !== (original.price || 0) || sp.stock !== (original.stock || 0);
            });

        setShowSaveButton(hasChanges);
    }, [formData, selectedProduct]);

    // Rolar para o elemento do produto quando selectedProduct mudar
    useEffect(() => {
        if (selectedProduct?.id) {
            const element = document.getElementById('product');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [selectedProduct]);

    // Manipular clique no botão Salvar
    const handleSave = useCallback(async () => {
        if (!selectedProduct || !formData) return;

        // Validar formData
        const invalid = formData.store_products.some((sp) => sp.price < 0 || sp.stock < 0 || isNaN(sp.price) || isNaN(sp.stock));
        if (invalid) {
            addToast({
                title: "Erro",
                description: "Preço e estoque devem ser valores válidos e não negativos.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        try {
            await updateProduct(selectedProduct.id, {
                name: formData.name,
                description: formData.description,
                store_products: formData.store_products,
            });
            setShowSaveButton(false);

            setSelectedProduct(null);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    }, [selectedProduct, formData, updateProduct]);

    // Atualizar store_products em formData
    const updateStoreProduct = useCallback(
        (storeId: string, field: 'price' | 'stock', value: number | string) => {
            if (!formData) return;

            // Converter valor com base no campo
            const parsedValue =
                field === 'price'
                    ? typeof value === 'string'
                        ? parseFloat(value.replace(',', '.')) || 0
                        : value || 0
                    : parseInt(String(value)) || 0;

            setFormData({
                ...formData,
                store_products: formData.store_products.map((sp) =>
                    sp.store_id === storeId ? { ...sp, [field]: parsedValue } : sp
                ),
            });
        },
        [formData],
    );

    if (!selectedProduct || !formData) {
        return (
            <div className="w-full flex flex-col p-5">
                <ProductTable />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col p-5">
            <ProductTable />

            <Card className="w-full flex flex-col mt-10" id="product">
                <CardBody>
                    <h2 className="text-2xl font-bold mb-4 p-2">Detalhes do Produto</h2>

                    <div className="w-full flex flex-col justify-center items-center mb-7">
                        <Image
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className='max-w-[400px] max-h-[400px] rounded-md'
                            isBlurred
                            isZoomed
                        />
                        <p className="mt-4 text-[10px] text-default-400">Pré-visualização</p>
                    </div>

                    <Input
                        label="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        description="Nome exibido na página do produto"
                    />

                    <Textarea
                        label="Descrição"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        description="Texto descritivo visível aos clientes"
                    />

                    <Tabs aria-label="Store Options">
                        {stores.map((store) => {
                            const storeProduct = formData.store_products.find((sp) => sp.store_id === store.id) || {
                                store_id: store.id,
                                price: 0,
                                stock: 0,
                            };
                            return (
                                <Tab key={store.id} title={store.name}>
                                    <Card>
                                        <CardBody>
                                            <NumericFormat
                                                customInput={Input}
                                                label="Preço"
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                fixedDecimalScale={true}
                                                decimalScale={2}
                                                prefix="R$ "
                                                value={storeProduct.price}
                                                onValueChange={(values) => {
                                                    updateStoreProduct(store.id, 'price', values.floatValue ?? 0);
                                                }}
                                                description="Preço do produto nesta loja"
                                                placeholder="R$ 0,00"
                                            />
                                            <Input
                                                label="Estoque"
                                                type="number"
                                                value={storeProduct.stock !== 0 ? storeProduct.stock.toString() : ''}
                                                onChange={(e) => updateStoreProduct(store.id, 'stock', e.target.value)}
                                                description="Quantidade disponível nesta loja"
                                                placeholder="0"
                                            />
                                        </CardBody>
                                    </Card>
                                </Tab>
                            );
                        })}
                    </Tabs>
                </CardBody>

                {showSaveButton && (
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            radius="md"
                            color="default"
                            onPress={() => {
                                const storeProducts = stores.map((store) => {
                                    const existing = selectedProduct.store_products.find((sp) => sp.store_id === store.id);
                                    return {
                                        store_id: store.id,
                                        price: existing?.price || 0,
                                        stock: existing?.stock || 0,
                                    };
                                });
                                setFormData({
                                    name: selectedProduct.name,
                                    description: selectedProduct.description,
                                    store_products: storeProducts,
                                });
                                setShowSaveButton(false);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button radius="md" color="primary" onPress={handleSave} isLoading={loading}>
                            Salvar
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}