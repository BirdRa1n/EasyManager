import { Input } from '@heroui/react';

interface Attachment {
    file: File;
    type: string;
}

interface AttachmentsSectionProps {
    attachments: Attachment[];
    handleAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AttachmentsSection({ attachments, handleAttachmentChange }: AttachmentsSectionProps) {
    return (
        <div className="w-full">
            <p className="text-default-600 text-sm mb-2">Anexos</p>
            <Input
                name="attachments"
                size="md"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                multiple
                description="Selecione arquivos JPEG, PNG ou PDF (máx. 5MB por arquivo)."
                onChange={handleAttachmentChange}
            />
            {attachments.length > 0 && (
                <div className="mt-2">
                    <p className="text-small text-default-500">Anexos selecionados:</p>
                    <ul className="list-disc pl-5">
                        {attachments.map((a, index) => (
                            <li key={index} className="text-small">
                                {a.file.name} ({a.type})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}