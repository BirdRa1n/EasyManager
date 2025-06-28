"use client";

import { useServiceForm } from '@/hooks/useServiceForm';
import { Card, CardBody } from '@heroui/react';
import dynamic from 'next/dynamic';
import AttachmentsSection from './AttachmentsSection';
import CustomAttributesSection from './CustomAttributesSection';
import CustomerInfoSection from './CustomerInfoSection';
import FormFooter from './FormFooter';
import ServiceDetailsSection from './ServiceDetailsSection';
import ServiceInfoSection from './ServiceInfoSection';


const ServiceTable = dynamic(() => import('./ServiceTable'), { ssr: false });

export default function ServiceForm() {
    const {
        formData,
        showSaveButton,
        handleSave,
        handleCancel,
        handleAttachmentChange,
        removeAttachment,
        updateCustomAttribute,
        addCustomAttribute,
        removeCustomAttribute,
        setFormData,
    } = useServiceForm();

    if (!formData) {
        return (
            <div className="w-full flex flex-col p-5">
                <ServiceTable />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col p-5">
            <ServiceTable />
            <Card className="w-full flex flex-col mt-10" shadow="none" id="service">
                <CardBody>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <ServiceInfoSection formData={formData} setFormData={setFormData} />
                        <ServiceDetailsSection formData={formData} setFormData={setFormData} />
                        <CustomerInfoSection formData={formData} setFormData={setFormData} />
                        <CustomAttributesSection
                            customAttributes={formData.custom_attributes}
                            updateCustomAttribute={updateCustomAttribute}
                            addCustomAttribute={addCustomAttribute}
                            removeCustomAttribute={removeCustomAttribute}
                        />
                    </div>
                    <AttachmentsSection
                        attachments={formData.attachments}
                        handleAttachmentChange={handleAttachmentChange}
                        removeAttachment={removeAttachment}
                    />
                </CardBody>
                {showSaveButton && (
                    <FormFooter onSave={handleSave} onCancel={handleCancel} />
                )}
            </Card>
        </div>
    );
}