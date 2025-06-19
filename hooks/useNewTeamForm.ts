import { useTeam } from '@/contexts/team';
import { useUser } from '@/contexts/user';
import { supabase } from '@/supabase/client';
import { NewTeamFormData } from '@/types/team';
import { addToast } from '@heroui/react';
import { useCallback, useState } from 'react';

export const useNewTeamForm = (onClose: () => void) => {
    const { team, setTeam } = useTeam();
    const { user } = useUser();
    const [formData, setFormData] = useState<NewTeamFormData>({
        name: '',
        document: '',
        location: '',
        service_types: [''],
        image_buffer: null,
        image_meta: null,
        image_uri: undefined,
    });
    const [loading, setLoading] = useState<boolean>(false);

    // Add service type
    const handleAddServiceType = () => {
        setFormData((prev) => ({
            ...prev,
            service_types: [...prev.service_types, ''],
        }));
    };

    // Remove service type
    const handleRemoveServiceType = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            service_types: prev.service_types.filter((_, i) => i !== index),
        }));
    };

    // Update service type
    const handleServiceTypeChange = (index: number, value: string) => {
        setFormData((prev) => {
            const newServiceTypes = [...prev.service_types];
            newServiceTypes[index] = value;
            return { ...prev, service_types: newServiceTypes };
        });
    };

    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setFormData((prev) => ({
                ...prev,
                image_uri: undefined,
                image_buffer: null,
                image_meta: null,
            }));
            return;
        }

        if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            addToast({
                title: 'Erro ao selecionar imagem',
                description: 'Selecione uma imagem válida (JPEG ou PNG, máx. 5MB).',
                variant: 'solid',
                color: 'danger',
                timeout: 3000,
            });
            setFormData((prev) => ({
                ...prev,
                image_uri: undefined,
                image_buffer: null,
                image_meta: null,
            }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (result && typeof result !== 'string') {
                setFormData((prev) => ({
                    ...prev,
                    image_buffer: result,
                    image_meta: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    },
                    image_uri: URL.createObjectURL(file),
                }));
            }
        };
        reader.onerror = () => {
            addToast({
                title: 'Erro ao ler imagem',
                description: 'Não foi possível ler o arquivo de imagem.',
                variant: 'solid',
                color: 'danger',
                timeout: 3000,
            });
            setFormData((prev) => ({
                ...prev,
                image_uri: undefined,
                image_buffer: null,
                image_meta: null,
            }));
        };
        reader.readAsArrayBuffer(file);
    };

    // Handle submit
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setLoading(true);

            let newTeam: any = null;

            try {
                if (team?.id) {
                    throw new Error('A equipe já foi criada.');
                }

                const { name, document, location, service_types, image_buffer, image_meta } = formData;

                const missingFields = [];
                if (!name) missingFields.push('nome');
                if (!document) missingFields.push('documento');
                if (!location) missingFields.push('localização');

                if (missingFields.length > 0) {
                    addToast({
                        title: 'Erro',
                        description: `Preencha os campos obrigatórios: ${missingFields.join(', ')}.`,
                        color: 'danger',
                        variant: 'solid',
                        timeout: 3000,
                    });
                    return;
                }

                const { data, error: teamError } = await supabase
                    .from('teams')
                    .insert({ name, document, location })
                    .select('*')
                    .single();

                newTeam = data;

                if (teamError) throw teamError;

                const { error: memberError } = await supabase
                    .from('team_members')
                    .insert({
                        team_id: newTeam.id,
                        user_id: user?.id,
                        role: 'admin',
                    });

                if (memberError) throw memberError;

                let imagePath: string | null = null;
                if (image_buffer && image_meta) {
                    const fileExt = image_meta.type.split('/')[1];
                    const randomName = Math.random().toString(36).substring(2, 15);
                    imagePath = `${newTeam.id}/logos/${randomName}.${fileExt}`;

                    const { error: imageError } = await supabase.storage
                        .from('team')
                        .upload(imagePath, image_buffer, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: image_meta.type,
                        });

                    if (imageError) {
                        await supabase.from('teams').delete().eq('id', newTeam.id);
                        throw imageError;
                    }

                    const { data: imageData } = await supabase.storage
                        .from('team')
                        .createSignedUrl(imagePath, 31536000);
                    if (!imageData?.signedUrl) {
                        await supabase.from('teams').delete().eq('id', newTeam.id);
                        throw new Error('Falha ao gerar URL da imagem.');
                    }

                    const { error: updateError } = await supabase
                        .from('teams')
                        .update({ logo: imageData.signedUrl })
                        .eq('id', newTeam.id);

                    if (updateError) {
                        await supabase.from('teams').delete().eq('id', newTeam.id);
                        throw updateError;
                    }

                    newTeam.logo = imageData.signedUrl;
                }

                if (service_types.length > 0) {
                    const { error: serviceError } = await supabase
                        .from('service_types')
                        .insert(
                            service_types
                                .filter((type) => type.trim())
                                .map((type) => ({
                                    team_id: newTeam.id,
                                    name: type,
                                }))
                        );

                    if (serviceError) {
                        await supabase.from('teams').delete().eq('id', newTeam.id);
                        throw serviceError;
                    }
                }

                setTeam(newTeam);
                localStorage.setItem('team', JSON.stringify(newTeam));
                addToast({
                    title: 'Sucesso',
                    description: 'Equipe criada com sucesso!',
                    color: 'primary',
                    variant: 'solid',
                    timeout: 3000,
                });
                onClose();
            } catch (error: any) {
                console.error('Erro ao criar equipe:', error.message);
                addToast({
                    title: 'Erro',
                    description: 'Falha ao criar a equipe. Tente novamente.',
                    color: 'danger',
                    variant: 'solid',
                    timeout: 3000,
                });
                if (newTeam?.id) {
                    await supabase.from('teams').delete().eq('id', newTeam.id);
                }
            } finally {
                setLoading(false);
            }
        },
        [formData, team, setTeam, user, onClose]
    );

    return {
        formData,
        setFormData,
        loading,
        handleSubmit,
        handleAddServiceType,
        handleRemoveServiceType,
        handleServiceTypeChange,
        handleImageChange,
    };
};