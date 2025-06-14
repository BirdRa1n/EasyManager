import { useServices } from "@/contexts/services";
import { useTeam } from "@/contexts/team";
import { supabase } from "@/supabase/client";
import { addToast, Button, Form, Input, ModalBody, ModalHeader, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from "@heroui/react";
import { useState } from "react";

interface CustomAttribute {
    key: string;
    value: string;
}

const NewServiceForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { team, stores } = useTeam();
    const { serviceTypes, services, setServices, fetchService } = useServices();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [typeId, setTypeId] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [storeId, setStoreId] = useState<string>("");
    const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
    const [attachments, setAttachments] = useState<{ file: File; type: string }[]>([]);

    // Add custom attribute
    const addCustomAttribute = () => {
        setCustomAttributes([...customAttributes, { key: "", value: "" }]);
    };

    // Update custom attribute
    const updateCustomAttribute = (index: number, field: 'key' | 'value', value: string) => {
        const updatedAttrs = [...customAttributes];
        updatedAttrs[index] = { ...updatedAttrs[index], [field]: value };
        setCustomAttributes(updatedAttrs);
    };

    // Remove custom attribute
    const removeCustomAttribute = (index: number) => {
        setCustomAttributes(customAttributes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const form = Object.fromEntries(formData);
        const { name, description, type_id, price, duration, store_id } = form;

        // Debug: Log FormData and attachments
        console.log("FormData:", { name, description, type_id, price, duration, store_id });
        console.log("Custom Attributes:", customAttributes);
        console.log("Attachments:", attachments.map((a) => ({ name: a.file.name, type: a.type })));

        // Validate form fields
        if (!name || (name as string).length < 3) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "O nome do serviço deve ter pelo menos 3 caracteres.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (!description || (description as string).length < 5) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "A descrição do serviço deve ter pelo menos 5 caracteres.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (!type_id || !serviceTypes.some((st) => st.id === type_id)) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "Selecione um tipo de serviço válido.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (price && isNaN(Number(price))) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "O preço deve ser um número válido.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (store_id && !stores.some((s) => s.id === store_id)) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "Selecione uma loja válida.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        // Validate custom attributes
        const customAttrKeys = new Set(customAttributes.map((attr) => attr.key));
        if (customAttrKeys.size !== customAttributes.length) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "As chaves dos atributos personalizados devem ser únicas.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (customAttributes.some((attr) => !attr.key.trim())) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "As chaves dos atributos personalizados não podem estar vazias.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        const parsedCustomAttributes: Record<string, string> = customAttributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
        }, {} as Record<string, string>);

        if (!team?.id) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: "Nenhum time selecionado.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        // Debug: Log authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Authenticated user:", user?.id);

        const serviceData = {
            name,
            description,
            type_id,
            team_id: team.id,
            price: price ? Number(price) : null,
            duration: duration || null,
            store_id: store_id || null,
            custom_attributes: Object.keys(parsedCustomAttributes).length ? parsedCustomAttributes : null,
            created_by: user?.id || null,
            attachments: [] as { file: string; type: string }[],
        };

        // Insert service to get ID for attachment storage
        const { data: service, error: serviceError } = await supabase
            .from("services")
            .insert(serviceData)
            .select("*, service_types!type_id(name), stores(id, name)")
            .maybeSingle();

        if (serviceError) {
            addToast({
                title: "Erro ao adicionar serviço",
                description: serviceError.message,
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (service) {
            // Handle attachments
            if (attachments.length > 0) {
                const attachmentData: { file: string; type: string }[] = [];
                for (const attachment of attachments) {
                    const { file, type } = attachment;
                    if (!["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif", "application/pdf"].includes(file.type)) {
                        await supabase.from("services").delete().eq("id", service.id);
                        addToast({
                            title: "Erro ao adicionar serviço",
                            description: `O arquivo ${file.name} deve ser JPEG, PNG ou PDF.`,
                            variant: "solid",
                            color: "danger",
                            timeout: 3000,
                        });
                        return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        // 5MB limit
                        await supabase.from("services").delete().eq("id", service.id);
                        addToast({
                            title: "Erro ao adicionar serviço",
                            description: `O arquivo ${file.name} não pode exceder 5MB.`,
                            variant: "solid",
                            color: "danger",
                            timeout: 3000,
                        });
                        return;
                    }

                    const fileExt = file.type.split("/")[1];
                    const randomName = Math.random().toString(36).substring(2, 15);
                    const path = `${team.id}/${service.id}/${randomName}.${fileExt}`;
                    console.log("Uploading attachment to:", path); // Debug

                    const { error: uploadError } = await supabase.storage
                        .from("services")
                        .upload(path, file, {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: file.type,
                        });

                    if (uploadError) {
                        console.log("Upload error:", { path, error: uploadError });
                        await supabase.from("services").delete().eq("id", service.id);
                        addToast({
                            title: "Erro ao adicionar serviço",
                            description: uploadError.message,
                            variant: "solid",
                            color: "danger",
                            timeout: 3000,
                        });
                        return;
                    }

                    const { data: { publicUrl } } = supabase.storage.from("services").getPublicUrl(path);
                    attachmentData.push({ file: publicUrl, type });
                }

                // Update service with attachments
                const { error: updateError } = await supabase
                    .from("services")
                    .update({ attachments: attachmentData })
                    .eq("id", service.id);

                if (updateError) {
                    console.log("Update error:", updateError);
                    await supabase.from("services").delete().eq("id", service.id);
                    addToast({
                        title: "Erro ao adicionar serviço",
                        description: updateError.message,
                        variant: "solid",
                        color: "danger",
                        timeout: 3000,
                    });
                    return;
                }

                service.attachments = attachmentData;
            }

            setServices([...services, service]);
            fetchService(service.id);
            onClose();
            addToast({
                title: "Sucesso",
                description: "Serviço adicionado com sucesso.",
                variant: "solid",
                color: "primary",
                timeout: 3000,
            });
        }
    };

    return (
        <>
            <ModalHeader className="flex flex-col gap-1">Adicionar serviço</ModalHeader>
            <ModalBody>
                <div>
                    <Form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                        <div className="w-full">
                            <p className="text-default-600 text-sm mb-2">Informações do serviço</p>
                            <Input
                                name="name"
                                label="Nome do serviço"
                                size="md"
                                placeholder="Ex: Reparo de Tela de Celular"
                                description="Digite o nome do serviço (mínimo 3 caracteres)."
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                            <Textarea
                                name="description"
                                label="Descrição do serviço"
                                size="md"
                                placeholder="Ex: Reparo de telas quebradas para diversos modelos de celulares..."
                                description="Digite a descrição do serviço (mínimo 5 caracteres)."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Select
                                name="type_id"
                                label="Tipo de serviço"
                                placeholder="Selecione o tipo"
                                description="Selecione o tipo de serviço."
                                onChange={(e) => setTypeId(e.target.value)}
                                value={typeId}
                            >
                                {serviceTypes.map((st) => (
                                    <SelectItem key={st.id}>
                                        {st.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Input
                                name="price"
                                label="Preço"
                                size="md"
                                placeholder="Ex: 150.00"
                                description="Digite o preço do serviço (opcional)."
                                type="number"
                                step="0.01"
                                onChange={(e) => setPrice(e.target.value)}
                                value={price}
                            />
                            <Input
                                name="duration"
                                label="Duração"
                                size="md"
                                placeholder="Ex: 1 hora"
                                description="Digite a duração do serviço (opcional)."
                                onChange={(e) => setDuration(e.target.value)}
                                value={duration}
                            />
                            <Select
                                name="store_id"
                                label="Loja"
                                placeholder="Selecione a loja"
                                description="Selecione a loja associada (opcional)."
                                onChange={(e) => setStoreId(e.target.value)}
                                value={storeId}
                            >
                                {stores.map((store) => (
                                    <SelectItem key={store.id}>
                                        {store.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-default-600 text-sm mb-2">Anotações personalizadas</p>
                                <Button
                                    size="sm"
                                    onPress={addCustomAttribute}
                                    aria-label="Adicionar novo atributo personalizado"
                                >
                                    Adicionar
                                </Button>
                            </div>
                            {customAttributes.length > 0 ? (
                                <Table aria-label="Anotações personalizadas">
                                    <TableHeader>
                                        <TableColumn>ETIQUETA</TableColumn>
                                        <TableColumn>CONTEÚDO</TableColumn>
                                        <TableColumn align="center">AÇÕES</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {customAttributes.map((attr, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Textarea
                                                        value={attr.key}
                                                        onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                                                        placeholder="Etiqueta"
                                                        aria-label={`Título ${index + 1}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Textarea
                                                        value={attr.value}
                                                        onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                                                        placeholder="Valor"
                                                        aria-label={`Valor do atributo ${index + 1}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="flex justify-center">
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onPress={() => removeCustomAttribute(index)}
                                                        aria-label={`Remover atributo ${index + 1}`}
                                                    >
                                                        Remover
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-small text-default-400">Nenhum atributo personalizado adicionado.</p>
                            )}
                        </div>
                        <div className="w-full">
                            <p className="text-default-600 text-sm mb-2">Anexos</p>
                            <Input
                                name="attachments"
                                size="md"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/jpg,application/pdf"
                                multiple
                                description="Selecione arquivos JPEG, PNG ou PDF (máx. 5MB por arquivo)."
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const validFiles = files.filter((file) =>
                                        ["image/jpeg", "image/png", "application/pdf"].includes(file.type) && file.size <= 5 * 1024 * 1024
                                    );
                                    if (validFiles.length !== files.length) {
                                        addToast({
                                            title: "Erro ao selecionar arquivos",
                                            description: "Alguns arquivos não são válidos (apenas JPEG, PNG ou PDF, máx. 5MB).",
                                            variant: "solid",
                                            color: "danger",
                                            timeout: 3000,
                                        });
                                    }
                                    setAttachments(
                                        validFiles.map((file) => ({
                                            file,
                                            type: file.type.startsWith("image") ? "image" : "pdf",
                                        }))
                                    );
                                    console.log("Selected attachments:", validFiles.map((f) => ({ name: f.name, type: f.type }))); // Debug
                                }}
                            />
                            {attachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-small text-default-500">Anexos selecionados:</p>
                                    <ul className="list-disc pl-5">
                                        {attachments.map((a, index) => (
                                            <li key={index} className="text-small">
                                                {a.file.name} ({a.type})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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

export default NewServiceForm;