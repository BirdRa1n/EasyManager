import { useServices } from '@/contexts/services';
import { useTeam } from '@/contexts/team';
import { supabase } from '@/supabase/client';
import { CustomAttribute, FormDataType, ServiceType, Store } from '@/types/services';
import { addToast } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';

export const useServiceForm = () => {
    const { selectedService, setSelectedService, updateService, loading, serviceTypes } = useServices();
    const { stores, team } = useTeam();
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [showSaveButton, setShowSaveButton] = useState(false);

    // Initialize formData when selectedService changes
    useEffect(() => {
        if (selectedService) {
            let customAttributes: CustomAttribute[] = [];
            if (selectedService.custom_attributes) {
                try {
                    const parsed = selectedService.custom_attributes as Record<string, unknown>;
                    customAttributes = Object.entries(parsed).map(([key, value]) => ({
                        key,
                        value: String(value),
                    }));
                } catch {
                    console.warn('Invalid custom_attributes format');
                }
            }
            setFormData({
                name: selectedService.name,
                description: selectedService.description ?? '',
                type_id: selectedService.type_id,
                price: selectedService.price ?? null,
                duration: selectedService.duration ?? null,
                store_id: selectedService.store_id ?? null,
                custom_attributes: customAttributes,
                attachments: selectedService.attachments?.map((a) => ({ file: a.file, type: a.type })) ?? [],
                status: selectedService.status,
                customer_name: selectedService.service_client?.[0]?.name ?? '',
                customer_email: selectedService.service_client?.[0]?.email ?? '',
                customer_phone: selectedService.service_client?.[0]?.phone ?? '',
                customer_address: selectedService.service_client?.[0]?.address ?? '',
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

        const selectedCustomAttrs = selectedService.custom_attributes
            ? Object.entries(selectedService.custom_attributes).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {} as Record<string, string>)
            : {};

        const formCustomAttrs = formData.custom_attributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
        }, {} as Record<string, string>);

        const hasChanges =
            formData.name !== selectedService.name ||
            formData.description !== (selectedService.description ?? '') ||
            formData.type_id !== selectedService.type_id ||
            formData.price !== (selectedService.price ?? null) ||
            formData.duration !== (selectedService.duration ?? null) ||
            formData.store_id !== (selectedService.store_id ?? null) ||
            JSON.stringify(formCustomAttrs) !== JSON.stringify(selectedCustomAttrs) ||
            formData.status !== selectedService.status ||
            formData.attachments.length !== (selectedService.attachments?.length ?? 0) ||
            formData.attachments.some((a, i) => {
                const original = selectedService.attachments?.[i] ?? { file: '', type: '' };
                return typeof a.file !== 'string' || a.file !== original.file || a.type !== original.type;
            }) ||
            formData.customer_name !== (selectedService.service_client?.[0]?.name ?? '') ||
            formData.customer_email !== (selectedService.service_client?.[0]?.email ?? '') ||
            formData.customer_phone !== (selectedService.service_client?.[0]?.phone ?? '') ||
            formData.customer_address !== (selectedService.service_client?.[0]?.address ?? '');

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
                title: 'Erro',
                description: 'O nome do serviço deve ter pelo menos 3 caracteres.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.description && formData.description.length < 5) {
            addToast({
                title: 'Erro',
                description: 'A descrição deve ter pelo menos 5 caracteres.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (!serviceTypes.some((st: ServiceType) => st.id === formData.type_id)) {
            addToast({
                title: 'Erro',
                description: 'Selecione um tipo de serviço válido.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.price !== null && (formData.price < 0 || isNaN(formData.price))) {
            addToast({
                title: 'Erro',
                description: 'O preço deve ser um valor válido e não negativo.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.store_id && !stores.some((s: Store) => s.id === formData.store_id)) {
            addToast({
                title: 'Erro',
                description: 'Selecione uma loja válida.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        // Validate client fields
        if (formData.customer_name.length < 3) {
            addToast({
                title: 'Erro',
                description: 'O nome do cliente deve ter pelo menos 3 caracteres.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
            addToast({
                title: 'Erro',
                description: 'Digite um email válido para o cliente.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.customer_phone.length < 10) {
            addToast({
                title: 'Erro',
                description: 'O telefone do cliente deve ter pelo menos 10 caracteres.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.customer_address.length < 5) {
            addToast({
                title: 'Erro',
                description: 'O endereço do cliente deve ter pelo menos 5 caracteres.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        // Validate custom attributes
        const customAttrKeys = new Set(formData.custom_attributes.map((attr) => attr.key));
        if (customAttrKeys.size !== formData.custom_attributes.length) {
            addToast({
                title: 'Erro',
                description: 'As chaves dos atributos personalizados devem ser únicas.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        if (formData.custom_attributes.some((attr) => !attr.key.trim())) {
            addToast({
                title: 'Erro',
                description: 'As chaves dos atributos personalizados não podem estar vazias.',
                color: 'danger',
                timeout: 3000,
            });
            return;
        }

        const parsedCustomAttributes: Record<string, string> = formData.custom_attributes.reduce((acc, attr) => {
            acc[attr.key] = attr.value;
            return acc;
        }, {} as Record<string, string>);

        // Handle attachments
        const attachmentData: { file: string; type: string }[] = [];
        for (const attachment of formData.attachments) {
            if (typeof attachment.file === 'string') {
                attachmentData.push({ file: attachment.file, type: attachment.type });
            } else {
                const file = attachment.file as File;
                if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                    addToast({
                        title: 'Erro',
                        description: `O arquivo ${file.name} deve ser JPEG, PNG ou PDF.`,
                        color: 'danger',
                        timeout: 3000,
                    });
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    addToast({
                        title: 'Erro',
                        description: `O arquivo ${file.name} não pode exceder 5MB.`,
                        color: 'danger',
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
                        title: 'Erro',
                        description: `Erro ao carregar o arquivo ${file.name}: ${uploadError.message}`,
                        color: 'danger',
                        timeout: 3000,
                    });
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('services').getPublicUrl(path);
                attachmentData.push({ file: publicUrl, type: attachment.type });
            }
        }

        try {
            // Update service
            await updateService(selectedService.id, {
                name: formData.name,
                description: formData.description || '',
                type: formData.type_id || '',
                price: formData.price || 0,
                duration: formData.duration || '',
                store_id: formData.store_id || '',
                custom_attributes: Object.keys(parsedCustomAttributes).length ? parsedCustomAttributes : null,
                attachments: attachmentData,
                status: formData.status,
            });

            // Update client data
            if (selectedService.service_client?.[0]?.id) {
                const { error: clientError } = await supabase
                    .from('service_client')
                    .update({
                        name: formData.customer_name,
                        email: formData.customer_email,
                        phone: formData.customer_phone,
                        address: formData.customer_address,
                    })
                    .eq('id', selectedService.service_client[0].id)
                    .eq('team_id', team.id);

                if (clientError) {
                    throw new Error(`Erro ao atualizar dados do cliente: ${clientError.message}`);
                }
            } else {
                // Insert new client data if none exists
                const clientData = {
                    name: formData.customer_name,
                    email: formData.customer_email,
                    phone: formData.customer_phone,
                    address: formData.customer_address,
                    team_id: team.id,
                    service_id: selectedService.id,
                    created_at: new Date().toISOString(),
                };
                const { error: clientError } = await supabase
                    .from('service_client')
                    .insert(clientData);

                if (clientError) {
                    throw new Error(`Erro ao adicionar dados do cliente: ${clientError.message}`);
                }
            }

            setShowSaveButton(false);
            setSelectedService(null);
        } catch (error: any) {
            console.error('Error saving service or client:', error);
            addToast({
                title: 'Erro',
                description: error.message || 'Erro ao salvar o serviço ou dados do cliente.',
                color: 'danger',
                timeout: 3000,
            });
        } finally {
            setFormData(null);
            setSelectedService(null);
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
                title: 'Erro',
                description: 'Alguns arquivos não são válidos (apenas JPEG, PNG ou PDF, máx. 5MB).',
                color: 'danger',
                timeout: 3000,
            });
        }
        setFormData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                attachments: [
                    ...prev.attachments,
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

    // Update custom attribute
    const updateCustomAttribute = (index: number, field: 'key' | 'value', value: string) => {
        setFormData((prev) => {
            if (!prev) return null;
            const updatedAttrs = [...prev.custom_attributes];
            updatedAttrs[index] = { ...updatedAttrs[index], [field]: value };
            return { ...prev, custom_attributes: updatedAttrs };
        });
    };

    // Add custom attribute
    const addCustomAttribute = () => {
        setFormData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                custom_attributes: [
                    ...prev.custom_attributes,
                    { key: '', value: '' },
                ],
            };
        });
    };

    // Remove custom attribute
    const removeCustomAttribute = (index: number) => {
        setFormData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                custom_attributes: prev.custom_attributes.filter((_, i) => i !== index),
            };
        });
    };

    // Handle Cancel button click
    const handleCancel = () => {
        if (!selectedService) return;
        let customAttributes: CustomAttribute[] = [];
        if (selectedService.custom_attributes) {
            try {
                const parsed = selectedService.custom_attributes as Record<string, unknown>;
                customAttributes = Object.entries(parsed).map(([key, value]) => ({
                    key,
                    value: String(value),
                }));
            } catch {
                console.warn('Invalid custom_attributes format');
            }
        }
        setFormData({
            name: selectedService.name,
            description: selectedService.description ?? '',
            type_id: selectedService.type_id,
            price: selectedService.price ?? null,
            duration: selectedService.duration ?? null,
            store_id: selectedService.store_id ?? null,
            custom_attributes: customAttributes,
            attachments: selectedService.attachments?.map((a) => ({ file: a.file, type: a.type })) ?? [],
            status: selectedService.status,
            customer_name: selectedService.service_client?.[0]?.name ?? '',
            customer_email: selectedService.service_client?.[0]?.email ?? '',
            customer_phone: selectedService.service_client?.[0]?.phone ?? '',
            customer_address: selectedService.service_client?.[0]?.address ?? '',
        });
        setShowSaveButton(false);
    };

    return {
        formData,
        showSaveButton,
        handleSave,
        handleCancel,
        handleAttachmentChange,
        removeAttachment,
        updateCustomAttribute,
        addCustomAttribute,
        removeCustomAttribute,
        setFormData,
    };
};