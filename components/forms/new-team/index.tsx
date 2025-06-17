import { useTeam } from "@/contexts/team";
import { useUser } from "@/contexts/user";
import { supabase } from "@/supabase/client";
import { addToast, Avatar, Button, Form, Image, Input, ModalBody, ModalHeader } from "@heroui/react";
import { useState } from "react";
import { FaTrash, FaUsers } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";

interface NewTeamFormProps {
    onClose: () => void;
}

interface ImageMeta {
    name: string;
    type: string;
    size: number;
}

const NewTeamForm: React.FC<NewTeamFormProps> = ({ onClose }) => {
    const [serviceTypes, setServiceTypes] = useState<string[]>([""]);
    const [imageUri, setImageUri] = useState<string | undefined>();
    const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
    const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
    const { team, setTeam } = useTeam();
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleAddServiceType = () => {
        setServiceTypes([...serviceTypes, ""]);
    };

    const handleRemoveServiceType = (index: number) => {
        setServiceTypes(serviceTypes.filter((_, i) => i !== index));
    };

    const handleServiceTypeChange = (index: number, value: string) => {
        const newServiceTypes = [...serviceTypes];
        newServiceTypes[index] = value;
        setServiceTypes(newServiceTypes);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageUri(undefined);
            setImageBuffer(null);
            setImageMeta(null);
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
            addToast({
                title: "Erro ao selecionar imagem",
                description: "Selecione uma imagem válida (JPEG ou PNG, máx. 5MB).",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            setImageUri(undefined);
            setImageBuffer(null);
            setImageMeta(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (result && typeof result !== "string") {
                setImageBuffer(result);
                setImageMeta({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                });
                setImageUri(URL.createObjectURL(file));
            }
        };
        reader.onerror = () => {
            addToast({
                title: "Erro ao ler imagem",
                description: "Não foi possível ler o arquivo de imagem.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            setImageUri(undefined);
            setImageBuffer(null);
            setImageMeta(null);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        let newTeam: any = null;

        try {
            if (team?.id) {
                throw new Error("A equipe já foi criada.");
            }

            const formData = Object.fromEntries(new FormData(e.currentTarget));
            const { location, name, document } = formData;

            const missingFields = [];
            if (!name) missingFields.push("nome");
            if (!location) missingFields.push("localização");
            if (!document) missingFields.push("documento");

            if (missingFields.length > 0) {
                addToast({
                    title: "Erro",
                    description: `Preencha os campos obrigatórios: ${missingFields.join(", ")}.`,
                    color: "danger",
                    timeout: 3000,
                });
                return;
            }

            const { data, error: teamError } = await supabase
                .from("teams")
                .insert({ name, document, location })
                .select("*")
                .single();

            newTeam = data;

            if (teamError) throw teamError;

            const { error: memberError } = await supabase
                .from("team_members")
                .insert({
                    team_id: newTeam.id,
                    role: "admin",
                });

            if (memberError) throw memberError;

            let imagePath: string | null = null;
            if (imageBuffer && imageMeta) {
                const fileExt = imageMeta.type.split("/")[1];
                const randomName = Math.random().toString(36).substring(2, 15);
                imagePath = `${newTeam.id}/logos/${randomName}.${fileExt}`;

                const { error: imageError } = await supabase.storage
                    .from("team")
                    .upload(imagePath, imageBuffer, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: imageMeta.type,
                    });

                if (imageError) {
                    await supabase.from("teams").delete().eq("id", newTeam.id);
                    throw imageError;
                }

                const { data: imageData } = await supabase.storage.from("team").createSignedUrl(imagePath, 31536000);
                if (!imageData?.signedUrl) {
                    await supabase.from("teams").delete().eq("id", newTeam.id);
                    throw new Error("Falha ao gerar URL da imagem.");
                }

                const { error: updateError } = await supabase
                    .from("teams")
                    .update({ logo: imageData.signedUrl })
                    .eq("id", newTeam.id);

                if (updateError) {
                    await supabase.from("teams").delete().eq("id", newTeam.id);
                    throw updateError;
                }

                newTeam.image_path = imagePath;
            }

            if (serviceTypes.length > 0) {
                const { error: serviceError } = await supabase
                    .from("service_types")
                    .insert(
                        serviceTypes
                            .filter(type => type.trim())
                            .map(type => ({
                                team_id: newTeam.id,
                                name: type,
                            }))
                    );

                if (serviceError) {
                    await supabase.from("teams").delete().eq("id", newTeam.id);
                    throw serviceError;
                }
            }

            setTeam(newTeam);
            localStorage.setItem("team", JSON.stringify(newTeam));
            addToast({
                title: "Sucesso",
                description: "Equipe criada com sucesso!",
                color: "success",
                timeout: 3000,
            });
            onClose();
        } catch (error: any) {
            console.error("Erro ao criar equipe:", error.message);
            addToast({
                title: "Erro",
                description: "Falha ao criar a equipe. Tente novamente.",
                color: "danger",
                timeout: 3000,
            });
            if (newTeam?.id) {
                await supabase.from("teams").delete().eq("id", newTeam.id);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ModalHeader className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Bem-vindo!
                </h2>
                <p className="text-sm text-gray-500">
                    Você ainda não possui uma equipe. Preencha o formulário abaixo para criar uma.
                </p>
            </ModalHeader>
            <ModalBody className="space-y-2 overflow-auto scrollbar-none">
                <Form onSubmit={handleSubmit} >
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <h3 className="text-lg font-medium text-gray-700">Logo da Equipe</h3>
                        {imageUri ? (
                            <Image
                                src={imageUri}
                                alt="Logo da equipe"
                                className="rounded-md max-w-[200px] h-auto"
                                isZoomed
                            />
                        ) : (
                            <Avatar
                                className="w-32 h-32 rounded-md"
                                showFallback
                                fallback={<FaUsers className="w-12 h-12 text-gray-400" />}
                            />
                        )}
                        <Input
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png"
                            className="max-w-xs"
                            description="Selecione uma imagem JPEG ou PNG (máx. 5MB)."
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Team Information */}
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium text-gray-700">Informações da Equipe</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                isRequired
                                label="Nome"
                                name="name"
                                placeholder="Nome da equipe"
                                description="Digite o nome da sua equipe."
                                type="text"
                                className="w-full"
                            />
                            <Input
                                isRequired
                                label="Documento"
                                name="document"
                                placeholder="Ex: 12.345.678/0001-90"
                                description="Digite o documento da equipe (CNPJ ou CPF)."
                                type="text"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Service Types */}
                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between ">
                            <h3 className="text-lg font-medium text-gray-700">Tipos de Serviços</h3>
                            <Button
                                radius="sm"
                                size="sm"
                                color="primary"
                                onPress={handleAddServiceType}
                                aria-label="Adicionar serviço"
                            >
                                <IoMdAdd className="w-5 h-5" />
                                Adicionar
                            </Button>
                        </div>
                        {serviceTypes.map((serviceType, index) => (
                            <div key={index} className="flex items-justify gap-3">                                <Input
                                label={`Serviço ${index + 1}`}
                                value={serviceType}
                                onChange={(e) => handleServiceTypeChange(index, e.target.value)}
                                placeholder="Ex: Manutenção, Suporte"
                                description="Digite o tipo de serviço."
                                className="w-full"
                            />
                                <Button
                                    size="sm"
                                    radius="sm"
                                    color="danger"
                                    onPress={() => handleRemoveServiceType(index)}
                                    aria-label="Remover serviço"
                                    className="h-[55px] bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Location */}
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium text-gray-700">Localização</h3>
                        <Input
                            isRequired
                            label="Localização"
                            name="location"
                            placeholder="Ex: São Paulo, SP"
                            description="Digite a localização da equipe."
                            type="text"
                            className="w-full"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6 w-full">
                        <Button
                            radius="sm"
                            color="default"
                            onPress={onClose}
                            aria-label="Cancelar"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            isDisabled={loading}
                            isLoading={loading}
                            type="submit"
                            radius="sm"
                            color="primary"
                            aria-label="Criar Equipe"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Criar Equipe
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </>
    );
};

export default NewTeamForm;