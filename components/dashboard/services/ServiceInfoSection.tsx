import { useServices } from '@/contexts/services';
import { FormDataType } from '@/types/services';
import { Input, Select, SelectItem, Textarea } from '@heroui/react';

interface ServiceInfoSectionProps {
    formData: FormDataType;
    setFormData: (data: FormDataType) => void;
}

export default function ServiceInfoSection({ formData, setFormData }: ServiceInfoSectionProps) {
    const { serviceTypes } = useServices();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 p-2">Informações do Serviço</h2>
            <Input
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                description="Nome exibido para o serviço"
                isRequired
                aria-label="Nome do serviço"
            />
            <Textarea
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                description="Texto descritivo visível aos clientes"
                aria-label="Descrição do serviço"
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
                isRequired
                aria-label="Tipo de serviço"
            >
                {(type) => <SelectItem key={type.id}>{type.name}</SelectItem>}
            </Select>
            <Input
                label="Duração"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value || null })}
                description="Duração estimada do serviço (ex: 1 hora)"
                placeholder="1 hora"
                aria-label="Duração do serviço"
            />
        </div>
    );
}