import { NewFormDataType } from '@/types/services';
import { Input, Textarea } from '@heroui/react';

interface CustomerInfoSectionProps {
    formData: NewFormDataType;
    setFormData: (data: NewFormDataType) => void;
}

export default function CustomerInfoSection({ formData, setFormData }: CustomerInfoSectionProps) {
    return (
        <div className="w-full">
            <p className="text-default-600 text-sm mb-2">Cliente</p>
            <Input
                name="customer_name"
                label="Nome do cliente"
                size="md"
                placeholder="Ex: João da Silva"
                description="Digite o nome do cliente (mínimo 3 caracteres)."
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                value={formData.customer_name}
            />
            <Input
                name="customer_email"
                label="Email do cliente"
                size="md"
                placeholder="Ex: joao@example.com"
                description="Digite o email do cliente (mínimo 3 caracteres)."
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                value={formData.customer_email}
            />
            <Input
                name="customer_phone"
                label="Telefone do cliente"
                size="md"
                placeholder="Ex: (99) 99999-9999"
                description="Digite o telefone do cliente (mínimo 10 caracteres)."
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                value={formData.customer_phone}
            />
            <Textarea
                name="customer_address"
                label="Endereço do cliente"
                size="md"
                placeholder="Ex: Rua das Flores, 123"
                description="Digite o endereço do cliente (mínimo 5 caracteres)."
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                value={formData.customer_address}
            />
        </div>
    );
}