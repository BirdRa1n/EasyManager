import { useServices } from '@/contexts/services';
import { useTeam } from '@/contexts/team';
import { NewFormDataType } from '@/types/services';
import { Input, Select, SelectItem, Textarea } from '@heroui/react';

interface ServiceInfoSectionProps {
    formData: NewFormDataType;
    setFormData: (data: NewFormDataType) => void;
}

export default function ServiceInfoSection({ formData, setFormData }: ServiceInfoSectionProps) {
    const { serviceTypes } = useServices();
    const { stores } = useTeam();

    return (
        <div>
            <p className="text-default-600 text-sm mb-2">Informações do serviço</p>
            <Input
                name="name"
                label="Nome do serviço"
                size="md"
                placeholder="Ex: Reparo de Tela de Celular"
                description="Digite o nome do serviço (mínimo 3 caracteres)."
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                value={formData.name}
            />
            <Textarea
                name="description"
                label="Descrição do serviço"
                size="md"
                placeholder="Ex: Reparo de telas quebradas para diversos modelos de celulares..."
                description="Digite a descrição do serviço (mínimo 5 caracteres)."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
                name="type_id"
                label="Tipo de serviço"
                placeholder="Selecione o tipo"
                description="Selecione o tipo de serviço."
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                value={formData.type_id}
            >
                {serviceTypes.map((st) => (
                    <SelectItem key={st.id}>{st.name}</SelectItem>
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
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                value={formData.price}
            />
            <Input
                name="duration"
                label="Duração"
                size="md"
                placeholder="Ex: 1 hora"
                description="Digite a duração do serviço (opcional)."
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                value={formData.duration}
            />
            <Select
                name="store_id"
                label="Loja"
                placeholder="Selecione a loja"
                description="Selecione a loja associada (opcional)."
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                value={formData.store_id}
            >
                {stores.map((store) => (
                    <SelectItem key={store.id}>{store.name}</SelectItem>
                ))}
            </Select>
        </div>
    );
}