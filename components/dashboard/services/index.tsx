import { useServices } from '@/contexts/services';
import { useTeam } from '@/contexts/team';
import { supabase } from '@/supabase/client';
import { ServiceType, Store } from '@/types/services';
import { addToast, Button, Card, CardBody, CardFooter, Image, Input, Select, SelectItem, Textarea } from '@heroui/react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';

const ServiceTable = dynamic(() => import('./table'), { ssr: false });

interface FormDataType {
    name: string;
    description: string;
    type_id: string;
    price: number | null;
    duration: string | null;
    store_id: string | null;
    custom_attributes: string;
    attachments: { file: string | File; type: string }[];
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
];

export default function Services() {
    const { selectedService, setSelectedService, updateService, loading, fetchService, serviceTypes } = useServices();
    const { stores, team } = useTeam();
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [showSaveButton, setShowSaveButton] = useState(false);

    // Initialize formData when selectedService changes
    useEffect(() => {
        if (selectedService) {
            setFormData({
                name: selectedService.name,
                description: selectedService.description ?? '',
                type_id: selectedService.type_id,
                price: selectedService.price ?? null,
                duration: selectedService.duration ?? null,
                store_id: selectedService.store_id ?? null,
                custom_attributes: selectedService.custom_attributes ? JSON.stringify(selectedService.custom_attributes, null, 2) : '',
                attachments: selectedService.attachments?.map((a) => ({ file: a.file, type: a.type })) ?? [],
                status: selectedService.status,
            });
        } else {
            setFormData(null);
            setShowSaveButton(false);
        }
    }, [selectedService]);

    // Check for changes in formData to show Save button
    useEffect(() => {
        if (!selectedService || !formData) {
            setShowSaveButton(false);
            return;
        }

        const hasChanges =
            formData.name !== selectedService.name ||
            formData.description !== (selectedService.description ?? '') ||
            formData.type_id !== selectedService.type_id ||
            formData.price !== (selectedService.price ?? null) ||
            formData.duration !== (selectedService.duration ?? null) ||
            formData.store_id !== (selectedService.store_id ?? null) ||
            formData.custom_attributes !== (selectedService.custom_attributes ? JSON.stringify(selectedService.custom_attributes, null, 2) : '') ||
            formData.status !== selectedService.status ||
            formData.attachments.length !== (selectedService.attachments?.length ?? 0) ||
            formData.attachments.some((a, i) => {
                const original = selectedService.attachments?.[i] ?? { file: '', type: '' };
                return typeof a.file !== 'string' || a.file !== original.file || a.type !== original.type;
            });

        setShowSaveButton(hasChanges);
    }, [formData, selectedService]);

    // Scroll to service card when selectedService changes
    useEffect(() => {
        if (selectedService?.id) {
            const element = document.getElementById('service');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [selectedService]);

    // Handle Save button click
    const handleSave = useCallback(async () => {
        if (!selectedService || !formData || !team?.id) return;

        // Validate formData
        if (formData.name.length < 3) {
            addToast({
                title: "Erro",
                description: "O nome do serviço deve ter pelo menos 3 caracteres.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (formData.description && formData.description.length < 5) {
            addToast({
                title: "Erro",
                description: "A descrição deve ter pelo menos 5 caracteres.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (!serviceTypes.some((st: ServiceType) => st.id === formData.type_id)) {
            addToast({
                title: "Erro",
                description: "Selecione um tipo de serviço válido.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (formData.price !== null && (formData.price < 0 || isNaN(formData.price))) {
            addToast({
                title: "Erro",
                description: "O preço deve ser um valor válido e não negativo.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        if (formData.store_id && !stores.some((s: Store) => s.id === formData.store_id)) {
            addToast({
                title: "Erro",
                description: "Selecione uma loja válida.",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        let parsedCustomAttributes: Record<string, unknown> | null = null;
        if (formData.custom_attributes) {
            try {
                parsedCustomAttributes = JSON.parse(formData.custom_attributes);
            } catch {
                addToast({
                    title: "Erro",
                    description: "Os atributos personalizados devem ser um JSON válido.",
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }
        }

        // Handle attachments
        const attachmentData: { file: string; type: string }[] = [];
        for (const attachment of formData.attachments) {
            if (typeof attachment.file === 'string') {
                attachmentData.push({ file: attachment.file, type: attachment.type });
            } else {
                const file = attachment.file as File;
                if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                    addToast({
                        title: "Erro",
                        description: `O arquivo ${file.name} deve ser JPEG, PNG ou PDF.`,
                        color: "danger",
                        timeout: 3000,
                    });
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    addToast({
                        title: "Erro",
                        description: `O arquivo ${file.name} não pode exceder 5MB.`,
                        color: "danger",
                        timeout: 3000,
                    });
                    return;
                }

                const fileExt = file.type.split('/')[1];
                const randomName = Math.random().toString(36).substring(2, 15);
                const path = `${team.id}/${selectedService.id}/${randomName}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('services')
                    .upload(path, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type,
                    });

                if (uploadError) {
                    addToast({
                        title: "Erro",
                        description: `Erro ao carregar o arquivo ${file.name}: ${uploadError.message}`,
                        color: "danger",
                        timeout: 3000,
                    });
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('services').getPublicUrl(path);
                attachmentData.push({ file: publicUrl, type: attachment.type });
            }
        }

        try {
            await updateService(selectedService.id, {
                name: formData.name,
                description: formData.description || '',
                type: formData.type_id,
                price: formData.price || 0,
                duration: formData.duration || '',
                store_id: formData.store_id || '',
                custom_attributes: parsedCustomAttributes,
                attachments: attachmentData,
                status: formData.status,
            });
            setShowSaveButton(false);
            setSelectedService(null);
            addToast({
                title: "Sucesso",
                description: "Serviço atualizado com sucesso.",
                color: "primary",
                timeout: 3000,
            });
        } catch (error: any) {
            console.error("Error saving service:", error);
            addToast({
                title: "Erro",
                description: error.message || "Erro ao salvar o serviço.",
                color: "danger",
                timeout: 3000,
            });
        }
    }, [selectedService, formData, team, stores, serviceTypes, updateService, setSelectedService]);

    // Update formData for attachments
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const validFiles = files.filter((file) =>
            ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) && file.size <= 5 * 1024 * 1024
        );
        if (validFiles.length !== files.length) {
            addToast({
                title: "Erro",
                description: "Alguns arquivos não são válidos (apenas JPEG, PNG ou PDF, máx. 5MB).",
                color: "danger",
                timeout: 3000,
            });
        }
        setFormData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                attachments: [
                    ...prev.attachments.filter((a) => typeof a.file === 'string'),
                    ...validFiles.map((file) => ({
                        file,
                        type: file.type.startsWith('image') ? 'image' : 'pdf',
                    })),
                ],
            };
        });
    };

    // Remove an attachment
    const removeAttachment = (index: number) => {
        setFormData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                attachments: prev.attachments.filter((_, i) => i !== index),
            };
        });
    };

    if (!selectedService || !formData) {
        return (
            <div className="w-full flex flex-col p-5">
                <ServiceTable />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col p-5">
            <ServiceTable />
            <Card className="w-full flex flex-col mt-10" id="service">
                <CardBody>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 p-2">Informações do Serviço</h2>
                            <Input
                                label="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                description="Nome exibido para o serviço"
                            />
                            <Textarea
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                description="Texto descritivo visível aos clientes"
                            />
                            <Select
                                label="Tipo de Serviço"
                                selectedKeys={formData.type_id ? new Set([formData.type_id]) : new Set([])}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0] ?? '';
                                    setFormData({ ...formData, type_id: String(key) });
                                }}
                                description="Selecione o tipo de serviço"
                                items={serviceTypes}
                            >
                                {(type: ServiceType) => (
                                    <SelectItem key={type.id}>
                                        {type.name}
                                    </SelectItem>
                                )}
                            </Select>
                            <Input
                                label="Duração"
                                value={formData.duration ?? ''}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value || null })}
                                description="Duração estimada do serviço (ex: 1 hora)"
                                placeholder="1 hora"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4 p-2">Detalhes do Serviço</h2>
                            <NumericFormat
                                customInput={Input}
                                label="Preço"
                                thousandSeparator="."
                                decimalSeparator=","
                                fixedDecimalScale={true}
                                decimalScale={2}
                                prefix="R$ "
                                value={formData.price ?? ''}
                                onValueChange={(values) => {
                                    setFormData({ ...formData, price: values.floatValue ?? null });
                                }}
                                description="Preço do serviço"
                                placeholder="R$ 0,00"
                            />
                            <Select
                                label="Loja"
                                selectedKeys={formData.store_id ? new Set([formData.store_id]) : new Set([''])}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0] ?? '';
                                    setFormData({ ...formData, store_id: key === '' ? null : String(key) });
                                }}
                                description="Selecione a loja associada (opcional)"
                                items={[{ id: '', name: 'Nenhuma' }, ...stores]}
                            >
                                {(item: Store | { id: string; name: string }) => (
                                    <SelectItem key={item.id}>
                                        {item.name}
                                    </SelectItem>
                                )}
                            </Select>
                            <Select
                                label="Status"
                                selectedKeys={new Set([formData.status])}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0] ?? 'pending';
                                    setFormData({ ...formData, status: key as FormDataType['status'] });
                                }}
                                description="Selecione o status do serviço"
                                items={statusOptions}
                            >
                                {(item) => (
                                    <SelectItem key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                )}
                            </Select>
                            <Textarea
                                label="Atributos Personalizados (JSON)"
                                value={formData.custom_attributes}
                                onChange={(e) => setFormData({ ...formData, custom_attributes: e.target.value })}
                                description="Atributos em formato JSON (ex: {'warranty_days': 90})"
                                placeholder='{"warranty_days": 90}'
                            />
                        </div>
                    </div>
                    <div className="mt-5">
                        <h2 className="text-2xl font-bold mb-4 p-2">Anexos</h2>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            multiple
                            description="Adicione arquivos JPEG, PNG ou PDF (máx. 5MB por arquivo)"
                            onChange={handleAttachmentChange}
                        />
                        {formData.attachments.length > 0 && (
                            <div className="mt-4">
                                <p className="text-small text-default-500">Anexos:</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {formData.attachments.map((attachment, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            {typeof attachment.file === 'string' && attachment.type === 'image' ? (
                                                <Image
                                                    src={attachment.file}
                                                    alt={`Anexo ${index}`}
                                                    className="max-w-[100px] max-h-[100px] rounded-md"
                                                />
                                            ) : (
                                                <a
                                                    href={typeof attachment.file === 'string' ? attachment.file : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                >
                                                    {typeof attachment.file === 'string'
                                                        ? attachment.file.split('/').pop()
                                                        : (attachment.file as File).name} ({attachment.type})
                                                </a>
                                            )}
                                            <Button
                                                size="sm"
                                                color="danger"
                                                className="mt-2"
                                                onPress={() => removeAttachment(index)}
                                            >
                                                Remover
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardBody>
                {showSaveButton && (
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            radius="md"
                            color="default"
                            onPress={() => {
                                setFormData({
                                    name: selectedService.name,
                                    description: selectedService.description ?? '',
                                    type_id: selectedService.type_id,
                                    price: selectedService.price ?? null,
                                    duration: selectedService.duration ?? null,
                                    store_id: selectedService.store_id ?? null,
                                    custom_attributes: selectedService.custom_attributes ? JSON.stringify(selectedService.custom_attributes, null, 2) : '',
                                    attachments: selectedService.attachments?.map((a) => ({ file: a.file, type: a.type })) ?? [],
                                    status: selectedService.status,
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