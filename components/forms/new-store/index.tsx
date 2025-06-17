import { useTeam } from "@/contexts/team";
import { supabase } from "@/supabase/client";
import { addToast, Button, Form, Input, ModalBody, ModalHeader, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";

interface NewStoreFormProps {
    onClose: () => void;
}

interface Contact {
    type: string;
    value: string;
}

export default function NewStoreForm({ onClose }: NewStoreFormProps) {
    const [storeContacts, setStoreContacts] = useState<Contact[]>([{ type: "", value: "" }]);
    const { team, fetchStores } = useTeam();

    const handleAddContact = () => {
        setStoreContacts([...storeContacts, { type: "", value: "" }]);
    };

    const handleRemoveContact = (index: number) => {
        setStoreContacts(storeContacts.filter((_, i) => i !== index));
    };

    const handleContactChange = (index: number, field: keyof Contact, value: string) => {
        const newStoreContacts = [...storeContacts];
        newStoreContacts[index][field] = value;
        setStoreContacts(newStoreContacts);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.currentTarget));

        if (storeContacts.length === 0 || storeContacts.some(contact => !contact.type || !contact.value)) {
            addToast({
                title: "Erro",
                description: "Adicione pelo menos um contato válido com tipo e valor.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        const { name, address, city, state, zip_code } = formData;
        const requiredFields = ["name", "address", "city", "state", "zip_code"];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            addToast({
                title: "Erro",
                description: `Preencha os campos: ${missingFields.join(", ")}.`,
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            return;
        }

        try {
            const { data, error } = await supabase.from("stores").insert({
                name,
                team_id: team?.id,
            }).select().maybeSingle();

            if (error) throw error;

            if (data) {
                const store_id = data.id;

                await supabase.from("store_contacts").insert(
                    storeContacts.map(contact => ({
                        store_id,
                        team_id: team?.id,
                        type: contact.type,
                        value: contact.value,
                    }))
                );

                await supabase.from("store_address").insert({
                    store_id,
                    team_id: team?.id,
                    address,
                    city,
                    state,
                    zip_code,
                    country: "Brazil",
                });

                addToast({
                    title: "Sucesso",
                    description: "Loja criada com sucesso!",
                    variant: "solid",
                    color: "primary",
                    timeout: 3000,
                });
                onClose();
                fetchStores();
            }
        } catch (error) {
            addToast({
                title: "Erro",
                description: "Ocorreu um erro ao criar a loja.",
                variant: "solid",
                color: "danger",
                timeout: 3000,
            });
            if (error instanceof Error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <ModalHeader className="text-2xl">
                Criar Nova Loja
            </ModalHeader>
            <ModalBody className="w-full">
                <Form onSubmit={handleSubmit} className="space-y-0">
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium text-gray-700">Informações da Loja</h3>
                        <Input
                            name="name"
                            label="Nome da Loja"
                            placeholder="Ex: Loja Central"
                            description="Digite o nome da loja"
                            className="w-full"
                            required
                        />
                    </div>

                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-700">Contatos</h3>
                            <Button
                                radius="sm"
                                size="sm"
                                color="primary"
                                onPress={handleAddContact}
                                aria-label="Adicionar contato"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <IoMdAdd className="w-5 h-5" />
                                Adicionar
                            </Button>
                        </div>
                        {storeContacts.map((contact, index) => (
                            <div key={index} className="flex items-justify  gap-3">
                                <Select
                                    size="md"
                                    name="type"
                                    label="Tipo de Contato"
                                    placeholder="Selecione o tipo"
                                    description="Escolha o tipo de contato"
                                    className="w-1/3"
                                    required
                                    onChange={(e) => handleContactChange(index, "type", e.target.value)}
                                    items={[
                                        { label: "E-mail", key: "email" },
                                        { label: "Telefone", key: "phone" },
                                    ]}
                                >
                                    {(type) => <SelectItem>{type.label}</SelectItem>}
                                </Select>
                                <Input
                                    type={contact.type === "email" ? "email" : "tel"}
                                    name="value"
                                    size="md"
                                    value={contact.value}
                                    onChange={(e) => handleContactChange(index, "value", e.target.value)}
                                    label="Contato"
                                    placeholder={contact.type === "email" ? "Ex: contato@loja.com" : "Ex: (99) 99999-9999"}
                                    description={contact.type === "email" ? "Digite o e-mail" : "Digite o telefone"}
                                    className="w-2/3"
                                    required
                                />
                                <Button
                                    size="md"
                                    radius="sm"
                                    color="danger"
                                    onPress={() => handleRemoveContact(index)}
                                    aria-label="Remover contato"
                                    className="h-[57px]"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium text-gray-700">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="address"
                                label="Endereço"
                                placeholder="Ex: Rua Tertuliano Santos, 160, Centro"
                                description="Digite o endereço completo"
                                className="w-full"
                                required
                            />
                            <Input
                                name="city"
                                label="Cidade"
                                placeholder="Ex: São Paulo"
                                description="Digite o nome da cidade"
                                className="w-full"
                                required
                            />
                            <Input
                                name="state"
                                label="Estado"
                                placeholder="Ex: SP"
                                description="Digite a sigla do estado"
                                className="w-full"
                                required
                            />
                            <Input
                                name="zip_code"
                                label="CEP"
                                placeholder="Ex: 99999-999"
                                description="Digite o CEP"
                                className="w-full"
                                required
                            />
                        </div>
                    </div>

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
                            type="submit"
                            radius="sm"
                            color="primary"
                            aria-label="Salvar"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Salvar
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </div>
    );
}