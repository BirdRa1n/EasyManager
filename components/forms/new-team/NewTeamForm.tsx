import { useNewTeamForm } from '@/hooks/useNewTeamForm';
import { ModalBody, ModalHeader } from '@heroui/react';
import FormFooter from './FormFooter';
import LocationSection from './LocationSection';
import LogoSection from './LogoSection';
import ServiceTypesSection from './ServiceTypesSection';
import TeamInfoSection from './TeamInfoSection';
interface NewTeamFormProps {
    onClose: () => void;
}

export default function NewTeamForm({ onClose }: NewTeamFormProps) {
    const {
        formData,
        setFormData,
        loading,
        handleSubmit,
        handleAddServiceType,
        handleRemoveServiceType,
        handleServiceTypeChange,
        handleImageChange,
    } = useNewTeamForm(onClose);

    return (
        <>
            <ModalHeader className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">Bem-vindo!</h2>
                <p className="text-sm text-default-400">
                    Você ainda não possui uma equipe. Preencha o formulário abaixo para criar uma.
                </p>
            </ModalHeader>
            <ModalBody className="space-y-2 overflow-auto scrollbar-none">
                <form onSubmit={handleSubmit}>
                    <LogoSection
                        imageUri={formData.image_uri}
                        handleImageChange={handleImageChange}
                    />
                    <TeamInfoSection formData={formData} setFormData={setFormData} />
                    <ServiceTypesSection
                        serviceTypes={formData.service_types}
                        handleAddServiceType={handleAddServiceType}
                        handleRemoveServiceType={handleRemoveServiceType}
                        handleServiceTypeChange={handleServiceTypeChange}
                    />
                    <LocationSection formData={formData} setFormData={setFormData} />
                    <FormFooter loading={loading} onClose={onClose} />
                </form>
            </ModalBody>
        </>
    );
}