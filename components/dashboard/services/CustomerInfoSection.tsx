import { FormDataType } from '@/types/services';
import { Input, Textarea } from '@heroui/react';

interface CustomerInfoSectionProps {
    formData: FormDataType;
    setFormData: (data: FormDataType) => void;
}

export default function CustomerInfoSection({ formData, setFormData }: CustomerInfoSectionProps) {
    return (
        <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4 p-2">Informações do Cliente</h2>
            <Input
                label="Nome do Cliente"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                description="Nome do cliente associado ao serviço"
                isRequired
                aria-label="Nome do cliente"
            />
            <Input
                label="Email do Cliente"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                description="Email do cliente"
                isRequired
                aria-label="Email do cliente"
            />
            <Input
                label="Telefone do Cliente"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                description="Telefone do cliente"
                isRequired
                aria-label="Telefone do cliente"
            />
            <Textarea
                label="Endereço do Cliente"
                value={formData.customer_address}
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                description="Endereço do cliente"
                isRequired
                aria-label="Endereço do cliente"
            />
        </div>
    );
}