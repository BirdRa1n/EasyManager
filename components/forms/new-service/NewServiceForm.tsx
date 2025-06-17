import { useNewServiceForm } from '@/hooks/useNewServiceForm';
import { ModalBody, ModalHeader } from '@heroui/react';
import AttachmentsSection from './AttachmentsSection';
import CustomAttributesSection from './CustomAttributesSection';
import CustomerInfoSection from './CustomerInfoSection';
import FormFooter from './FormFooter';
import ServiceInfoSection from './ServiceInfoSection';

interface NewServiceFormProps {
    onClose: () => void;
}

export default function NewServiceForm({ onClose }: NewServiceFormProps) {
    const {
        formData,
        setFormData,
        loading,
        handleSubmit,
        addCustomAttribute,
        updateCustomAttribute,
        removeCustomAttribute,
        handleAttachmentChange,
    } = useNewServiceForm(onClose);

    return (
        <>
            <ModalHeader className="flex flex-col gap-1">Adicionar serviço</ModalHeader>
            <ModalBody>
                <div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                        <div className="w-full grid grid-cols-1 gap-4 lg:grid-cols-2 flex-grow">
                            <ServiceInfoSection formData={formData} setFormData={setFormData} />
                            <div>
                                <CustomerInfoSection formData={formData} setFormData={setFormData} />
                                <CustomAttributesSection
                                    customAttributes={formData.custom_attributes}
                                    addCustomAttribute={addCustomAttribute}
                                    updateCustomAttribute={updateCustomAttribute}
                                    removeCustomAttribute={removeCustomAttribute}
                                />
                                <AttachmentsSection
                                    attachments={formData.attachments}
                                    handleAttachmentChange={handleAttachmentChange}
                                />
                            </div>
                        </div>
                        <FormFooter loading={loading} />
                    </form>
                </div>
            </ModalBody>
        </>
    );
}