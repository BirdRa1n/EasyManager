import { NewTeamFormData } from '@/types/team';
import { Input } from '@heroui/react';

interface LocationSectionProps {
    formData: NewTeamFormData;
    setFormData: (data: NewTeamFormData) => void;
}

export default function LocationSection({ formData, setFormData }: LocationSectionProps) {
    return (
        <div className="space-y-2 w-full">
            <h3 className="text-lg font-medium ">Localização</h3>
            <Input
                isRequired
                label="Localização"
                name="location"
                placeholder="Ex: São Paulo, SP"
                description="Digite a localização da equipe."
                type="text"
                className="w-full"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
        </div>
    );
}