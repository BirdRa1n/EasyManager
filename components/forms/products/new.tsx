import { useProducts } from "@/contexts/products";
import { useTeam } from "@/contexts/team";
import { supabase } from "@/supabase/server";
import { addToast, Avatar, Button, Form, Image, Input, ModalBody, ModalHeader, Textarea } from "@heroui/react";
import { useState } from "react";
import { FaTag } from "react-icons/fa6";

const NewProductForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { team } = useTeam();
    const { products, setProducts } = useProducts();
    const [imageUri, setImageUri] = useState<string>();
    const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
    const [imageMeta, setImageMeta] = useState<{ name: string; type: string; size: number } | null>(null);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [ean, setEan] = useState<string>("");

    const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const form = Object.fromEntries(formData);
        const { name, description, ean } = form;

        // Debug: Log FormData and state
        console.log("FormData:", { name, description, ean, image: formData.get("image") });
        console.log("Image State:", { imageUri, imageBuffer: !!imageBuffer, imageMeta });

        // Validate form fields
        if (!name || name.length < 3) {
            addToast({
                title: "Erro ao adicionar produto",
                description: "O nome do produto deve ter pelo menos 3 caracteres.",
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!description || description.length < 5) {
            addToast({
                title: "Erro ao adicionar produto",
                description: "A descrição do produto deve ter pelo menos 5 caracteres.",
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!ean || !/^\d{8,13}$/.test(ean as string)) {
            addToast({
                title: "Erro ao adicionar produto",
                description: "O código de barras deve conter entre 8 e 13 dígitos.",
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!team?.id) {
            addToast({
                title: "Erro ao adicionar produto",
                description: "Nenhum time selecionado.",
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        // Debug: Log authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Authenticated user:", user?.id);

        const { data: existingProduct, error: existingProductError } = await supabase.from("product_identifiers").select().eq("type", "EAN").eq("code", ean).maybeSingle();

        if (existingProduct) {
            addToast({
                title: "Erro ao adicionar produto",
                description: "Já existe um produto com o código de barras " + ean,
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        const { data, error } = await supabase.from("products").insert({
            name,
            description,
            team_id: team.id,
        }).select().maybeSingle();

        if (error) {
            addToast({
                title: "Erro ao adicionar produto",
                description: error.message,
                variant: "solid",
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (data) {
            const { data: identifier, error: identifierError } = await supabase.from("product_identifiers").insert({
                type: "EAN",
                code: ean,
                product_id: data.id
            }).select().maybeSingle();

            if (identifierError) {
                await supabase.from("products").delete().eq("id", data.id);
                addToast({
                    title: "Erro ao adicionar produto",
                    description: identifierError.message,
                    variant: "solid",
                    color: "danger",
                    timeout: 6000
                });
                return;
            }

            const product = {
                id: data.id,
                name: data.name,
                description: data.description,
                store_products: [],
                product_identifiers: identifier ? [identifier] : [],
                image: null as string | null
            };

            if (imageBuffer && imageMeta && imageMeta.size > 0) {
                if (!['image/jpeg', 'image/png'].includes(imageMeta.type)) {
                    await supabase.from("products").delete().eq("id", data.id);
                    addToast({
                        title: "Erro ao adicionar produto",
                        description: "A imagem deve ser do tipo JPEG ou PNG.",
                        variant: "solid",
                        color: "danger",
                        timeout: 3000
                    });
                    return;
                }
                if (imageMeta.size > 5 * 1024 * 1024) { // 5MB limit
                    await supabase.from("products").delete().eq("id", data.id);
                    addToast({
                        title: "Erro ao adicionar produto",
                        description: "A imagem não pode exceder 5MB.",
                        variant: "solid",
                        color: "danger",
                        timeout: 3000
                    });
                    return;
                }

                const fileExt = imageMeta.type.split('/')[1];
                const randomName = Math.random().toString(36).substring(2, 15);
                const path = `${team.id}/${data.id}/${randomName}.${fileExt}`;
                console.log("Uploading image to:", path); // Debug

                const { data: imageData, error: imageError } = await supabase.storage
                    .from('products')
                    .upload(path, imageBuffer, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageMeta.type
                    });

                if (imageError) {
                    console.log("Upload error:", { path, error: imageError });
                    await supabase.from("products").delete().eq("id", data.id);
                    addToast({
                        title: "Erro ao adicionar produto",
                        description: imageError.message,
                        variant: "solid",
                        color: "danger",
                        timeout: 3000
                    });
                    return;
                }

                const { data: { publicUrl } } = supabase
                    .storage
                    .from('products')
                    .getPublicUrl(path);

                // Update product with image path
                const { data: updatedProduct, error: updateError } = await supabase
                    .from("products")
                    .update({ image: publicUrl })
                    .eq("id", data.id)
                    .select()
                    .maybeSingle();

                if (updateError) {
                    console.log("Update error:", updateError);
                    await supabase.from("products").delete().eq("id", data.id);
                    addToast({
                        title: "Erro ao adicionar produto",
                        description: updateError.message,
                        variant: "solid",
                        color: "danger",
                        timeout: 3000
                    });
                    return;
                }

                product.image = path;
            }

            setProducts([...products, product]);
            onClose();
        }
    };

    return (
        <>
            <ModalHeader className="flex flex-col gap-1">Adicionar produto</ModalHeader>
            <ModalBody>
                <div>
                    <Form onSubmit={handlerSubmit} className="flex flex-col gap-2 w-full">
                        <div className="w-full flex justify-center">
                            {imageUri ? (
                                <Image src={imageUri} alt="Product Image" className="rounded-md max-w-[200px]" isBlurred isZoomed />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Avatar
                                        className="rounded-md w-32 h-32"
                                        showFallback
                                        fallback={<FaTag className="w-8 h-8 text-default-500" />}
                                    />
                                    <Input
                                        name="image"
                                        size="sm"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        className="max-w-sm"
                                        description="Selecione uma imagem JPEG ou PNG para o produto (máx. 5MB)."
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            console.log("Selected file:", file); // Debug
                                            if (file && file.size > 0 && ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    if (event.target?.result instanceof ArrayBuffer) {
                                                        setImageBuffer(event.target.result);
                                                        setImageMeta({ name: file.name, type: file.type, size: file.size });
                                                        setImageUri(URL.createObjectURL(file));
                                                        console.log("Image buffer set:", { name: file.name, size: file.size, type: file.type }); // Debug
                                                    }
                                                };
                                                reader.onerror = () => {
                                                    addToast({
                                                        title: "Erro ao ler imagem",
                                                        description: "Não foi possível ler o arquivo de imagem.",
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000
                                                    });
                                                    setImageUri(undefined);
                                                    setImageBuffer(null);
                                                    setImageMeta(null);
                                                };
                                                reader.readAsArrayBuffer(file);
                                            } else {
                                                setImageUri(undefined);
                                                setImageBuffer(null);
                                                setImageMeta(null);
                                                if (file) {
                                                    addToast({
                                                        title: "Erro ao selecionar imagem",
                                                        description: "Selecione uma imagem válida (JPEG ou PNG, máx. 5MB).",
                                                        variant: "solid",
                                                        color: "danger",
                                                        timeout: 3000
                                                    });
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-full">
                            <p className="text-default-600 text-sm mb-2">Informações do produto</p>
                            <Input
                                name="name"
                                label="Nome do produto"
                                size="md"
                                placeholder="Ex: Fone de ouvido Bluetooth Baseus Air 2"
                                description="Digite o nome do produto (mínimo 3 caracteres)."
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                            <Textarea
                                name="description"
                                label="Descrição do produto"
                                size="md"
                                placeholder="Ex: O fone de ouvido Bluetooth Baseus Air 2 tem um design elegante e confortável para o seu dia-a-dia..."
                                description="Digite a descrição do produto (mínimo 5 caracteres)."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <p className="text-default-600 text-sm mb-2">Identificação do produto</p>
                            <div className="flex flex-row gap-1">
                                <Input
                                    name="ean"
                                    label="Código de barras"
                                    size="md"
                                    placeholder="Ex: 7896541234567"
                                    description="Digite o código de barras (8 a 13 dígitos)."
                                    onChange={(e) => setEan(e.target.value)}
                                    value={ean}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end w-full">
                            <Button color="primary" type="submit">
                                Adicionar
                            </Button>
                        </div>
                    </Form>
                </div>
            </ModalBody>
        </>
    );
};

export default NewProductForm;