import { Button, Image, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';

interface Attachment {
    file: string | File;
    type: string;
}

interface AttachmentsSectionProps {
    attachments: Attachment[];
    handleAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeAttachment: (index: number) => void;
}

export default function AttachmentsSection({
    attachments,
    handleAttachmentChange,
    removeAttachment,
}: AttachmentsSectionProps) {
    return (
        <div className="mt-5">
            <h2 className="text-2xl font-bold mb-4 p-2">Anexos</h2>
            <Input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                multiple
                description="Adicione arquivos JPEG, PNG ou PDF (máx. 5MB por arquivo)"
                onChange={handleAttachmentChange}
                aria-label="Selecionar anexos"
            />
            {attachments.length > 0 && (
                <div className="mt-4">
                    <Table aria-label="Anexos" removeWrapper>
                        <TableHeader>
                            <TableColumn>ARQUIVO</TableColumn>
                            <TableColumn>TIPO</TableColumn>
                            <TableColumn align="center">AÇÕES</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {attachments.map((attachment, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {typeof attachment.file === 'string' ? (
                                            attachment.type === 'image' ? (
                                                <Image
                                                    src={attachment.file}
                                                    alt={`Anexo ${index + 1}`}
                                                    className="max-w-[100px] max-h-[100px] rounded-md"
                                                />
                                            ) : (
                                                <a
                                                    href={attachment.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                >
                                                    {attachment.file.split('/').pop()}
                                                </a>
                                            )
                                        ) : (
                                            attachment.type === 'image' ? (
                                                <Image
                                                    src={URL.createObjectURL(attachment.file)}
                                                    alt={`Anexo ${index + 1}`}
                                                    className="max-w-[100px] max-h-[100px] rounded-md"
                                                />
                                            ) : (
                                                (attachment.file as File).name
                                            )
                                        )}
                                    </TableCell>
                                    <TableCell className="capitalize">{attachment.type}</TableCell>
                                    <TableCell className="flex flex-row gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            onPress={() => {
                                                const url = typeof attachment.file === 'string' ? attachment.file : URL.createObjectURL(attachment.file);
                                                window.open(url, '_blank');
                                            }}
                                            aria-label={`Visualizar anexo ${index + 1}`}
                                        >
                                            Visualizar
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onPress={() => removeAttachment(index)}
                                            aria-label={`Remover anexo ${index + 1}`}
                                        >
                                            Remover
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}