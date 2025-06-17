import { useServices } from '@/contexts/services';
import { useTeam } from '@/contexts/team';
import { supabase } from '@/supabase/client';
import { NewFormDataType } from '@/types/services';
import { addToast } from '@heroui/react';
import { useCallback, useState } from 'react';

export const useNewServiceForm = (onClose: () => void) => {
    const { team, stores } = useTeam();
    const { serviceTypes, services, setServices, fetchService } = useServices();
    const [formData, setFormData] = useState<NewFormDataType>({
        name: '',
        description: '',
        type_id: '',
        price: '',
        duration: '',
        store_id: '',
        custom_attributes: [],
        attachments: [],
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
    });
    const [loading, setLoading] = useState<boolean>(false);

    // Add custom attribute
    const addCustomAttribute = () => {
        setFormData((prev) => ({
            ...prev,
            custom_attributes: [...prev.custom_attributes, { key: '', value: '' }],
        }));
    };

    // Update custom attribute
    const updateCustomAttribute = (index: number, field: 'key' | 'value', value: string) => {
        setFormData((prev) => {
            const updatedAttrs = [...prev.custom_attributes];
            updatedAttrs[index] = { ...updatedAttrs[index], [field]: value };
            return { ...prev, custom_attributes: updatedAttrs };
        });
    };

    // Remove custom attribute
    const removeCustomAttribute = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            custom_attributes: prev.custom_attributes.filter((_, i) => i !== index),
        }));
    };

    // Handle attachment change
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) =>
            ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) && file.size <= 5 * 1024 * 1024
        );
        if (validFiles.length !== files.length) {
            addToast({
                title: 'Erro ao selecionar arquivos',
                description: 'Alguns arquivos não são válidos (apenas JPEG, PNG ou PDF, máx. 5MB).',
                variant: 'solid',
                color: 'danger',
                timeout: 3000,
            });
        }
        setFormData((prev) => ({
            ...prev,
            attachments: validFiles.map((file) => ({
                file,
                type: file.type.startsWith('image') ? 'image' : 'pdf',
            })),
        }));
    };

    // Handle submit
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            // Validate form fields
            if (!formData.name || formData.name.length < 3) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'O nome do serviço deve ter pelo menos 3 caracteres.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.description || formData.description.length < 5) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'A descrição do serviço deve ter pelo menos 5 caracteres.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.type_id || !serviceTypes.some((st) => st.id === formData.type_id)) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'Selecione um tipo de serviço válido.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (formData.price && isNaN(Number(formData.price))) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'O preço deve ser um número válido.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (formData.store_id && !stores.some((s) => s.id === formData.store_id)) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'Selecione uma loja válida.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.customer_name || formData.customer_name.length < 3) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'O nome do cliente deve ter pelo menos 3 caracteres.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'Digite um email válido para o cliente.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.customer_phone || formData.customer_phone.length < 10) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'O telefone do cliente deve ter pelo menos 10 caracteres.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!formData.customer_address || formData.customer_address.length < 5) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'O endereço do cliente deve ter pelo menos 5 caracteres.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            const customAttrKeys = new Set(formData.custom_attributes.map((attr) => attr.key));
            if (customAttrKeys.size !== formData.custom_attributes.length) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'As chaves dos atributos personalizados devem ser únicas.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (formData.custom_attributes.some((attr) => !attr.key.trim())) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'As chaves dos atributos personalizados não podem estar vazias.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            if (!team?.id) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: 'Nenhum time selecionado.',
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }

            const parsedCustomAttributes: Record<string, string> = formData.custom_attributes.reduce(
                (acc, attr) => {
                    acc[attr.key] = attr.value;
                    return acc;
                },
                {} as Record<string, string>
            );

            const { data: { user } } = await supabase.auth.getUser();

            const serviceData = {
                name: formData.name,
                description: formData.description,
                type_id: formData.type_id,
                team_id: team.id,
                price: formData.price ? Number(formData.price) : null,
                duration: formData.duration || null,
                store_id: formData.store_id || null,
                custom_attributes: Object.keys(parsedCustomAttributes).length ? parsedCustomAttributes : null,
                created_by: user?.id || null,
                attachments: [] as { file: string; type: string }[],
                status: 'pending' as const,
            };

            try {
                setLoading(true);
                const { data: service, error: serviceError } = await supabase
                    .from('services')
                    .insert(serviceData)
                    .select('*, service_types!type_id(name), stores(id, name)')
                    .maybeSingle();

                if (serviceError) {
                    addToast({
                        title: 'Erro ao adicionar serviço',
                        description: serviceError.message,
                        variant: 'solid',
                        color: 'danger',
                        timeout: 3000,
                    });
                    return;
                }

                if (service) {
                    const clientData = {
                        name: formData.customer_name,
                        email: formData.customer_email,
                        phone: formData.customer_phone,
                        address: formData.customer_address,
                        team_id: team.id,
                        service_id: service.id,
                        created_at: new Date().toISOString(),
                    };

                    const { error: clientError } = await supabase.from('service_client').insert(clientData);

                    if (clientError) {
                        await supabase.from('services').delete().eq('id', service.id);
                        addToast({
                            title: 'Erro ao adicionar serviço',
                            description: `Erro ao adicionar dados do cliente: ${clientError.message}`,
                            variant: 'solid',
                            color: 'danger',
                            timeout: 3000,
                        });
                        return;
                    }

                    if (formData.attachments.length > 0) {
                        const attachmentData: { file: string; type: string }[] = [];
                        for (const attachment of formData.attachments) {
                            const { file, type } = attachment;
                            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                                await supabase.from('services').delete().eq('id', service.id);
                                await supabase.from('service_client').delete().eq('service_id', service.id);
                                addToast({
                                    title: 'Erro ao adicionar serviço',
                                    description: `O arquivo ${file.name} deve ser JPEG, PNG ou PDF.`,
                                    variant: 'solid',
                                    color: 'danger',
                                    timeout: 3000,
                                });
                                return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                                await supabase.from('services').delete().eq('id', service.id);
                                await supabase.from('service_client').delete().eq('service_id', service.id);
                                addToast({
                                    title: 'Erro ao adicionar serviço',
                                    description: `O arquivo ${file.name} não pode exceder 5MB.`,
                                    variant: 'solid',
                                    color: 'danger',
                                    timeout: 3000,
                                });
                                return;
                            }

                            const fileExt = file.type.split('/')[1];
                            const randomName = Math.random().toString(36).substring(2, 15);
                            const path = `${team.id}/${service.id}/${randomName}.${fileExt}`;

                            const { error: uploadError } = await supabase.storage
                                .from('services')
                                .upload(path, file, {
                                    cacheControl: '3600',
                                    upsert: false,
                                    contentType: file.type,
                                });

                            if (uploadError) {
                                await supabase.from('services').delete().eq('id', service.id);
                                await supabase.from('service_client').delete().eq('service_id', service.id);
                                addToast({
                                    title: 'Erro ao adicionar serviço',
                                    description: uploadError.message,
                                    variant: 'solid',
                                    color: 'danger',
                                    timeout: 3000,
                                });
                                return;
                            }

                            const { data: { publicUrl } } = supabase.storage.from('services').getPublicUrl(path);
                            attachmentData.push({ file: publicUrl, type });
                        }

                        const { error: updateError } = await supabase
                            .from('services')
                            .update({ attachments: attachmentData })
                            .eq('id', service.id);

                        if (updateError) {
                            await supabase.from('services').delete().eq('id', service.id);
                            await supabase.from('service_client').delete().eq('service_id', service.id);
                            addToast({
                                title: 'Erro ao adicionar serviço',
                                description: updateError.message,
                                variant: 'solid',
                                color: 'danger',
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
                        title: 'Sucesso',
                        description: 'Serviço e dados do cliente adicionados com sucesso.',
                        variant: 'solid',
                        color: 'primary',
                        timeout: 3000,
                    });
                }
            } catch (error: any) {
                addToast({
                    title: 'Erro ao adicionar serviço',
                    description: error?.message,
                    variant: 'solid',
                    color: 'danger',
                    timeout: 3000,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, team, stores, serviceTypes, services, setServices, fetchService, onClose]
    );

    return {
        formData,
        setFormData,
        loading,
        handleSubmit,
        addCustomAttribute,
        updateCustomAttribute,
        removeCustomAttribute,
        handleAttachmentChange,
    };
};