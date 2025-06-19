import { Button, Input } from '@heroui/react';
import { FaTrash } from 'react-icons/fa6';
import { IoMdAdd } from 'react-icons/io';

interface ServiceTypesSectionProps {
    serviceTypes: string[];
    handleAddServiceType: () => void;
    handleRemoveServiceType: (index: number) => void;
    handleServiceTypeChange: (index: number, value: string) => void;
}

export default function ServiceTypesSection({
    serviceTypes,
    handleAddServiceType,
    handleRemoveServiceType,
    handleServiceTypeChange,
}: ServiceTypesSectionProps) {
    return (
        <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tipos de Serviços</h3>
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
                <div key={index} className="flex items-justify gap-3">
                    <Input
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
    );
}