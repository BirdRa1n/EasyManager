import { NewTeamFormData } from '@/types/team';
import { Input } from '@heroui/react';

interface TeamInfoSectionProps {
    formData: NewTeamFormData;
    setFormData: (data: NewTeamFormData) => void;
}

export default function TeamInfoSection({ formData, setFormData }: TeamInfoSectionProps) {
    return (
        <div className="space-y-2 w-full">
            <h3 className="text-lg font-medium ">Informações da Equipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    isRequired
                    label="Nome"
                    name="name"
                    placeholder="Nome da equipe"
                    description="Digite o nome da sua equipe."
                    type="text"
                    className="w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                    isRequired
                    label="Documento"
                    name="document"
                    placeholder="Ex: 12.345.678/0001-90"
                    description="Digite o documento da equipe (CNPJ ou CPF)."
                    type="text"
                    className="w-full"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
            </div>
        </div>
    );
}