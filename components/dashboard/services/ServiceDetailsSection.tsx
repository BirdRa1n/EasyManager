import { useTeam } from '@/contexts/team';
import { FormDataType } from '@/types/services';
import { Input, Select, SelectItem } from '@heroui/react';

const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
];

interface ServiceDetailsSectionProps {
    formData: FormDataType;
    setFormData: (data: FormDataType) => void;
}

export default function ServiceDetailsSection({ formData, setFormData }: ServiceDetailsSectionProps) {
    const { stores } = useTeam();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 p-2">Detalhes do Serviço</h2>
            <Input
                label="Preço"
                type="number"
                value={formData.price !== null ? String(formData.price) : ''}
                onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, price: value ? Number(value) : null });
                }}
                description="Preço do serviço (em reais)"
                placeholder="0,00"
                step="0.01"
                min="0"
                aria-label="Preço do serviço"
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
                aria-label="Loja associada"
            >
                {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
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
                isRequired
                aria-label="Status do serviço"
            >
                {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
            </Select>
        </div>
    );
}